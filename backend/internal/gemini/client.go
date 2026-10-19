package gemini

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"sales-intelligence-backend/internal/ai"
)

const generateContentEndpoint = "https://generativelanguage.googleapis.com/v1beta/models"

type Client struct {
	apiKey     string
	model      string
	endpoint   string
	httpClient *http.Client
}

func NewClient(apiKey, model string) *Client {
	return &Client{
		apiKey:   strings.TrimSpace(apiKey),
		model:    normalizeModel(model),
		endpoint: generateContentEndpoint,
		httpClient: &http.Client{
			Timeout: 45 * time.Second,
		},
	}
}

// part mirrors the Gemini REST Part type. ThoughtSignature must be preserved
// when a Gemini 3 model returns a functionCall, otherwise the follow-up
// functionResponse request is rejected by the API.
type part struct {
	Text             string            `json:"text,omitempty"`
	FunctionCall     *functionCall     `json:"functionCall,omitempty"`
	FunctionResponse *functionResponse `json:"functionResponse,omitempty"`
	ThoughtSignature string            `json:"thoughtSignature,omitempty"`
}

type functionCall struct {
	ID   string         `json:"id,omitempty"`
	Name string         `json:"name"`
	Args map[string]any `json:"args"`
}

type functionResponse struct {
	ID       string         `json:"id,omitempty"`
	Name     string         `json:"name"`
	Response map[string]any `json:"response"`
}

type content struct {
	Role  string `json:"role,omitempty"`
	Parts []part `json:"parts"`
}

type geminiTool struct {
	FunctionDeclarations []ai.Tool `json:"functionDeclarations"`
}

type functionCallingConfig struct {
	Mode string `json:"mode"`
}

type toolConfig struct {
	FunctionCallingConfig functionCallingConfig `json:"functionCallingConfig"`
}

type generateContentRequest struct {
	SystemInstruction content      `json:"systemInstruction"`
	Contents          []content    `json:"contents"`
	Tools             []geminiTool `json:"tools,omitempty"`
	ToolConfig        *toolConfig  `json:"toolConfig,omitempty"`
	GenerationConfig  struct {
		MaxOutputTokens int `json:"maxOutputTokens"`
	} `json:"generationConfig"`
}

type generateContentResponse struct {
	Candidates []struct {
		Content content `json:"content"`
	} `json:"candidates"`
	ModelVersion string `json:"modelVersion"`
	ResponseID   string `json:"responseId"`
	Error        *struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Status  string `json:"status"`
	} `json:"error"`
}

func (c *Client) Generate(
	ctx context.Context,
	instructions string,
	messages []ai.Message,
) (ai.GenerateResult, error) {
	if err := c.validateConfiguration(); err != nil {
		return ai.GenerateResult{}, err
	}

	response, err := c.generate(ctx, newGenerateContentRequest(instructions, messages))
	if err != nil {
		return ai.GenerateResult{}, err
	}

	return c.resultFromResponse(response)
}

// GenerateWithTools follows the Gemini function-calling loop:
// 1. Gemini selects a declared function and returns JSON arguments.
// 2. The backend validates and executes that allowlisted function.
// 3. The sanitized result is sent back to Gemini for the final answer.
//
// One tool is permitted per chat turn, making database access predictable and
// ensuring each answer has a narrowly scoped, validated data source.
func (c *Client) GenerateWithTools(
	ctx context.Context,
	instructions string,
	messages []ai.Message,
	tools []ai.Tool,
	execute ai.ToolExecutor,
) (ai.GenerateResult, error) {
	if err := c.validateConfiguration(); err != nil {
		return ai.GenerateResult{}, err
	}
	if len(tools) == 0 {
		return ai.GenerateResult{}, errors.New("setidaknya satu function harus dideklarasikan")
	}
	if execute == nil {
		return ai.GenerateResult{}, errors.New("executor function belum tersedia")
	}

	payload := newGenerateContentRequest(instructions, messages)
	payload.Tools = []geminiTool{{FunctionDeclarations: tools}}
	payload.ToolConfig = &toolConfig{
		FunctionCallingConfig: functionCallingConfig{Mode: "ANY"},
	}

	toolSelection, err := c.generate(ctx, payload)
	if err != nil {
		return ai.GenerateResult{}, err
	}
	if len(toolSelection.Candidates) == 0 {
		return ai.GenerateResult{}, ai.ErrEmptyResponse
	}

	selectedContent := toolSelection.Candidates[0].Content
	calls := functionCalls(selectedContent)
	if len(calls) != 1 {
		return ai.GenerateResult{}, fmt.Errorf(
			"Gemini harus memilih tepat satu function, menerima %d",
			len(calls),
		)
	}

	call := calls[0]
	result, err := execute(ctx, ai.ToolCall{
		ID:        call.ID,
		Name:      call.Name,
		Arguments: call.Args,
	})
	if err != nil {
		return ai.GenerateResult{}, fmt.Errorf(
			"function %q ditolak atau gagal dieksekusi: %w",
			call.Name,
			err,
		)
	}

	sanitizedResult, err := asFunctionResponse(result)
	if err != nil {
		return ai.GenerateResult{}, fmt.Errorf(
			"hasil function %q tidak dapat diproses: %w",
			call.Name,
			err,
		)
	}

	// Keep the model content exactly as returned. Gemini 3 function calls may
	// contain a thoughtSignature that is required by the follow-up request.
	payload.Contents = append(payload.Contents,
		selectedContent,
		content{
			Role: "user",
			Parts: []part{{
				FunctionResponse: &functionResponse{
					ID:       call.ID,
					Name:     call.Name,
					Response: sanitizedResult,
				},
			}},
		},
	)
	// The second request produces the final answer only. Gemini cannot call an
	// additional database tool in the same chat turn.
	payload.ToolConfig = &toolConfig{
		FunctionCallingConfig: functionCallingConfig{Mode: "NONE"},
	}

	finalResponse, err := c.generate(ctx, payload)
	if err != nil {
		return ai.GenerateResult{}, err
	}

	return c.resultFromResponse(finalResponse)
}

func newGenerateContentRequest(
	instructions string,
	messages []ai.Message,
) generateContentRequest {
	payload := generateContentRequest{
		SystemInstruction: content{Parts: []part{{Text: instructions}}},
		Contents:          make([]content, 0, len(messages)),
	}
	payload.GenerationConfig.MaxOutputTokens = 800

	for _, message := range messages {
		role := "user"
		if message.Role == "assistant" {
			role = "model"
		}
		payload.Contents = append(payload.Contents, content{
			Role:  role,
			Parts: []part{{Text: message.Content}},
		})
	}

	return payload
}

func (c *Client) validateConfiguration() error {
	if c.apiKey == "" || c.model == "" {
		return ai.ErrNotConfigured
	}
	return nil
}

func (c *Client) generate(
	ctx context.Context,
	payload generateContentRequest,
) (generateContentResponse, error) {
	body, err := json.Marshal(payload)
	if err != nil {
		return generateContentResponse{}, fmt.Errorf("gagal membuat request Gemini: %w", err)
	}

	endpoint := fmt.Sprintf(
		"%s/%s:generateContent",
		strings.TrimRight(c.endpoint, "/"),
		url.PathEscape(c.model),
	)
	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		endpoint,
		bytes.NewReader(body),
	)
	if err != nil {
		return generateContentResponse{}, fmt.Errorf("gagal membuat HTTP request Gemini: %w", err)
	}
	req.Header.Set("x-goog-api-key", c.apiKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return generateContentResponse{}, fmt.Errorf("gagal menghubungi Gemini: %w", err)
	}
	defer resp.Body.Close()

	decoder := json.NewDecoder(io.LimitReader(resp.Body, 2<<20))
	var response generateContentResponse
	if err := decoder.Decode(&response); err != nil {
		return generateContentResponse{}, fmt.Errorf("gagal membaca respons Gemini: %w", err)
	}

	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		message := http.StatusText(resp.StatusCode)
		if response.Error != nil && strings.TrimSpace(response.Error.Message) != "" {
			message = response.Error.Message
		}
		return generateContentResponse{}, fmt.Errorf(
			"Gemini merespons dengan status %d: %s",
			resp.StatusCode,
			message,
		)
	}

	return response, nil
}

func (c *Client) resultFromResponse(
	response generateContentResponse,
) (ai.GenerateResult, error) {
	var texts []string
	for _, candidate := range response.Candidates {
		for _, responsePart := range candidate.Content.Parts {
			if text := strings.TrimSpace(responsePart.Text); text != "" {
				texts = append(texts, text)
			}
		}
	}

	answer := strings.Join(texts, "\n")
	if answer == "" {
		return ai.GenerateResult{}, ai.ErrEmptyResponse
	}

	model := strings.TrimSpace(response.ModelVersion)
	if model == "" {
		model = c.model
	}

	return ai.GenerateResult{
		Text:       answer,
		ResponseID: response.ResponseID,
		Model:      model,
	}, nil
}

func functionCalls(content content) []functionCall {
	calls := make([]functionCall, 0, len(content.Parts))
	for _, responsePart := range content.Parts {
		if responsePart.FunctionCall != nil {
			calls = append(calls, *responsePart.FunctionCall)
		}
	}
	return calls
}

func asFunctionResponse(value any) (map[string]any, error) {
	payload, err := json.Marshal(value)
	if err != nil {
		return nil, err
	}

	var decoded any
	if err := json.Unmarshal(payload, &decoded); err != nil {
		return nil, err
	}
	if decoded == nil {
		return map[string]any{"result": nil}, nil
	}
	if response, ok := decoded.(map[string]any); ok {
		return response, nil
	}

	// FunctionResponse.response must be a JSON object. List results, such as
	// compare_regions, are therefore wrapped in a stable top-level key.
	return map[string]any{"result": decoded}, nil
}

func normalizeModel(model string) string {
	return strings.TrimPrefix(strings.TrimSpace(model), "models/")
}

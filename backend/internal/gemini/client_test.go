package gemini

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"testing"

	"sales-intelligence-backend/internal/ai"
)

type roundTripFunc func(*http.Request) (*http.Response, error)

func (fn roundTripFunc) RoundTrip(request *http.Request) (*http.Response, error) {
	return fn(request)
}

func TestGenerateBuildsGeminiRequestAndCollectsText(t *testing.T) {
	client := NewClient("test-key", "models/test-model")
	client.endpoint = "https://example.test/v1beta/models"
	client.httpClient = &http.Client{
		Transport: roundTripFunc(func(request *http.Request) (*http.Response, error) {
			if got := request.Header.Get("x-goog-api-key"); got != "test-key" {
				t.Fatalf("x-goog-api-key header = %q", got)
			}
			if got := request.URL.String(); got != "https://example.test/v1beta/models/test-model:generateContent" {
				t.Fatalf("request URL = %q", got)
			}

			var body generateContentRequest
			if err := json.NewDecoder(request.Body).Decode(&body); err != nil {
				t.Fatalf("decode request body: %v", err)
			}
			if got := body.SystemInstruction.Parts[0].Text; got != "instruksi" {
				t.Fatalf("system instruction = %q", got)
			}
			if got := body.Contents[1].Role; got != "model" {
				t.Fatalf("assistant role mapped to %q", got)
			}

			response := `{
				"responseId":"response-test",
				"modelVersion":"test-model-001",
				"candidates":[{"content":{"parts":[
					{"text":"Jawaban pertama."},
					{"text":"Jawaban kedua."}
				]}}]
			}`
			return &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(strings.NewReader(response)),
				Header:     make(http.Header),
			}, nil
		}),
	}

	result, err := client.Generate(context.Background(), "instruksi", []ai.Message{
		{Role: "user", Content: "pertanyaan"},
		{Role: "assistant", Content: "jawaban sebelumnya"},
	})
	if err != nil {
		t.Fatalf("Generate() error = %v", err)
	}
	if result.Text != "Jawaban pertama.\nJawaban kedua." {
		t.Fatalf("Generate() text = %q", result.Text)
	}
	if result.ResponseID != "response-test" {
		t.Fatalf("Generate() response ID = %q", result.ResponseID)
	}
	if result.Model != "test-model-001" {
		t.Fatalf("Generate() model = %q", result.Model)
	}
}

func TestGenerateRequiresConfiguration(t *testing.T) {
	client := NewClient("", "")

	_, err := client.Generate(context.Background(), "instruksi", nil)
	if err != ai.ErrNotConfigured {
		t.Fatalf("Generate() error = %v, want %v", err, ai.ErrNotConfigured)
	}
}

func TestGenerateWithToolsExecutesValidatedToolAndReturnsFinalAnswer(t *testing.T) {
	client := NewClient("test-key", "test-model")
	client.endpoint = "https://example.test/v1beta/models"

	requests := 0
	client.httpClient = &http.Client{
		Transport: roundTripFunc(func(request *http.Request) (*http.Response, error) {
			requests++
			var body generateContentRequest
			if err := json.NewDecoder(request.Body).Decode(&body); err != nil {
				t.Fatalf("decode request body: %v", err)
			}

			switch requests {
			case 1:
				if body.ToolConfig == nil || body.ToolConfig.FunctionCallingConfig.Mode != "ANY" {
					t.Fatalf("first function mode = %#v, want ANY", body.ToolConfig)
				}
				if len(body.Tools) != 1 || len(body.Tools[0].FunctionDeclarations) != 1 {
					t.Fatalf("first request function declarations = %#v", body.Tools)
				}
				response := `{
					"candidates":[{"content":{"role":"model","parts":[{
						"functionCall":{"id":"call-123","name":"list_sales","args":{"limit":5}},
						"thoughtSignature":"signed-thought"
					}]}}]
				}`
				return responseWithJSON(response), nil
			case 2:
				if body.ToolConfig == nil || body.ToolConfig.FunctionCallingConfig.Mode != "NONE" {
					t.Fatalf("second function mode = %#v, want NONE", body.ToolConfig)
				}
				if got := body.Contents[len(body.Contents)-2].Parts[0].ThoughtSignature; got != "signed-thought" {
					t.Fatalf("thought signature = %q", got)
				}
				responsePart := body.Contents[len(body.Contents)-1].Parts[0].FunctionResponse
				if responsePart == nil {
					t.Fatal("second request is missing function response")
				}
				if responsePart.ID != "call-123" || responsePart.Name != "list_sales" {
					t.Fatalf("function response = %#v", responsePart)
				}
				if got := responsePart.Response["total"]; got != float64(1) {
					t.Fatalf("function result total = %#v", got)
				}
				return responseWithJSON(`{
					"responseId":"final-response",
					"modelVersion":"test-model-final",
					"candidates":[{"content":{"parts":[{"text":"Jawaban akhir."}]}}]
				}`), nil
			default:
				t.Fatalf("unexpected request %d", requests)
				return nil, nil
			}
		}),
	}

	executed := false
	result, err := client.GenerateWithTools(
		context.Background(),
		"instruksi",
		[]ai.Message{{Role: "user", Content: "Siapa yang tertinggi?"}},
		[]ai.Tool{{Name: "list_sales", Parameters: map[string]any{"type": "object"}}},
		func(_ context.Context, call ai.ToolCall) (any, error) {
			executed = true
			if call.ID != "call-123" || call.Name != "list_sales" {
				t.Fatalf("tool call = %#v", call)
			}
			if got := call.Arguments["limit"]; got != float64(5) {
				t.Fatalf("tool limit = %#v", got)
			}
			return map[string]any{"total": 1}, nil
		},
	)
	if err != nil {
		t.Fatalf("GenerateWithTools() error = %v", err)
	}
	if !executed {
		t.Fatal("tool executor was not called")
	}
	if requests != 2 {
		t.Fatalf("requests = %d, want 2", requests)
	}
	if result.Text != "Jawaban akhir." || result.ResponseID != "final-response" {
		t.Fatalf("result = %#v", result)
	}
}

func responseWithJSON(body string) *http.Response {
	return &http.Response{
		StatusCode: http.StatusOK,
		Body:       io.NopCloser(strings.NewReader(body)),
		Header:     make(http.Header),
	}
}

func TestAsFunctionResponseWrapsArrayValues(t *testing.T) {
	response, err := asFunctionResponse([]string{"Jakarta", "Bandung"})
	if err != nil {
		t.Fatalf("asFunctionResponse() error = %v", err)
	}
	items, ok := response["result"].([]any)
	if !ok || len(items) != 2 || items[0] != "Jakarta" {
		t.Fatalf("response = %#v", response)
	}
}

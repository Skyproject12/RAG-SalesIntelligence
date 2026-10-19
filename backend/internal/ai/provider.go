package ai

import (
	"context"
	"errors"
)

var (
	ErrNotConfigured = errors.New("provider AI belum dikonfigurasi")
	ErrEmptyResponse = errors.New("provider AI tidak mengembalikan jawaban teks")
)

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type GenerateResult struct {
	Text       string
	ResponseID string
	Model      string
}

// Tool describes one backend capability that the model may request. The
// Parameters value follows the JSON Schema subset supported by Gemini.
type Tool struct {
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Parameters  map[string]any `json:"parameters"`
}

// ToolCall is a structured request selected by the model. It never contains
// SQL; Name must be matched against an allowlist by the service layer.
type ToolCall struct {
	ID        string
	Name      string
	Arguments map[string]any
}

type ToolExecutor func(ctx context.Context, call ToolCall) (any, error)

type ToolGenerator interface {
	GenerateWithTools(
		ctx context.Context,
		instructions string,
		messages []Message,
		tools []Tool,
		execute ToolExecutor,
	) (GenerateResult, error)
}

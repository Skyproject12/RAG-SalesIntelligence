package model

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Question string        `json:"question"`
	History  []ChatMessage `json:"history"`
}

type ChatResult struct {
	Answer     string `json:"answer"`
	ResponseID string `json:"response_id,omitempty"`
	Model      string `json:"model"`
}

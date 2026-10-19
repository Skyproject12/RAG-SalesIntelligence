export type ChatRole = "user" | "assistant";

export interface ChatHistoryMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  question: string;
  history: ChatHistoryMessage[];
}

export interface ChatResult {
  answer: string;
  responseId?: string;
  model: string;
}

export interface ChatMessage extends ChatHistoryMessage {
  id: string;
  time: string;
}

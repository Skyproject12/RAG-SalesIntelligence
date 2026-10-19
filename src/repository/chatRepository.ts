import type { ChatRequest, ChatResult } from "@/types/chat";

interface ChatApiResponse {
  data: {
    answer: string;
    response_id?: string;
    model: string;
  };
}

interface ChatErrorResponse {
  error?: string;
}

export class ChatApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ChatApiError";
    this.status = status;
  }
}

async function send(request: ChatRequest): Promise<ChatResult> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  const url = new URL("/api/v1/ai/chat", apiUrl);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let message = "AI Assistant sedang tidak tersedia.";

    try {
      const payload = (await response.json()) as ChatErrorResponse;
      if (payload.error?.trim()) message = payload.error;
    } catch {
      // Gunakan pesan aman di atas bila backend tidak mengembalikan JSON.
    }

    throw new ChatApiError(message, response.status);
  }

  const result = (await response.json()) as ChatApiResponse;
  if (!result.data?.answer || !result.data.model) {
    throw new ChatApiError("Format respons AI tidak valid.", response.status);
  }

  return {
    answer: result.data.answer,
    responseId: result.data.response_id,
    model: result.data.model,
  };
}

export const chatRepository = {
  send,
};

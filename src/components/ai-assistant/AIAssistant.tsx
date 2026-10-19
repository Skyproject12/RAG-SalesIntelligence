"use client";

import {
  AlertCircle,
  Lightbulb,
  LoaderCircle,
  Send,
  Sparkles,
} from "lucide-react";
import {
  Fragment,
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import useSWRMutation from "swr/mutation";

import {
  ChatApiError,
  chatRepository,
} from "@/repository/chatRepository";
import type {
  ChatHistoryMessage,
  ChatMessage,
  ChatRequest,
  ChatResult,
} from "@/types/chat";

import { SuggestedQuestions } from "./SuggestedQuestions";

const chatEndpoint = "/api/v1/ai/chat";

function currentTime(): string {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function createMessage(
  role: ChatMessage["role"],
  content: string,
): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
    time: currentTime(),
  };
}

function chatMutation(
  _key: string,
  { arg }: { arg: ChatRequest },
): Promise<ChatResult> {
  return chatRepository.send(arg);
}

export function AIAssistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [requestError, setRequestError] = useState("");
  const conversationRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { trigger, isMutating } = useSWRMutation<
    ChatResult,
    ChatApiError,
    string,
    ChatRequest
  >(chatEndpoint, chatMutation);

  useEffect(() => {
    const conversation = conversationRef.current;
    conversation?.scrollTo({
      top: conversation.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isMutating, requestError]);

  async function submitQuestion(rawQuestion: string) {
    const value = rawQuestion.trim();
    if (value.length < 3 || isMutating) return;

    const history: ChatHistoryMessage[] = messages.map(
      ({ role, content }) => ({ role, content }),
    );
    const userMessage = createMessage("user", value);

    setQuestion("");
    setRequestError("");
    setMessages((current) => [...current, userMessage]);

    try {
      const result = await trigger({ question: value, history });
      setMessages((current) => [
        ...current,
        createMessage("assistant", result.answer),
      ]);
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat meminta jawaban AI.",
      );
    } finally {
      inputRef.current?.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitQuestion(question);
  }

  const hasConversation = messages.length > 0 || isMutating || requestError;

  return (
    <section
      className={`flex h-[min(680px,calc(100dvh-220px))] min-h-[480px] flex-col overflow-hidden rounded-[11px] border border-[#dce9fa] bg-white/90 shadow-[0_2px_8px_rgba(34,98,173,0.04)] ${
        hasConversation
          ? "px-5 py-7 sm:px-8"
          : "px-5 py-10 sm:px-10 sm:py-11"
      }`}
    >
      {hasConversation ? (
        <ConversationHeader />
      ) : (
        <div className="flex flex-col items-center text-center">
          <RobotIllustration />
          <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#07173a]">
            AI Assistant
          </h2>
          <p className="mt-2 text-[15px] text-[#7888ae]">
            Tanyakan apa saja tentang performa tim sales.
          </p>
        </div>
      )}

      <div className={hasConversation ? "mt-6" : "mt-11"}>
        <SuggestedQuestions
          disabled={isMutating}
          onSelect={(value) => void submitQuestion(value)}
        />
      </div>

      {hasConversation && (
        <div
          ref={conversationRef}
          className="mt-8 min-h-0 flex-1 space-y-7 overflow-y-auto px-1 pb-24 pr-2"
          aria-live="polite"
          aria-label="Riwayat percakapan"
        >
          {messages.map((message) =>
            message.role === "user" ? (
              <UserMessage key={message.id} message={message} />
            ) : (
              <AssistantMessage key={message.id} message={message} />
            ),
          )}
          {isMutating && <AssistantLoading />}
          {requestError && <AssistantError message={requestError} />}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={`fixed bottom-5 left-5 right-5 z-50 flex h-[70px] items-center gap-4 rounded-[11px] border border-[#dbe7f8] bg-white px-4 shadow-[0_8px_24px_rgba(36,91,160,0.14)] sm:bottom-6 sm:left-10 sm:right-10 sm:px-5 lg:left-[282px] lg:right-12 ${
          hasConversation ? "mt-7" : "mt-auto"
        }`}
      >
        <Sparkles
          aria-hidden="true"
          className="size-5 shrink-0 fill-[#1680f7] text-[#1680f7]"
        />
        <label htmlFor="assistant-question" className="sr-only">
          Pertanyaan untuk AI Assistant
        </label>
        <input
          ref={inputRef}
          id="assistant-question"
          name="question"
          type="text"
          minLength={3}
          maxLength={1000}
          autoComplete="off"
          value={question}
          disabled={isMutating}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Tanyakan sesuatu tentang performa tim sales..."
          className="min-w-0 flex-1 bg-transparent text-[14px] text-[#17284e] outline-none placeholder:text-[#8797bc] disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={question.trim().length < 3 || isMutating}
          aria-label={isMutating ? "Sedang mengirim pertanyaan" : "Kirim pertanyaan"}
          className="grid size-12 shrink-0 place-items-center rounded-full bg-[#1680f7] text-white shadow-[0_7px_15px_rgba(22,128,247,0.24)] transition hover:bg-[#086fdf] disabled:cursor-not-allowed disabled:bg-[#a9cbee] disabled:shadow-none"
        >
          {isMutating ? (
            <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
          ) : (
            <Send aria-hidden="true" className="size-5" strokeWidth={1.8} />
          )}
        </button>
      </form>
    </section>
  );
}

function ConversationHeader() {
  return (
    <div className="flex items-start gap-5">
      <Sparkles
        aria-hidden="true"
        className="mt-0.5 size-10 shrink-0 fill-[#167cf5] text-[#167cf5]"
        strokeWidth={1.8}
      />
      <div>
        <h2 className="text-[28px] font-bold tracking-[-0.025em] text-[#07173a]">
          AI Assistant
        </h2>
        <p className="mt-1 text-[15px] text-[#7888ae]">
          Tanyakan apa saja tentang performa tim sales.
        </p>
      </div>
    </div>
  );
}

function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex items-center justify-end gap-3 pl-8 sm:pl-24">
      <time className="shrink-0 text-[12px] text-[#8495b9]">
        {message.time}
      </time>
      <div className="max-w-[660px] rounded-[16px] rounded-tr-[5px] bg-gradient-to-r from-[#147cf1] to-[#0879f8] px-5 py-3.5 text-[14px] leading-6 text-white shadow-[0_8px_18px_rgba(20,124,241,0.16)]">
        {message.content}
      </div>
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#edf2fa] text-[13px] font-semibold text-[#18305e]">
        KS
      </span>
    </div>
  );
}

function AssistantMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 grid size-10 shrink-0 place-items-center rounded-full bg-[#edf6ff] text-[#117af1]">
        <Sparkles aria-hidden="true" className="size-5 fill-current" />
      </span>
      <div className="min-w-0 flex-1">
        <time className="mb-2 block text-[12px] text-[#8495b9]">
          {message.time}
        </time>
        <div className="rounded-[12px] border border-[#e0e9f6] bg-white px-5 py-5 text-[14px] leading-6 text-[#1a2d54] shadow-[0_7px_20px_rgba(27,77,137,0.08)] sm:px-6">
          <AnswerContent content={message.content} />
        </div>
      </div>
    </div>
  );
}

function AssistantLoading() {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#edf6ff] text-[#117af1]">
        <Sparkles aria-hidden="true" className="size-5 fill-current" />
      </span>
      <div className="flex items-center gap-3 rounded-[12px] border border-[#e0e9f6] bg-white px-5 py-4 text-[13px] text-[#6e82aa] shadow-[0_7px_20px_rgba(27,77,137,0.06)]">
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin text-[#147cf1]" />
        Sky sedang menganalisis data sales...
      </div>
    </div>
  );
}

function AssistantError({ message }: { message: string }) {
  return (
    <div className="ml-[52px] flex items-start gap-3 rounded-[12px] border border-[#ffd6d6] bg-[#fff8f8] px-5 py-4 text-[13px] text-[#a43a3a]">
      <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div>
        <p className="font-semibold">Jawaban tidak dapat dimuat.</p>
        <p className="mt-0.5">{message}</p>
      </div>
    </div>
  );
}

type AnswerBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "insight"; text: string };

function AnswerContent({ content }: { content: string }) {
  const blocks = parseAnswer(content);

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        if (block.type === "table") {
          return <AnswerTable key={`table-${index}`} block={block} />;
        }
        if (block.type === "list") {
          return (
            <ul key={`list-${index}`} className="list-disc space-y-1 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "insight") {
          return (
            <div
              key={`insight-${index}`}
              className="flex gap-3 rounded-[12px] bg-[#f0f7ff] px-5 py-4"
            >
              <Lightbulb
                aria-hidden="true"
                className="mt-0.5 size-6 shrink-0 text-[#147cf1]"
              />
              <div>
                <p className="font-semibold text-[#1269d7]">Insight</p>
                <p className="mt-0.5 text-[#52698f]">{renderInline(block.text)}</p>
              </div>
            </div>
          );
        }
        return (
          <p key={`paragraph-${index}`} className="whitespace-pre-line">
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}

function AnswerTable({
  block,
}: {
  block: Extract<AnswerBlock, { type: "table" }>;
}) {
  return (
    <div className="overflow-x-auto rounded-[11px] border border-[#e4ebf5]">
      <table className="w-full min-w-[620px] border-collapse text-left text-[13px]">
        <thead className="bg-[#f3f6fb] text-[#20365e]">
          <tr>
            {block.headers.map((header, index) => (
              <th key={`${header}-${index}`} className="px-4 py-3 font-semibold">
                {renderInline(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`} className="border-t border-[#e8eef6]">
              {block.headers.map((_, cellIndex) => (
                <td key={`cell-${cellIndex}`} className="px-4 py-2.5 align-top">
                  {renderInline(row[cellIndex] ?? "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function parseAnswer(content: string): AnswerBlock[] {
  const lines = content.replace(/\r/g, "").split("\n");
  const blocks: AnswerBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    if (
      line.includes("|") &&
      index + 1 < lines.length &&
      isTableDivider(lines[index + 1])
    ) {
      const headers = tableCells(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index].includes("|")) {
        const cells = tableCells(lines[index]);
        if (cells.length > 0) rows.push(cells);
        index += 1;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    const insightMatch = line.match(
      /^(?:#{1,4}\s*)?(?:\*\*)?Insight(?:\*\*)?\s*:?\s*(.*)$/i,
    );
    if (insightMatch) {
      const insightLines = [insightMatch[1]];
      index += 1;
      while (index < lines.length && lines[index].trim()) {
        insightLines.push(lines[index].trim());
        index += 1;
      }
      blocks.push({
        type: "insight",
        text: insightLines.filter(Boolean).join(" "),
      });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    const paragraphLines = [line.replace(/^#{1,4}\s+/, "")];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].includes("|") &&
      !/^[-*]\s+/.test(lines[index].trim()) &&
      !/^(?:#{1,4}\s*)?(?:\*\*)?Insight/i.test(lines[index].trim())
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraphLines.join("\n") });
  }

  return blocks.length > 0 ? blocks : [{ type: "paragraph", text: content }];
}

function isTableDivider(line: string): boolean {
  const cells = tableCells(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function tableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderInline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
  });
}

function RobotIllustration() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 170 132"
      className="mb-3 h-[126px] w-[162px] overflow-visible"
      fill="none"
    >
      <defs>
        <linearGradient id="robot-face" x1="85" y1="48" x2="85" y2="98">
          <stop stopColor="#318AF7" />
          <stop offset="1" stopColor="#1859D7" />
        </linearGradient>
        <linearGradient id="speech-bubble" x1="126" y1="28" x2="160" y2="58">
          <stop stopColor="#3B96FA" />
          <stop offset="1" stopColor="#2378E8" />
        </linearGradient>
        <filter id="robot-shadow" x="35" y="29" width="102" height="104">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#277CE8" floodOpacity="0.14" />
        </filter>
      </defs>

      <circle cx="78" cy="68" r="57" fill="#F6FAFF" />
      <circle cx="44" cy="59" r="24" fill="#EFF6FF" opacity="0.85" />
      <circle cx="111" cy="87" r="31" fill="#EDF5FF" opacity="0.8" />
      <circle cx="26" cy="54" r="5" fill="#E5F1FF" />
      <circle cx="33" cy="42" r="5" fill="#ECF5FF" />
      <circle cx="126" cy="85" r="4" fill="#E9F3FF" />
      <circle cx="143" cy="90" r="3" fill="#EDF5FF" />
      <path d="M39 75c-9-9-8-24 2-32" stroke="#E9F3FF" strokeWidth="9" strokeLinecap="round" />
      <path d="M119 101c9-5 15-14 17-24" stroke="#EEF6FF" strokeWidth="7" strokeLinecap="round" />
      <path d="M86 31V20" stroke="#76ADF4" strokeWidth="5" strokeLinecap="round" />
      <circle cx="86" cy="16" r="7" fill="#7DB3F5" />
      <g filter="url(#robot-shadow)">
        <rect x="46" y="36" width="80" height="81" rx="36" fill="white" />
        <rect x="55" y="48" width="62" height="52" rx="24" fill="url(#robot-face)" />
        <circle cx="74" cy="73" r="5" fill="white" />
        <circle cx="99" cy="73" r="5" fill="white" />
        <path d="M78 86c5 4 12 4 17 0" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M67 105c12 5 26 5 38 0" stroke="#E8F1FD" strokeWidth="4" strokeLinecap="round" />
      </g>
      <path d="M124 26h28c8 0 14 6 14 14v12c0 8-6 14-14 14h-10l-8 7v-7h-10c-8 0-14-6-14-14V40c0-8 6-14 14-14Z" fill="url(#speech-bubble)" />
      <circle cx="130" cy="46" r="2.3" fill="white" />
      <circle cx="138" cy="46" r="2.3" fill="white" />
      <circle cx="146" cy="46" r="2.3" fill="white" />
    </svg>
  );
}

import { Send, Sparkles } from "lucide-react";

import { SuggestedQuestions } from "./SuggestedQuestions";

export function AIAssistant() {
  return (
    <section className="rounded-[11px] border border-[#dce9fa] bg-white/90 px-5 py-10 shadow-[0_2px_8px_rgba(34,98,173,0.04)] sm:px-10 sm:py-11">
      <div className="flex flex-col items-center text-center">
        <RobotIllustration />

        <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#07173a]">
          AI Assistant
        </h2>
        <p className="mt-2 text-[15px] text-[#7888ae]">
          Tanyakan apa saja tentang performa tim sales.
        </p>
      </div>

      <div className="mt-11">
        <SuggestedQuestions />
      </div>

      <form className="mt-[50px] flex h-[70px] items-center gap-4 rounded-[11px] border border-[#dbe7f8] bg-white px-4 shadow-[0_3px_12px_rgba(36,91,160,0.06)] sm:px-5">
        <Sparkles
          aria-hidden="true"
          className="size-5 shrink-0 fill-[#1680f7] text-[#1680f7]"
        />
        <label htmlFor="assistant-question" className="sr-only">
          Pertanyaan untuk AI Assistant
        </label>
        <input
          id="assistant-question"
          name="question"
          type="text"
          placeholder="Tanyakan sesuatu tentang performa tim..."
          className="min-w-0 flex-1 bg-transparent text-[14px] text-[#17284e] outline-none placeholder:text-[#8797bc]"
        />
        <button
          type="submit"
          aria-label="Kirim pertanyaan"
          className="grid size-12 shrink-0 place-items-center rounded-full bg-[#1680f7] text-white shadow-[0_7px_15px_rgba(22,128,247,0.24)] transition hover:bg-[#086fdf]"
        >
          <Send aria-hidden="true" className="size-5" strokeWidth={1.8} />
        </button>
      </form>
    </section>
  );
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

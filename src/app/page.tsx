import { Sparkles } from "lucide-react";

import { AIAssistant } from "@/components/ai-assistant/AIAssistant";

export default function HomePage() {
  return (
    <section className="mx-auto max-w-[1154px]">
      <div className="flex items-start gap-5 lg:-ml-6">
        <Sparkles
          aria-hidden="true"
          className="mt-0.5 size-9 shrink-0 fill-[#167cf5] text-[#167cf5]"
          strokeWidth={1.8}
        />
        <div>
          <h1 className="text-[28px] font-bold leading-tight tracking-[-0.025em] text-[#061536] sm:text-[30px]">
            Welcome, Admin!
          </h1>
          <p className="mt-2 max-w-[520px] text-[15px] leading-6 text-[#7586ae]">
            Gunakan AI Assistant untuk menanyakan informasi seputar
            <br className="hidden sm:block" /> performa tim sales dengan cepat
            dan mudah.
          </p>
        </div>
      </div>

      <div className="mt-9">
        <AIAssistant />
      </div>
    </section>
  );
}

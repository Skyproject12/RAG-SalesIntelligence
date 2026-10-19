import { ChartNoAxesCombined, FileText, MapPin, Trophy } from "lucide-react";

const questions = [
  {
    text: "Siapa saja sales yang belum mencapai target?",
    icon: ChartNoAxesCombined,
  },
  {
    text: "Sales dengan penjualan tertinggi bulan ini siapa?",
    icon: Trophy,
  },
  {
    text: "Bandingkan performa penjualan Jakarta dan Bandung.",
    icon: MapPin,
  },
  {
    text: "Apa penyebab penjualan di wilayah tertentu menurun?",
    icon: FileText,
  },
];

export function SuggestedQuestions() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {questions.map(({ text, icon: Icon }) => (
        <button
          key={text}
          type="button"
          className="flex min-h-16 items-center gap-4 rounded-[10px] bg-[#f2f7fe] px-5 py-3 text-left text-[12px] leading-5 text-[#1269d7] transition hover:bg-[#e8f2ff]"
        >
          <Icon aria-hidden="true" className="size-5 shrink-0 text-[#1680f7]" strokeWidth={2.1} />
          <span>{text}</span>
        </button>
      ))}
    </div>
  );
}

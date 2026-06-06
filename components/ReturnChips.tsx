"use client";
import { cn, fmtPct, chipClass } from "@/lib/utils";

interface ReturnChipsProps {
  tm1?: number | null;
  t1?:  number | null;
  t2?:  number | null;
  t5?:  number | null;
  compact?: boolean;
}

function Chip({ label, val }: { label: string; val: number | null | undefined }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[10px] text-lss-tertiary font-semibold uppercase tracking-wider">{label}</span>
      <span className={cn(chipClass(val), "text-[12px]")}>{fmtPct(val)}</span>
    </div>
  );
}

export default function ReturnChips({ tm1, t1, t2, t5, compact }: ReturnChipsProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className={cn(chipClass(t1))}>{fmtPct(t1)} T+1</span>
        <span className={cn(chipClass(t5))}>{fmtPct(t5)} T+5</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <Chip label="T−1" val={tm1} />
      <div className="w-px h-6 bg-lss-border" />
      <Chip label="T+1" val={t1} />
      <Chip label="T+2" val={t2} />
      <Chip label="T+5" val={t5} />
    </div>
  );
}

"use client";

type Props = {
  current: number; // 1-indexed
  total: number;
};

export function ProgressBar({ current, total }: Props) {
  const pct = ((current - 1) / total) * 100;

  return (
    <div className="w-full space-y-1.5">
      <div className="flex justify-between text-xs text-zinc-400 font-medium tracking-wide">
        <span>{current} of {total}</span>
        <span>{Math.round(pct)}% complete</span>
      </div>
      <div className="h-0.5 w-full rounded-full bg-zinc-800">
        <div
          className="h-0.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: "#C9A84C" }}
        />
      </div>
    </div>
  );
}

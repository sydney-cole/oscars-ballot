"use client";

type Props = {
  primaryLine: string;
  secondaryLine: string;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
};

export function CategoryCard({
  primaryLine,
  secondaryLine,
  isSelected,
  onClick,
  disabled = false,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-full rounded-xl border-2 px-6 py-4 text-left
        transition-all duration-150 cursor-pointer
        ${isSelected
          ? "border-oscar-gold bg-oscar-gold text-oscar-black"
          : "border-zinc-700 bg-oscar-surface text-zinc-100 hover:border-oscar-gold hover:scale-[1.01]"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {isSelected && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-oscar-black font-bold text-lg">
          ✓
        </span>
      )}
      <p className={`text-base font-semibold leading-snug pr-8 ${isSelected ? "text-oscar-black" : ""}`}>
        {primaryLine}
      </p>
      {secondaryLine && (
        <p className={`mt-0.5 text-sm leading-snug ${isSelected ? "text-oscar-black/70" : "text-zinc-400"}`}>
          {secondaryLine}
        </p>
      )}
    </button>
  );
}

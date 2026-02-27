"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { categories, formatNominee, TOTAL_CATEGORIES } from "@/lib/nominees";
import { loadPicks, savePick, loadStep, saveStep, type Picks } from "@/lib/picks";
import { ProgressBar } from "@/components/ProgressBar";
import { CategoryCard } from "@/components/CategoryCard";

type AnimClass = "" | "slide-out-left" | "slide-out-right" | "slide-in-right" | "slide-in-left";

type Props = {
  returnToSummary: boolean;
  startIndex: number;
};

export function BallotClient({ returnToSummary, startIndex }: Props) {
  const router = useRouter();

  // With ssr: false in the dynamic import, this component is client-only.
  // No hydration mismatch risk, so we can initialize state directly from localStorage.
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = startIndex >= 0 ? startIndex : loadStep();
    return Math.min(idx, TOTAL_CATEGORIES - 1);
  });
  const [picks, setPicks] = useState<Picks>(() => loadPicks());
  const [animClass, setAnimClass] = useState<AnimClass>("");
  const [isAnimating, setIsAnimating] = useState(false);

  const animateTo = useCallback(
    (nextIndex: number, direction: "forward" | "back") => {
      if (isAnimating) return;
      setIsAnimating(true);

      const outClass: AnimClass = direction === "forward" ? "slide-out-left" : "slide-out-right";
      const inClass: AnimClass = direction === "forward" ? "slide-in-right" : "slide-in-left";

      setAnimClass(outClass);

      setTimeout(() => {
        setCurrentIndex(nextIndex);
        saveStep(nextIndex);
        setAnimClass(inClass);
        setTimeout(() => {
          setAnimClass("");
          setIsAnimating(false);
        }, 200);
      }, 150);
    },
    [isAnimating]
  );

  const handlePick = useCallback(
    (pickKey: string) => {
      if (isAnimating) return;
      const category = categories[currentIndex].category;
      savePick(category, pickKey);
      setPicks((prev) => ({ ...prev, [category]: pickKey }));

      if (returnToSummary) {
        setTimeout(() => {
          router.push("/summary");
        }, 300);
        return;
      }

      if (currentIndex >= TOTAL_CATEGORIES - 1) {
        setTimeout(() => {
          router.push("/summary");
        }, 300);
        return;
      }

      animateTo(currentIndex + 1, "forward");
    },
    [isAnimating, currentIndex, returnToSummary, router, animateTo]
  );

  const handleBack = useCallback(() => {
    if (isAnimating || currentIndex === 0) return;
    if (returnToSummary) {
      router.push("/summary");
      return;
    }
    animateTo(currentIndex - 1, "back");
  }, [isAnimating, currentIndex, returnToSummary, router, animateTo]);

  const currentCategory = categories[currentIndex];
  const currentPick = picks[currentCategory.category];
  const nominees = currentCategory.nominees.map((n) => formatNominee(n));

  return (
    <div className="min-h-screen bg-oscar-black flex flex-col">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/")}
            className="text-zinc-500 hover:text-oscar-gold transition-colors text-sm"
          >
            ← Home
          </button>
          {returnToSummary && (
            <button
              onClick={() => router.push("/summary")}
              className="text-oscar-gold text-sm hover:text-oscar-gold-light transition-colors"
            >
              ← Back to Summary
            </button>
          )}
        </div>
        <ProgressBar current={currentIndex + 1} total={TOTAL_CATEGORIES} />
      </header>

      {/* Question area */}
      <main className="flex-1 flex flex-col px-6 max-w-2xl mx-auto w-full">
        <div className="overflow-hidden flex-1 flex flex-col">
          <div className={`flex flex-col flex-1 ${animClass}`}>
            {/* Category title */}
            <div className="py-8">
              <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Category</p>
              <h1
                className="text-3xl sm:text-4xl font-bold leading-tight text-zinc-100"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {currentCategory.category}
              </h1>
              <div className="gold-divider mt-4" />
            </div>

            {/* Nominee options */}
            <div className="flex flex-col gap-3 pb-8">
              {nominees.map((nominee) => (
                <CategoryCard
                  key={nominee.pickKey}
                  primaryLine={nominee.primaryLine}
                  secondaryLine={nominee.secondaryLine}
                  isSelected={currentPick === nominee.pickKey}
                  onClick={() => handlePick(nominee.pickKey)}
                  disabled={isAnimating}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer nav */}
      <footer className="px-6 pb-8 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0 || isAnimating}
            className="px-6 py-2.5 rounded-full border border-zinc-700 text-zinc-300 text-sm font-medium
                       hover:border-zinc-500 hover:text-zinc-100 transition-all
                       disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Back
          </button>

          {currentPick && !returnToSummary && (
            <button
              onClick={() => {
                if (currentIndex >= TOTAL_CATEGORIES - 1) {
                  router.push("/summary");
                } else {
                  animateTo(currentIndex + 1, "forward");
                }
              }}
              disabled={isAnimating}
              className="px-6 py-2.5 rounded-full border border-oscar-gold text-oscar-gold text-sm font-medium
                         hover:bg-oscar-gold hover:text-oscar-black transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentIndex >= TOTAL_CATEGORIES - 1 ? "Review Picks →" : "Next →"}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

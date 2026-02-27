import { Suspense } from "react";
import { SummaryClient } from "@/components/SummaryClient";

export default function SummaryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-oscar-black flex items-center justify-center">
          <div className="text-oscar-gold text-lg animate-pulse">Loading your picks…</div>
        </div>
      }
    >
      <SummaryClient />
    </Suspense>
  );
}

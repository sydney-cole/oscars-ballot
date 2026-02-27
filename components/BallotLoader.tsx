"use client";

import dynamic from "next/dynamic";

const BallotClient = dynamic(
  () => import("@/components/BallotClient").then((m) => ({ default: m.BallotClient })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-oscar-black flex items-center justify-center">
        <div className="text-oscar-gold text-lg animate-pulse">Loading ballot…</div>
      </div>
    ),
  }
);

type Props = {
  returnToSummary: boolean;
  startIndex: number;
};

export function BallotLoader({ returnToSummary, startIndex }: Props) {
  return <BallotClient returnToSummary={returnToSummary} startIndex={startIndex} />;
}

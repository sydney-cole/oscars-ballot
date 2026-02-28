"use client";

import Link from "next/link";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="min-h-screen bg-oscar-black flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 60%, rgba(201,168,76,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Top decorative line */}
      <div className="gold-divider w-24 mb-12" />

      {/* Title block */}
      <div className="text-center z-10">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">
          98th Academy Awards
        </p>
        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-bold text-zinc-100 leading-tight"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Oscar Ballot
        </h1>
        <p
          className="mt-3 text-2xl sm:text-3xl font-medium"
          style={{ color: "#C9A84C", fontFamily: "var(--font-playfair)" }}
        >
          2026
        </p>

        <div className="gold-divider w-24 mx-auto mt-8 mb-2" />

        <p className="text-zinc-500 text-sm mt-4">
          March 15, 2026 · Dolby Theatre, Hollywood
        </p>
        <p className="text-zinc-600 text-xs mt-1">Hosted by Conan O&apos;Brien</p>
      </div>

      {/* CTA buttons */}
      <div className="mt-12 flex flex-col items-center gap-4 z-10 w-full max-w-xs">
        <AuthLoading>
          <div className="w-full text-center py-4 text-zinc-500 text-sm animate-pulse">
            Loading…
          </div>
        </AuthLoading>

        <Unauthenticated>
          <SignInButton mode="modal">
            <button
              className="w-full text-center rounded-full font-semibold py-4 px-10 text-base
                         text-oscar-black transition-all duration-200
                         hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: "#C9A84C" }}
            >
              Sign In to Vote
            </button>
          </SignInButton>
        </Unauthenticated>

        <Authenticated>
          <Link
            href="/ballot"
            className="w-full text-center rounded-full font-semibold py-4 px-10 text-base
                       text-oscar-black transition-all duration-200
                       hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: "#C9A84C" }}
          >
            Fill Out Your Ballot
          </Link>
        </Authenticated>

        <Link
          href="/leaderboard"
          className="w-full text-center rounded-full py-3.5 px-10 text-sm font-medium
                     border border-zinc-700 text-zinc-300
                     hover:border-zinc-500 hover:text-zinc-100 transition-all"
        >
          View Leaderboard
        </Link>

        <Authenticated>
          <UserButton />
        </Authenticated>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-zinc-700 text-xs">
        24 categories · Pick your predicted winners
      </p>
    </main>
  );
}

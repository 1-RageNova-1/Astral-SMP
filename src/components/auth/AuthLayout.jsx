'use client';

import Link from 'next/link';
import { Swords } from 'lucide-react';

const MOUNTAIN_SRCSET = [
  'https://img.magnific.com/premium-vector/mountain-landscape-dusk_1250993-1714.jpg?w=360 360w',
  'https://img.magnific.com/premium-vector/mountain-landscape-dusk_1250993-1714.jpg?w=740 740w',
  'https://img.magnific.com/premium-vector/mountain-landscape-dusk_1250993-1714.jpg?w=1060 1060w',
  'https://img.magnific.com/premium-vector/mountain-landscape-dusk_1250993-1714.jpg?w=1480 1480w',
  'https://img.magnific.com/premium-vector/mountain-landscape-dusk_1250993-1714.jpg?w=2000 2000w',
].join(', ');

const MOUNTAIN_SRC =
  'https://img.magnific.com/premium-vector/mountain-landscape-dusk_1250993-1714.jpg?w=1480';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <picture className="absolute inset-0 -z-10 block h-full w-full">
        <source srcSet={MOUNTAIN_SRCSET} sizes="100vw" />
        <img
          src={MOUNTAIN_SRC}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center"
        />
      </picture>

      <div className="absolute inset-0 -z-10 bg-black/55 backdrop-blur-[2px]" />

      <div className="relative flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2 text-white/90 transition hover:text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/40 bg-primary/20">
              <Swords className="h-5 w-5 text-primary" />
            </div>
            <span className="font-display text-xs text-primary text-glow-purple sm:text-sm">
              ASTRAL
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-white/70 transition hover:text-white"
          >
            Back to Home
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 pb-12 pt-4">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center">
              <h1 className="font-display text-lg text-white text-glow-purple sm:text-xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 text-sm text-white/70">{subtitle}</p>
              )}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

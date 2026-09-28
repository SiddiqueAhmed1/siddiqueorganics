"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

export interface HeroSlide {
  src: string;
  alt: string;
}

interface HeroSliderProps {
  slides: HeroSlide[];
  /** ms between automatic slides. */
  interval?: number;
}

/**
 * Auto-playing banner: cross-fade + gentle zoom ("Ken Burns") per slide,
 * pauses on hover / touch / hidden tab, swipe on mobile, dot navigation.
 * Only the first image is eager (LCP); the rest lazy-load.
 */
export default function HeroSlider({
  slides,
  interval = 5000,
}: HeroSliderProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback(
    (i: number) => setIndex(((i % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (count < 2 || paused) return;
    // `index` is a dependency, so any manual change restarts the 5s clock.
    const timer = setTimeout(() => go(index + 1), interval);
    return () => clearTimeout(timer);
  }, [index, paused, count, interval, go]);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <div
      className="relative w-full aspect-[5/2] lg:aspect-auto lg:h-[390px] overflow-hidden rounded-md bg-[#F9F8F3] select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
        setPaused(true);
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        touchX.current = null;
        setPaused(false);
        if (start === null) return;
        const dx = e.changedTouches[0].clientX - start;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured offers"
    >
      {slides.map((slide, i) => {
        const active = i === index;
        return (
          <div
            key={slide.src}
            aria-hidden={!active}
            className={`absolute inset-0 transition-all duration-1000 ease-out motion-reduce:transition-none ${
              active
                ? "opacity-100 translate-x-0 z-10"
                : "opacity-0 translate-x-6 z-0 pointer-events-none"
            }`}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 70vw"
              priority={i === 0}
              className={`object-cover transition-transform ease-out motion-reduce:transition-none ${
                active ? "scale-100 duration-[4000ms]" : "scale-100 duration-0"
              }`}
            />
          </div>
        );
      })}

      {count > 1 && (
        <>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.src}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i === index
                    ? "w-6 bg-white shadow"
                    : "w-2 bg-white/60 hover:bg-white/90"
                }`}
              />
            ))}
          </div>
          {/* 5s progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 z-20">
            <div
              key={`${index}-${paused}`}
              className="h-full bg-[#3B7A42] origin-left"
              style={{
                animation: paused
                  ? "none"
                  : `hero-progress ${interval}ms linear forwards`,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

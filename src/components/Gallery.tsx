"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Media } from "@/lib/db";

/**
 * Accessible media gallery: keyboard arrows, swipe on touch, thumbnails,
 * full-screen lightbox, and graceful empty state. No external libraries.
 */
export default function Gallery({ media, title }: { media: Media[]; title: string }) {
  const images = media.filter((m) => m.media_type === "image");
  const videos = media.filter((m) => m.media_type === "video");
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchX = useRef<number | null>(null);
  const lightboxRef = useRef<HTMLDivElement | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const count = images.length;
  const go = useCallback((dir: 1 | -1) => setIndex((i) => (count ? (i + dir + count) % count : 0)), [count]);

  // keyboard + lightbox focus management
  useEffect(() => {
    if (!lightbox) return;
    lastFocus.current = document.activeElement as HTMLElement;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") go(1);  // RTL: left arrow advances
      if (e.key === "ArrowRight") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    lightboxRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lastFocus.current?.focus?.();
    };
  }, [lightbox, go]);

  if (!count && !videos.length) {
    return (
      <div className="grid aspect-[16/10] place-items-center rounded-[var(--radius-xl2)] border border-dashed border-sand-200 bg-sand-100 text-ink-300">
        <div className="text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="mx-auto" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="10" r="1.6" />
            <path d="m4 17 5-4 4 3 3-2 4 3" />
          </svg>
          <p className="mt-3 text-[13px]">لا توجد صور لهذا العقار بعد</p>
        </div>
      </div>
    );
  }

  const active = images[Math.min(index, Math.max(count - 1, 0))];

  return (
    <div>
      <div
        className="group relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl2)] bg-sand-200 shadow-soft"
        onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
          if (Math.abs(dx) > 48) go(dx > 0 ? 1 : -1); // swipe right => previous in RTL
          touchX.current = null;
        }}
      >
        {active ? (
          <>
            <Image
              src={active.media_url}
              alt={active.alt_ar || title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="cursor-zoom-in object-cover"
              onClick={() => setLightbox(true)}
            />
            {count > 1 && (
              <>
                <GalleryArrow dir="prev" onClick={() => go(-1)} />
                <GalleryArrow dir="next" onClick={() => go(1)} />
              </>
            )}
            <button
              type="button"
              onClick={() => setLightbox(true)}
              className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-black/55 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur transition-colors hover:bg-black/70"
              aria-label="عرض الصورة بالحجم الكامل"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 9V4h5M20 15v5h-5M4 4l6 6M20 20l-6-6" />
              </svg>
              تكبير
            </button>
            <span className="absolute bottom-3 right-3 rounded-lg bg-black/55 px-2.5 py-1 text-[12px] font-semibold text-white backdrop-blur tnum">
              {index + 1} / {count}
            </span>
          </>
        ) : null}
      </div>

      {count > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="صور العقار">
          {images.map((m, i) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`صورة ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                i === index ? "border-brand-600 opacity-100" : "border-transparent opacity-65 hover:opacity-100"
              }`}
            >
              <Image src={m.media_url} alt="" fill sizes="96px" className="object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {videos.length > 0 && (
        <div className="mt-4 space-y-3">
          {videos.map((v) => (
            <video
              key={v.id}
              src={v.media_url}
              poster={v.thumbnail_url ?? undefined}
              controls
              preload="metadata"
              className="w-full rounded-[var(--radius-xl2)] bg-black"
            >
              متصفحك لا يدعم تشغيل الفيديو.
            </video>
          ))}
        </div>
      )}

      {lightbox && active && (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label={`معرض صور — ${title}`}
          tabIndex={-1}
          className="fixed inset-0 z-[90] flex flex-col bg-ink-900/95 fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setLightbox(false); }}
        >
          <div className="flex items-center justify-between p-4 text-white">
            <span className="text-[13px] font-semibold tnum">{index + 1} / {count}</span>
            <button
              type="button"
              onClick={() => setLightbox(false)}
              aria-label="إغلاق المعرض"
              className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 hover:bg-white/20"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
          <div className="relative flex-1">
            <Image
              src={active.media_url}
              alt={active.alt_ar || title}
              fill
              sizes="100vw"
              className="object-contain"
            />
            {count > 1 && (
              <>
                <GalleryArrow dir="prev" onClick={() => go(-1)} big />
                <GalleryArrow dir="next" onClick={() => go(1)} big />
              </>
            )}
          </div>
          <div className="p-4 text-center text-[12px] text-white/50">استخدم الأسهم للتنقل، وEsc للإغلاق</div>
        </div>
      )}
    </div>
  );
}

function GalleryArrow({ dir, onClick, big }: { dir: "prev" | "next"; onClick: () => void; big?: boolean }) {
  // RTL-aware: "next" sits on the left edge visually
  const pos = dir === "next" ? "left-3" : "right-3";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "next" ? "الصورة التالية" : "الصورة السابقة"}
      className={`absolute top-1/2 -translate-y-1/2 ${pos} grid ${
        big ? "h-12 w-12" : "h-9 w-9"
      } place-items-center rounded-full bg-black/45 text-white backdrop-blur transition-all hover:bg-black/70`}
    >
      <svg width={big ? 22 : 18} height={big ? 22 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
        {dir === "next" ? <path d="M14 6l-6 6 6 6" /> : <path d="M10 6l6 6-6 6" />}
      </svg>
    </button>
  );
}

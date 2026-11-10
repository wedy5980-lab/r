"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Media } from "@/lib/db";
import { addMediaAction, updateMediaAction } from "@/app/actions/admin";

const MAX_BYTES = 20 * 1024 * 1024;
const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "video/mp4", "video/webm"];

export default function MediaManager({ propertyId, initialMedia }: { propertyId: string; initialMedia: Media[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialMedia);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError(null);

    for (const file of Array.from(files)) {
      if (!OK_TYPES.includes(file.type)) {
        setError(`نوع الملف غير مدعوم: ${file.name}. المسموح: JPG, PNG, WebP, AVIF, MP4, WebM.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(`حجم الملف كبير: ${file.name}. الحد ٢٠ ميجابايت.`);
        continue;
      }

      setBusy(file.name);
      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: {
            "content-type": file.type,
            "x-file-name": encodeURIComponent(file.name),
            "x-property-id": propertyId,
          },
          body: file,
        });
        const json = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !json.url) throw new Error(json.error || "فشل الرفع");

        // persist the media row, then refresh server data
        const fd = new FormData();
        fd.set("property_id", propertyId);
        fd.set("media_url", json.url);
        await addMediaAction(fd);

        setItems((prev) => [
          ...prev,
          {
            id: `tmp-${Date.now()}-${Math.random()}`,
            property_id: propertyId,
            media_type: file.type.startsWith("video") ? "video" : "image",
            media_url: json.url,
            thumbnail_url: null,
            alt_ar: null,
            display_order: prev.length,
          } as Media,
        ]);
        startTransition(() => router.refresh());
      } catch (e) {
        setError(e instanceof Error ? e.message : "تعذّر رفع الملف.");
      } finally {
        setBusy(null);
      }
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function op(mediaId: string, action: "up" | "down" | "delete") {
    const fd = new FormData();
    fd.set("media_id", mediaId);
    fd.set("property_id", propertyId);
    fd.set("op", action);
    await updateMediaAction(fd);
    if (action === "delete") setItems((p) => p.filter((m) => m.id !== mediaId));
    startTransition(() => router.refresh());
  }

  async function addUrl() {
    const v = url.trim();
    if (!v) return;
    if (!/^https:\/\//.test(v) && !v.startsWith("/")) {
      setError("الرابط يجب أن يبدأ بـ https:// أو /");
      return;
    }
    const fd = new FormData();
    fd.set("property_id", propertyId);
    fd.set("media_url", v);
    await addMediaAction(fd);
    setUrl("");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 border-dashed border-sand-200 bg-sand-50 p-4 text-center">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
          multiple
          id="media-upload"
          className="sr-only"
          onChange={(e) => upload(e.target.files)}
        />
        <label
          htmlFor="media-upload"
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-brand-700"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
          </svg>
          رفع ملفات
        </label>
        <p className="mt-2 text-[11.5px] text-ink-500">JPG · PNG · WebP · AVIF · MP4 — بحد أقصى ٢٠ ميجابايت للملف</p>
        {busy && <p className="mt-2 text-[12px] font-semibold text-brand-700">جارٍ رفع {busy}…</p>}
      </div>

      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="أو أضف رابط صورة https://…"
          dir="ltr"
          className="flex-1 rounded-xl border border-sand-200 px-3 py-2 text-[12.5px] outline-none focus:border-brand-400"
        />
        <button type="button" onClick={addUrl} className="rounded-xl border border-sand-200 px-4 py-2 text-[12.5px] font-semibold text-ink-700 hover:border-brand-300">
          إضافة
        </button>
      </div>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</p>}

      {items.length === 0 ? (
        <p className="rounded-xl border border-sand-200 bg-sand-50 px-4 py-6 text-center text-[12.5px] text-ink-500">
          لا توجد صور بعد. الصورة الأولى هي الصورة الرئيسية في القوائم.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[...items].sort((a, b) => a.display_order - b.display_order).map((m, i) => (
            <li key={m.id} className="overflow-hidden rounded-xl border border-sand-200 bg-white">
              <div className="relative aspect-[4/3] bg-sand-100">
                {m.media_type === "image" ? (
                  <Image src={m.media_url} alt="" fill sizes="200px" className="object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-[11px] text-ink-500">فيديو</div>
                )}
                {i === 0 && (
                  <span className="absolute top-1.5 right-1.5 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    رئيسية
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 p-1.5">
                <div className="flex gap-1">
                  <button type="button" onClick={() => op(m.id, "up")} disabled={i === 0} aria-label="تحريك لأعلى"
                    className="grid h-7 w-7 place-items-center rounded border border-sand-200 text-ink-700 disabled:opacity-30 hover:border-brand-300">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 14l6-6 6 6" /></svg>
                  </button>
                  <button type="button" onClick={() => op(m.id, "down")} disabled={i === items.length - 1} aria-label="تحريك لأسفل"
                    className="grid h-7 w-7 place-items-center rounded border border-sand-200 text-ink-700 disabled:opacity-30 hover:border-brand-300">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 10l6 6 6-6" /></svg>
                  </button>
                </div>
                <button type="button" onClick={() => op(m.id, "delete")} aria-label="حذف الوسيط"
                  className="grid h-7 w-7 place-items-center rounded border border-red-200 text-red-600 hover:bg-red-50">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M18 6 6 18" /></svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

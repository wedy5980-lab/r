import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSession, atLeast, audit } from "@/lib/auth";
import { env } from "@/lib/config";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 20 * 1024 * 1024;

/** Extension is derived from the sniffed magic bytes, never from the filename. */
function sniff(buf: Uint8Array): { ext: string; mime: string } | null {
  const hex = (n: number) => buf.subarray(n, n + 4);
  const ascii = (n: number, len: number) => String.fromCharCode(...buf.subarray(n, n + len));

  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  if (buf[0] === 0x89 && ascii(1, 3) === "PNG") return { ext: "png", mime: "image/png" };
  if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return { ext: "webp", mime: "image/webp" };
  if (ascii(4, 4) === "ftyp") {
    const brand = ascii(8, 4);
    if (brand.startsWith("avif")) return { ext: "avif", mime: "image/avif" };
    if (["isom", "iso2", "mp41", "mp42", "avc1", "dash"].includes(brand)) return { ext: "mp4", mime: "video/mp4" };
  }
  if (hex(0).length && buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) {
    return { ext: "webm", mime: "video/webm" };
  }
  return null;
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !atLeast(session.role, "editor")) {
    return NextResponse.json({ error: "غير مصرّح." }, { status: 401 });
  }

  const propertyId = req.headers.get("x-property-id") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(propertyId)) {
    return NextResponse.json({ error: "معرّف العقار غير صالح." }, { status: 400 });
  }

  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES) {
    return NextResponse.json({ error: "حجم الملف يتجاوز ٢٠ ميجابايت." }, { status: 413 });
  }

  const buf = new Uint8Array(await req.arrayBuffer());
  if (buf.byteLength === 0) return NextResponse.json({ error: "ملف فارغ." }, { status: 400 });
  if (buf.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "حجم الملف يتجاوز ٢٠ ميجابايت." }, { status: 413 });
  }

  const kind = sniff(buf);
  if (!kind) {
    return NextResponse.json(
      { error: "محتوى الملف غير مدعوم. المسموح: JPG, PNG, WebP, AVIF, MP4, WebM." },
      { status: 415 }
    );
  }

  const { url: supaUrl, key } = env();
  const path = `properties/${propertyId}/${randomUUID()}.${kind.ext}`;

  const res = await fetch(`${supaUrl}/storage/v1/object/mp-media/${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": kind.mime,
      "cache-control": "public, max-age=31536000, immutable",
      "x-upsert": "false",
    },
    body: buf,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[upload] storage error", res.status, detail.slice(0, 300));
    return NextResponse.json({ error: "تعذّر حفظ الملف في التخزين." }, { status: 502 });
  }

  const publicUrl = `${supaUrl}/storage/v1/object/public/mp-media/${path}`;
  await audit("media_upload", "property", propertyId, { path, mime: kind.mime, bytes: buf.byteLength }, session.id);

  return NextResponse.json({ url: publicUrl, mime: kind.mime, bytes: buf.byteLength });
}

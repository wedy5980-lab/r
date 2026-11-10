import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-sand-50 px-6">
      <div className="text-center">
        <p className="font-[family-name:var(--font-display)] text-6xl font-extrabold text-brand-600 tnum">404</p>
        <h1 className="mt-4 text-xl font-bold text-ink-900">الصفحة غير موجودة</h1>
        <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed text-ink-500">
          قد يكون العقار أُزيل أو تغيّر رابطه. يمكنك تصفح العقارات المتاحة.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <Link href="/" className="rounded-xl bg-brand-600 px-5 py-2.5 text-[13.5px] font-bold text-white hover:bg-brand-700">الرئيسية</Link>
          <Link href="/search" className="rounded-xl border border-sand-200 bg-white px-5 py-2.5 text-[13.5px] font-bold text-ink-700 hover:border-brand-300">البحث</Link>
        </div>
      </div>
    </div>
  );
}

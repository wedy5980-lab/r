"use client";

import { useState } from "react";
import { archivePropertyAction, deletePropertyAction, setStatusAction } from "@/app/actions/admin";

export default function DangerZone({
  id,
  canDelete,
  status,
}: {
  id: string;
  canDelete: boolean;
  status: string;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <section className="rounded-[var(--radius-xl2)] border border-sand-200 bg-white p-5 shadow-soft">
      <h2 className="text-[13px] font-bold text-ink-900">إدارة الحالة والحذف</h2>
      <p className="mt-1 text-[11.5px] leading-relaxed text-ink-500">
        الأرشفة هي الخيار الموصى به — تُخفي العقار من الموقع مع الحفاظ على بياناته.
        الحذف النهائي لا يمكن التراجع عنه.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <form action={setStatusAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={id} />
          <select name="status" defaultValue={status} className="rounded-lg border border-sand-200 px-3 py-2 text-[12.5px]">
            <option value="available">متاح</option>
            <option value="sold">تم البيع</option>
            <option value="rented">مؤجر</option>
            <option value="unavailable">غير متاح</option>
            <option value="archived">مؤرشف</option>
          </select>
          <button type="submit" className="rounded-lg bg-ink-900 px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-ink-700">
            تحديث الحالة
          </button>
        </form>

        <form action={archivePropertyAction}>
          <input type="hidden" name="id" value={id} />
          <button type="submit" className="rounded-lg border border-sand-200 px-4 py-2 text-[12.5px] font-semibold text-ink-700 hover:border-brand-300">
            أرشفة
          </button>
        </form>
      </div>

      <div className="mt-5 border-t border-sand-200 pt-4">
        {!canDelete ? (
          <p className="text-[11.5px] text-ink-500">
            الحذف النهائي متاح لمدير المكتب فقط. يمكنك أرشفة العقار بدلًا من ذلك.
          </p>
        ) : !confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-lg border border-red-200 px-4 py-2 text-[12.5px] font-semibold text-red-600 hover:bg-red-50"
          >
            حذف العقار نهائيًا
          </button>
        ) : (
          <form action={deletePropertyAction} className="flex flex-wrap items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
            <input type="hidden" name="id" value={id} />
            <p className="w-full text-[12px] leading-relaxed text-red-700">
              اكتب <strong className="font-mono">DELETE</strong> للتأكيد. سيُحذف العقار وكل صوره نهائيًا.
            </p>
            <input
              name="confirm"
              required
              placeholder="DELETE"
              dir="ltr"
              className="rounded-lg border border-red-300 px-3 py-1.5 text-[12.5px] outline-none focus:border-red-500"
            />
            <button type="submit" className="rounded-lg bg-red-600 px-4 py-1.5 text-[12.5px] font-bold text-white hover:bg-red-700">
              تأكيد الحذف
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="rounded-lg px-3 py-1.5 text-[12.5px] font-semibold text-ink-700">
              إلغاء
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

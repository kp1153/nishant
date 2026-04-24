import { db } from "@/db";
import { udhaari, grahak } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";

const colors = [
  "bg-gradient-to-br from-blue-500 to-blue-700",
  "bg-gradient-to-br from-emerald-500 to-emerald-700",
  "bg-gradient-to-br from-amber-500 to-orange-600",
  "bg-gradient-to-br from-purple-500 to-purple-700",
  "bg-gradient-to-br from-pink-500 to-rose-600",
];

export default async function UdhaariList() {
  const baaki = await db
    .select()
    .from(udhaari)
    .leftJoin(grahak, eq(udhaari.grahakId, grahak.id))
    .where(sql`${udhaari.rakam} > ${udhaari.chukaya}`)
    .limit(5);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-500 font-semibold">बाकी उधार</span>
        <Link href="/dashboard/udhaari" className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline">
          सभी देखें <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-slate-100">
        {baaki.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">कोई उधारी बाकी नहीं</div>
        ) : baaki.map((row, i) => {
          const baki = row.udhaari.rakam - row.udhaari.chukaya;
          const mobile = row.grahak?.mobile;
          const waMsg = `नमस्ते ${row.grahak?.naam}, आपका ₹${baki} बाकी है। कृपया जल्द चुकाएं।`;
          return (
            <div key={row.udhaari.id} className="flex items-center gap-3 py-3">
              <div className={`w-10 h-10 rounded-full ${colors[i % colors.length]} flex items-center justify-center text-white text-sm font-extrabold shrink-0 shadow-sm`}>
                {row.grahak?.naam?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-extrabold text-slate-900 truncate">{row.grahak?.naam ?? "—"}</div>
                <div className="text-sm text-red-600 font-bold">₹{baki}</div>
              </div>
              {mobile && (
                <a
                  href={`https://wa.me/91${mobile}?text=${encodeURIComponent(waMsg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 w-9 h-9 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center justify-center transition shadow-sm"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
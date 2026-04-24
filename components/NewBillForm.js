"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { masterCatalog } from "@/lib/catalog";
import { motion, AnimatePresence } from "framer-motion";
import { User, Package, Plus, X, Search, Grid3x3, Trash2, ReceiptText, AlertCircle } from "lucide-react";

const paymentMethods = [
  { key: "नकद", label: "नकद" },
  { key: "यूपीआई", label: "यूपीआई" },
  { key: "उधार", label: "उधार" },
  { key: "आंशिक", label: "आंशिक" },
];

function gstCalc(mulya, matra, gstDar) {
  const base = mulya * matra;
  const gst = parseFloat(((base * gstDar) / 100).toFixed(2));
  const cgst = parseFloat((gst / 2).toFixed(2));
  const sgst = parseFloat((gst / 2).toFixed(2));
  return { base, gst, cgst, sgst, kul: parseFloat((base + gst).toFixed(2)) };
}

function fuzzyMatch(text, query) {
  if (!query || !text) return false;
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  return t.includes(q);
}

const inp = "w-full border border-slate-200 rounded-xl px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-slate-800";

export default function NewBillForm({ grahakSuchi, samaanSuchi }) {
  const router = useRouter();
  const [selectedGrahak, setSelectedGrahak] = useState(null);
  const [items, setItems] = useState([]);
  const [payment, setPayment] = useState("नकद");
  const [searchGrahak, setSearchGrahak] = useState("");
  const [grahakFocus, setGrahakFocus] = useState(false);
  const [saving, setSaving] = useState(false);
  const [manual, setManual] = useState(false);
  const [searchMode, setSearchMode] = useState("search");
  const [selectedShreni, setSelectedShreni] = useState(null);
  const [searchSamaan, setSearchSamaan] = useState("");
  const [manualItem, setManualItem] = useState({ naam: "", mulya: "", matra: "1", gstDar: "18" });
  const [aansikRakam, setAansikRakam] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const udharWala = payment === "उधार" || payment === "आंशिक";

  const summary = items.reduce(
    (acc, i) => {
      const { base, cgst, sgst, kul } = gstCalc(i.bikriMulya, i.quantity, i.gstDar ?? 18);
      return { base: acc.base + base, cgst: acc.cgst + cgst, sgst: acc.sgst + sgst, kul: acc.kul + kul };
    },
    { base: 0, cgst: 0, sgst: 0, kul: 0 }
  );

  const itemsWithZeroPrice = items.filter(i => !i.bikriMulya || i.bikriMulya <= 0);

  function addItem(s) {
    const exists = items.find((i) => i.id === s.id);
    if (exists) {
      setItems(items.map((i) => i.id === s.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, { ...s, quantity: 1 }]);
    }
    setSearchSamaan("");
  }

  function addCatalogItem(item, shreni) {
    const existing = samaanSuchi?.find((s) => s.naam === item.naam);
    if (existing) { addItem(existing); return; }
    const id = `catalog-${Date.now()}`;
    const exists = items.find((i) => i.naam === item.naam);
    if (exists) {
      setItems(items.map((i) => i.naam === item.naam ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, { id, naam: item.naam, bikriMulya: 0, quantity: 1, gstDar: item.gstDar, hsnCode: item.hsnCode, shreni, ikaai: item.ikaai, isManual: true }]);
    }
    setSearchSamaan("");
  }

  function updateQty(id, val) {
    if (val < 1) return;
    setItems(items.map((i) => (i.id === id ? { ...i, quantity: val } : i)));
  }

  function updatePrice(id, val) {
    setItems(items.map((i) => i.id === id ? { ...i, bikriMulya: parseFloat(val) || 0 } : i));
  }

  function removeItem(id) {
    setItems(items.filter((i) => i.id !== id));
  }

  function addManualItem() {
    if (!manualItem.naam || !manualItem.mulya) return;
    const id = `manual-${Date.now()}`;
    setItems([...items, { id, naam: manualItem.naam, bikriMulya: parseFloat(manualItem.mulya), quantity: parseInt(manualItem.matra) || 1, gstDar: parseFloat(manualItem.gstDar) || 18, hsnCode: null, isManual: true }]);
    setManualItem({ naam: "", mulya: "", matra: "1", gstDar: "18" });
    setManual(false);
  }

  const filteredGrahak = grahakSuchi?.filter((g) =>
    !searchGrahak || fuzzyMatch(g.naam, searchGrahak) || g.mobile?.includes(searchGrahak)
  ).slice(0, 15);

  const filteredSamaan = samaanSuchi?.filter((s) => fuzzyMatch(s.naam, searchSamaan));

  const allCatalogItems = masterCatalog.flatMap(c => c.samaan.map(s => ({ ...s, shreni: c.shreni })));
  const filteredCatalog = searchSamaan
    ? allCatalogItems.filter(s => fuzzyMatch(s.naam, searchSamaan))
    : [];

  async function sirafBilPar() {
    setSelectedGrahak({ id: null, naam: searchGrahak, mobile: null });
    setSearchGrahak("");
    setGrahakFocus(false);
  }

  async function dbMeinBhiSave() {
    const res = await fetch("/api/grahak", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ naam: searchGrahak, mobile: "" }) });
    if (res.ok) {
      const data = await res.json();
      setSelectedGrahak({ id: data.id, naam: searchGrahak, mobile: null });
      setSearchGrahak("");
      setGrahakFocus(false);
    }
  }

  async function saveBill() {
    setErrorMsg("");
    if (items.length === 0) return setErrorMsg("कम से कम एक सामान जोड़ें");
    if (itemsWithZeroPrice.length > 0) return setErrorMsg("सभी सामानों का मूल्य भरें — अभी " + itemsWithZeroPrice.length + " सामान बिना मूल्य");
    if (udharWala && !selectedGrahak) return setErrorMsg("उधार के लिए ग्राहक जरूरी है");
    if (payment === "आंशिक") {
      const rakam = parseFloat(aansikRakam);
      if (!rakam || rakam <= 0 || rakam >= summary.kul - 0.01) return setErrorMsg("आंशिक रकम सही नहीं है");
    }
    setSaving(true);
    const res = await fetch("/api/bill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grahakId: selectedGrahak?.id ?? null,
        grahakNaam: selectedGrahak?.naam ?? null,
        items: items.map((i) => {
          const { base, cgst, sgst, kul } = gstCalc(i.bikriMulya, i.quantity, i.gstDar ?? 18);
          return { id: i.isManual ? null : i.id, naam: i.naam, matra: i.quantity, mulya: i.bikriMulya, gstDar: i.gstDar ?? 18, cgst, sgst, kul };
        }),
        bhugtan: payment,
        kul: parseFloat(summary.kul.toFixed(2)),
        gstRakam: parseFloat((summary.cgst + summary.sgst).toFixed(2)),
        mulyaBeforeGst: parseFloat(summary.base.toFixed(2)),
        aansikRakam: payment === "आंशिक" ? parseFloat(aansikRakam) : 0,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      router.push(`/dashboard/bill/${data.billId}`);
    } else {
      setErrorMsg("बिल सेव नहीं हुआ, दोबारा कोशिश करें");
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 font-extrabold text-slate-900 text-base">
              <User className="w-4 h-4 text-blue-700" />
              ग्राहक
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full border ${udharWala ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
              {udharWala ? "जरूरी" : "वैकल्पिक"}
            </span>
          </div>
          {selectedGrahak ? (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <div>
                <div className="font-extrabold text-slate-900 text-base">{selectedGrahak.naam}</div>
                <div className="text-sm text-slate-500">{selectedGrahak.mobile ?? "नया ग्राहक"}</div>
              </div>
              <button onClick={() => setSelectedGrahak(null)}
                className="text-sm text-red-600 font-bold border-2 border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                बदलें
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className={inp + " pl-10"}
                placeholder="नाम या मोबाइल से खोजें"
                value={searchGrahak}
                onChange={(e) => setSearchGrahak(e.target.value)}
                onFocus={() => setGrahakFocus(true)}
              />
              {(grahakFocus || searchGrahak) && filteredGrahak && filteredGrahak.length > 0 && (
                <div className="w-full bg-white border border-slate-200 rounded-xl mt-1 shadow-lg max-h-60 overflow-y-auto z-10">
                  {filteredGrahak.map((g) => (
                    <div key={g.id}
                      onClick={() => { setSelectedGrahak(g); setSearchGrahak(""); setGrahakFocus(false); }}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-b-0">
                      <div className="font-bold text-slate-900">{g.naam}</div>
                      <div className="text-sm text-slate-500">{g.mobile}</div>
                    </div>
                  ))}
                </div>
              )}
              {searchGrahak && filteredGrahak?.length === 0 && (
                <div className="w-full bg-white border border-slate-200 rounded-xl mt-1 shadow-lg p-3 space-y-2">
                  <div className="text-sm text-slate-500">&quot;{searchGrahak}&quot; सूची में नहीं है</div>
                  <div className="flex gap-2">
                    <button onClick={sirafBilPar}
                      className="flex-1 text-sm font-bold bg-white border-2 border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl hover:border-blue-400 transition">
                      सिर्फ बिल पर
                    </button>
                    <button onClick={dbMeinBhiSave}
                      className="flex-1 text-sm font-bold bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-3 py-2.5 rounded-xl hover:from-blue-800 hover:to-indigo-800 transition">
                      सूची में भी जोड़ें
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 font-extrabold text-slate-900 text-base">
              <Package className="w-4 h-4 text-blue-700" />
              सामान जोड़ें
            </div>
            <button onClick={() => setManual(!manual)}
              className="text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl transition">
              {manual ? "खोज से चुनें" : "+ खुद लिखें"}
            </button>
          </div>

          {!manual && (
            <div className="flex gap-2 mb-3">
              <button onClick={() => { setSearchMode("search"); setSelectedShreni(null); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold border-2 transition ${searchMode === "search" ? "bg-blue-700 text-white border-blue-700 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"}`}>
                <Search className="w-4 h-4" />
                नाम से खोजें
              </button>
              <button onClick={() => { setSearchMode("category"); setSelectedShreni(null); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold border-2 transition ${searchMode === "category" ? "bg-blue-700 text-white border-blue-700 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"}`}>
                <Grid3x3 className="w-4 h-4" />
                श्रेणी से चुनें
              </button>
            </div>
          )}

          {manual && (
            <div className="flex flex-col gap-3 mb-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <input placeholder="सामान का नाम" value={manualItem.naam}
                onChange={(e) => setManualItem({ ...manualItem, naam: e.target.value })} className={inp} />
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <div className="text-xs text-slate-600 mb-1 font-bold uppercase tracking-wide">मूल्य ₹</div>
                  <input type="number" placeholder="500" value={manualItem.mulya}
                    onChange={(e) => setManualItem({ ...manualItem, mulya: e.target.value })} className={inp} />
                </div>
                <div>
                  <div className="text-xs text-slate-600 mb-1 font-bold uppercase tracking-wide">मात्रा</div>
                  <input type="number" placeholder="1" value={manualItem.matra}
                    onChange={(e) => setManualItem({ ...manualItem, matra: e.target.value })} className={inp} />
                </div>
                <div>
                  <div className="text-xs text-slate-600 mb-1 font-bold uppercase tracking-wide">GST %</div>
                  <select defaultValue={manualItem.gstDar}
                    onChange={(e) => setManualItem({ ...manualItem, gstDar: e.target.value })} className={inp}>
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
              </div>
              <button onClick={addManualItem}
                className="w-full bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white py-3 rounded-xl text-base font-bold shadow-md transition">
                जोड़ें
              </button>
            </div>
          )}

          {!manual && searchMode === "search" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className={inp + " pl-10"}
                placeholder="सामान का नाम — पाइप, बल्ब, सीमेंट"
                value={searchSamaan} onChange={(e) => setSearchSamaan(e.target.value)} />
              {searchSamaan && (
                <div className="w-full bg-white border border-slate-200 rounded-xl mt-1 shadow-lg max-h-60 overflow-y-auto">
                  {filteredSamaan?.length === 0 && filteredCatalog.length === 0 ? (
                    <div className="px-4 py-4 text-base text-slate-400">सामान नहीं मिला</div>
                  ) : (
                    <>
                      {filteredSamaan?.map((s) => (
                        <div key={s.id} onClick={() => addItem(s)}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b border-slate-100">
                          <div>
                            <div className="font-bold text-slate-900">{s.naam}</div>
                            <div className="text-sm text-slate-500">{s.shreni} · {s.matra} {s.ikaai} बचा · GST {s.gstDar ?? 18}%</div>
                          </div>
                          <div className="text-base font-extrabold text-green-700">₹{s.bikriMulya}</div>
                        </div>
                      ))}
                      {filteredCatalog.filter(c => !samaanSuchi?.find(s => s.naam === c.naam)).map((item) => (
                        <div key={item.naam} onClick={() => addCatalogItem(item, item.shreni)}
                          className="px-4 py-3 hover:bg-amber-50 cursor-pointer flex justify-between items-center border-b border-slate-100">
                          <div>
                            <div className="font-bold text-slate-900">{item.naam}</div>
                            <div className="text-sm text-amber-700">{item.shreni} · GST {item.gstDar}% · मूल्य खुद भरें</div>
                          </div>
                          <div className="text-sm text-amber-600 font-bold">+ जोड़ें</div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {!manual && searchMode === "category" && (
            <div>
              {!selectedShreni ? (
                <div className="grid grid-cols-2 gap-2">
                  {masterCatalog.map((cat) => (
                    <button key={cat.shreni} onClick={() => setSelectedShreni(cat.shreni)}
                      className="py-3 px-3 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-400 transition text-center">
                      {cat.shreni}
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <button onClick={() => setSelectedShreni(null)}
                      className="text-sm font-bold text-blue-700 border-2 border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
                      ← वापस
                    </button>
                    <span className="text-base font-extrabold text-slate-700">{selectedShreni}</span>
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {masterCatalog.find((c) => c.shreni === selectedShreni)?.samaan.map((item) => {
                      const inStock = samaanSuchi?.find((s) => s.naam === item.naam);
                      return (
                        <div key={item.naam} onClick={() => addCatalogItem(item, selectedShreni)}
                          className="flex justify-between items-center px-4 py-3 rounded-xl hover:bg-blue-50 cursor-pointer border-2 border-transparent hover:border-blue-200 transition">
                          <div>
                            <div className="text-base font-bold text-slate-800">{item.naam}</div>
                            <div className="text-sm text-slate-500">GST: {item.gstDar}% · {item.ikaai}</div>
                          </div>
                          <div className="text-right">
                            {inStock ? (
                              <div className="text-base font-extrabold text-green-700">₹{inStock.bikriMulya}</div>
                            ) : (
                              <div className="text-sm text-slate-400">स्टॉक में नहीं</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {items.length > 0 && (
            <>
              {itemsWithZeroPrice.length > 0 && (
                <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800 font-semibold">
                    {itemsWithZeroPrice.length} सामान बिना मूल्य — नीचे मूल्य भरें वर्ना बिल नहीं बनेगा
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-2 lg:hidden">
                <AnimatePresence>
                  {items.map((i) => {
                    const { cgst, sgst, kul } = gstCalc(i.bikriMulya, i.quantity, i.gstDar ?? 18);
                    const noPrice = !i.bikriMulya || i.bikriMulya <= 0;
                    return (
                      <motion.div key={i.id} layout
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                        className={`border-2 rounded-xl p-4 ${noPrice ? "border-amber-300 bg-amber-50/50" : "border-slate-200 bg-slate-50"}`}>
                        <div className="flex justify-between items-start">
                          <div className="font-extrabold text-slate-900">{i.naam}</div>
                          <button onClick={() => removeItem(i.id)}
                            className="text-red-500 hover:bg-red-50 rounded-full w-7 h-7 flex items-center justify-center transition">
                            <X className="w-4 h-4" strokeWidth={3} />
                          </button>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">HSN: {i.hsnCode ?? "—"} · GST: {i.gstDar ?? 18}%</div>
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          <div>
                            <div className="text-[10px] text-slate-500 mb-1 uppercase font-bold tracking-wide">मात्रा</div>
                            <input type="number" min={1} value={i.quantity}
                              onChange={(e) => updateQty(i.id, Number(e.target.value))}
                              className="w-20 border-2 border-slate-200 rounded-xl px-3 py-2 text-center text-base font-bold outline-none focus:border-blue-500 transition text-slate-800 bg-white" />
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 mb-1 uppercase font-bold tracking-wide">मूल्य ₹</div>
                            <input type="number" min={0} value={i.bikriMulya}
                              onChange={(e) => updatePrice(i.id, e.target.value)}
                              className={`w-28 border-2 rounded-xl px-3 py-2 text-center text-base font-bold outline-none transition bg-white ${noPrice ? "border-amber-400 focus:border-amber-600" : "border-slate-200 focus:border-blue-500"} text-slate-800`} />
                          </div>
                          <div className="ml-auto">
                            <div className="text-[10px] text-slate-500 mb-1 uppercase font-bold tracking-wide">कुल</div>
                            <div className="text-xl font-extrabold text-green-700">₹{kul}</div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 mt-2">CGST: ₹{cgst} + SGST: ₹{sgst}</div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              <div className="mt-4 hidden lg:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide">
                      <th className="px-3 py-2 text-left font-bold">सामान</th>
                      <th className="px-3 py-2 text-left font-bold">HSN</th>
                      <th className="px-3 py-2 text-center font-bold">मात्रा</th>
                      <th className="px-3 py-2 text-right font-bold">मूल्य ₹</th>
                      <th className="px-3 py-2 text-right font-bold">GST%</th>
                      <th className="px-3 py-2 text-right font-bold">CGST</th>
                      <th className="px-3 py-2 text-right font-bold">SGST</th>
                      <th className="px-3 py-2 text-right font-bold">कुल</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((i) => {
                      const { cgst, sgst, kul } = gstCalc(i.bikriMulya, i.quantity, i.gstDar ?? 18);
                      const noPrice = !i.bikriMulya || i.bikriMulya <= 0;
                      return (
                        <tr key={i.id} className={`border-t border-slate-100 ${noPrice ? "bg-amber-50/50" : ""}`}>
                          <td className="px-3 py-2 font-bold text-slate-900">{i.naam}</td>
                          <td className="px-3 py-2 text-slate-400">{i.hsnCode ?? "—"}</td>
                          <td className="px-3 py-2 text-center">
                            <input type="number" min={1} value={i.quantity}
                              onChange={(e) => updateQty(i.id, Number(e.target.value))}
                              className="w-16 border border-slate-200 rounded px-2 py-1 text-center text-sm outline-none focus:border-blue-500 transition text-slate-800" />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input type="number" min={0} value={i.bikriMulya}
                              onChange={(e) => updatePrice(i.id, e.target.value)}
                              className={`w-24 border rounded px-2 py-1 text-right text-sm outline-none transition text-slate-800 ${noPrice ? "border-amber-400 focus:border-amber-600" : "border-slate-200 focus:border-blue-500"}`} />
                          </td>
                          <td className="px-3 py-2 text-right text-slate-700">{i.gstDar ?? 18}%</td>
                          <td className="px-3 py-2 text-right text-orange-600 font-semibold">₹{cgst}</td>
                          <td className="px-3 py-2 text-right text-orange-600 font-semibold">₹{sgst}</td>
                          <td className="px-3 py-2 text-right font-extrabold text-green-700">₹{kul}</td>
                          <td className="px-3 py-2 text-center">
                            <button onClick={() => removeItem(i.id)}
                              className="text-red-500 hover:bg-red-50 w-8 h-8 rounded-lg flex items-center justify-center transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="w-full lg:w-80 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 lg:sticky lg:top-32">
          <div className="flex items-center gap-2 font-extrabold text-slate-900 text-base">
            <ReceiptText className="w-4 h-4 text-blue-700" />
            बिल सारांश
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">कुल सामान</span><span className="font-bold text-slate-900">{items.length}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">मूल्य (GST से पहले)</span><span className="font-bold text-slate-900">₹{summary.base.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">CGST</span><span className="text-orange-600 font-bold">₹{summary.cgst.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">SGST</span><span className="text-orange-600 font-bold">₹{summary.sgst.toFixed(2)}</span></div>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-4 text-white">
            <div className="text-xs text-blue-100 font-semibold uppercase tracking-wide">कुल रकम</div>
            <div className="text-3xl font-extrabold mt-1">₹{summary.kul.toFixed(2)}</div>
          </div>

          <div>
            <div className="text-xs text-slate-600 font-bold mb-2 uppercase tracking-wide">भुगतान का तरीका</div>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((v) => (
                <button key={v.key} onClick={() => setPayment(v.key)}
                  className={`py-3 rounded-xl text-sm font-bold border-2 transition ${payment === v.key ? "bg-blue-700 text-white border-blue-700 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"}`}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {payment === "आंशिक" && (
            <div>
              <div className="text-xs text-slate-600 font-bold mb-1 uppercase tracking-wide">अभी दी गई रकम</div>
              <input type="number" min={1} max={summary.kul - 1} value={aansikRakam}
                onChange={(e) => setAansikRakam(e.target.value)}
                placeholder={`₹${summary.kul.toFixed(2)} से कम`}
                className={inp} />
              {aansikRakam && (
                <div className="text-sm text-orange-600 font-bold mt-1">
                  बाकी उधार: ₹{(summary.kul - parseFloat(aansikRakam || 0)).toFixed(2)}
                </div>
              )}
            </div>
          )}

          <AnimatePresence>
            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                <div className="text-sm text-red-800 font-semibold">{errorMsg}</div>
              </motion.div>
            )}
          </AnimatePresence>

          <button onClick={saveBill} disabled={items.length === 0 || saving}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-4 rounded-xl font-extrabold text-lg disabled:opacity-40 disabled:cursor-not-allowed shadow-lg active:scale-[0.98] transition">
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                सेव हो रहा है...
              </>
            ) : (
              <>
                <ReceiptText className="w-5 h-5" strokeWidth={2.5} />
                बिल बनाओ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
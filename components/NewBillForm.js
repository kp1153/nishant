"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { masterCatalog } from "@/lib/catalog";

const भुगतानविधि = ["नकद", "यूपीआई", "उधार", "आंशिक"];

function gstCalc(mulya, matra, gstDar) {
  const base = mulya * matra;
  const gst = parseFloat(((base * gstDar) / 100).toFixed(2));
  const cgst = parseFloat((gst / 2).toFixed(2));
  const sgst = parseFloat((gst / 2).toFixed(2));
  return { base, gst, cgst, sgst, kul: parseFloat((base + gst).toFixed(2)) };
}

function fuzzyMatch(text, query) {
  if (!query) return false;
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  return q.split("").every(c => t.includes(c)) || t.includes(q);
}

export default function NewBillForm({ grahakSuchi, samaanSuchi }) {
  const router = useRouter();
  const [selectedGrahak, setSelectedGrahak] = useState(null);
  const [items, setItems] = useState([]);
  const [payment, setPayment] = useState("नकद");
  const [searchGrahak, setSearchGrahak] = useState("");
  const [saving, setSaving] = useState(false);
  const [manual, setManual] = useState(false);
  const [searchMode, setSearchMode] = useState("search");
  const [selectedShreni, setSelectedShreni] = useState(null);
  const [searchSamaan, setSearchSamaan] = useState("");
  const [manualItem, setManualItem] = useState({ naam: "", mulya: "", matra: "1", gstDar: "18" });
  const [aansikRakam, setAansikRakam] = useState("");

  const udharWala = payment === "उधार" || payment === "आंशिक";

  const summary = items.reduce(
    (acc, i) => {
      const { base, cgst, sgst, kul } = gstCalc(i.bikriMulya, i.quantity, i.gstDar ?? 18);
      return { base: acc.base + base, cgst: acc.cgst + cgst, sgst: acc.sgst + sgst, kul: acc.kul + kul };
    },
    { base: 0, cgst: 0, sgst: 0, kul: 0 }
  );

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
    fuzzyMatch(g.naam, searchGrahak) || g.mobile?.includes(searchGrahak)
  );

  const filteredSamaan = samaanSuchi?.filter((s) => fuzzyMatch(s.naam, searchSamaan));

  const allCatalogItems = masterCatalog.flatMap(c => c.samaan.map(s => ({ ...s, shreni: c.shreni })));
  const filteredCatalog = searchSamaan
    ? allCatalogItems.filter(s => fuzzyMatch(s.naam, searchSamaan))
    : [];

  async function sirafBilPar() {
    setSelectedGrahak({ id: null, naam: searchGrahak, mobile: null });
    setSearchGrahak("");
  }

  async function dbMeinBhiSave() {
    const res = await fetch("/api/grahak", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ naam: searchGrahak, mobile: "" }) });
    if (res.ok) {
      const data = await res.json();
      setSelectedGrahak({ id: data.id, naam: searchGrahak, mobile: null });
      setSearchGrahak("");
    }
  }

  async function saveBill() {
    if (items.length === 0) return;
    if (udharWala && !selectedGrahak?.id) return alert("उधार के लिए ग्राहक जरूरी है");
    if (payment === "आंशिक") {
      const rakam = parseFloat(aansikRakam);
      if (!rakam || rakam <= 0 || rakam >= summary.kul) return alert("आंशिक रकम सही नहीं है");
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
    }
  }

  const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:border-blue-400 text-gray-800";

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1 space-y-4">

        {/* ग्राहक */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-extrabold text-gray-800 text-base">👤 ग्राहक</div>
            <span className="text-sm text-gray-400">{udharWala ? "⚠️ उधार के लिए जरूरी" : "वैकल्पिक"}</span>
          </div>
          {selectedGrahak ? (
            <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3">
              <div>
                <div className="font-extrabold text-gray-900 text-base">{selectedGrahak.naam}</div>
                <div className="text-sm text-gray-500">{selectedGrahak.mobile ?? "नया ग्राहक"}</div>
              </div>
              <button onClick={() => setSelectedGrahak(null)} className="text-sm text-red-500 font-bold border border-red-200 px-3 py-1.5 rounded-lg">बदलें</button>
            </div>
          ) : (
            <div>
              <input className={inp} placeholder="नाम या मोबाइल से खोजें" value={searchGrahak} onChange={(e) => setSearchGrahak(e.target.value)} />
              {searchGrahak && (
                <div className="w-full bg-white border border-gray-200 rounded-xl mt-1 shadow max-h-60 overflow-y-auto">
                  {filteredGrahak?.map((g) => (
                    <div key={g.id} onClick={() => { setSelectedGrahak(g); setSearchGrahak(""); }} className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
                      <div className="font-bold text-base text-gray-800">{g.naam}</div>
                      <div className="text-sm text-gray-400">{g.mobile}</div>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 p-3 bg-gray-50 space-y-2">
                    <div className="text-sm text-gray-400">"{searchGrahak}" सूची में नहीं है</div>
                    <div className="flex gap-2">
                      <button onClick={sirafBilPar} className="flex-1 text-sm font-bold bg-white border border-gray-300 text-gray-700 px-3 py-2.5 rounded-xl">सिर्फ बिल पर</button>
                      <button onClick={dbMeinBhiSave} className="flex-1 text-sm font-bold bg-blue-600 text-white px-3 py-2.5 rounded-xl">सूची में भी जोड़ें</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* सामान */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-extrabold text-gray-800 text-base">📦 सामान जोड़ें</div>
            <button onClick={() => setManual(!manual)} className="text-sm font-bold bg-gray-100 text-gray-700 px-3 py-2 rounded-xl">
              {manual ? "खोज से चुनें" : "+ खुद लिखें"}
            </button>
          </div>

          {!manual && (
            <div className="flex gap-2 mb-3">
              <button onClick={() => { setSearchMode("search"); setSelectedShreni(null); }}
                className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${searchMode === "search" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}>
                🔍 नाम से खोजें
              </button>
              <button onClick={() => { setSearchMode("category"); setSelectedShreni(null); }}
                className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${searchMode === "category" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}>
                📋 श्रेणी से चुनें
              </button>
            </div>
          )}

          {manual && (
            <div className="flex flex-col gap-3 mb-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <input placeholder="सामान का नाम" value={manualItem.naam} onChange={(e) => setManualItem({ ...manualItem, naam: e.target.value })} className={inp} />
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <div className="text-sm text-gray-500 mb-1 font-medium">मूल्य ₹</div>
                  <input type="number" placeholder="500" value={manualItem.mulya} onChange={(e) => setManualItem({ ...manualItem, mulya: e.target.value })} className={inp} />
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1 font-medium">मात्रा</div>
                  <input type="number" placeholder="1" value={manualItem.matra} onChange={(e) => setManualItem({ ...manualItem, matra: e.target.value })} className={inp} />
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1 font-medium">जीएसटी %</div>
                  <select value={manualItem.gstDar} onChange={(e) => setManualItem({ ...manualItem, gstDar: e.target.value })} className={inp}>
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
              </div>
              <button onClick={addManualItem} className="w-full bg-blue-600 text-white py-3 rounded-xl text-base font-bold">जोड़ें</button>
            </div>
          )}

          {!manual && searchMode === "search" && (
            <div>
              <input className={inp} placeholder="सामान का नाम लिखें — जैसे: पाइप, बल्ब, सीमेंट" value={searchSamaan} onChange={(e) => setSearchSamaan(e.target.value)} />
              {searchSamaan && (
                <div className="w-full bg-white border border-gray-200 rounded-xl mt-1 shadow max-h-60 overflow-y-auto">
                  {filteredSamaan?.length === 0 && filteredCatalog.length === 0 ? (
                    <div className="px-4 py-4 text-base text-gray-400">सामान नहीं मिला</div>
                  ) : (
                    <>
                      {filteredSamaan?.map((s) => (
                        <div key={s.id} onClick={() => addItem(s)} className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-50">
                          <div>
                            <div className="font-bold text-base text-gray-800">{s.naam}</div>
                            <div className="text-sm text-gray-400">{s.shreni} · {s.matra} {s.ikaai} बचा · जीएसटी {s.gstDar ?? 18}%</div>
                          </div>
                          <div className="text-base font-extrabold text-gray-800">₹{s.bikriMulya}</div>
                        </div>
                      ))}
                      {filteredCatalog.filter(c => !samaanSuchi?.find(s => s.naam === c.naam)).map((item) => (
                        <div key={item.naam} onClick={() => addCatalogItem(item, item.shreni)} className="px-4 py-3 hover:bg-amber-50 cursor-pointer flex justify-between items-center border-b border-gray-50">
                          <div>
                            <div className="font-bold text-base text-gray-800">{item.naam}</div>
                            <div className="text-sm text-amber-600">{item.shreni} · जीएसटी {item.gstDar}% · मूल्य खुद भरें</div>
                          </div>
                          <div className="text-sm text-amber-500 font-bold">+ जोड़ें</div>
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
                      className="py-3 px-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-all text-center">
                      {cat.shreni}
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <button onClick={() => setSelectedShreni(null)} className="text-sm font-bold text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg">← वापस</button>
                    <span className="text-base font-extrabold text-gray-700">{selectedShreni}</span>
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {masterCatalog.find((c) => c.shreni === selectedShreni)?.samaan.map((item) => {
                      const inStock = samaanSuchi?.find((s) => s.naam === item.naam);
                      return (
                        <div key={item.naam} onClick={() => addCatalogItem(item, selectedShreni)}
                          className="flex justify-between items-center px-4 py-3 rounded-xl hover:bg-blue-50 cursor-pointer border border-transparent hover:border-blue-200">
                          <div>
                            <div className="text-base font-bold text-gray-800">{item.naam}</div>
                            <div className="text-sm text-gray-400">जीएसटी: {item.gstDar}% · {item.ikaai}</div>
                          </div>
                          <div className="text-right">
                            {inStock ? (
                              <div className="text-base font-extrabold text-green-700">₹{inStock.bikriMulya}</div>
                            ) : (
                              <div className="text-sm text-gray-400">स्टॉक में नहीं</div>
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
              <div className="mt-4 space-y-2 lg:hidden">
                {items.map((i) => {
                  const { cgst, sgst, kul } = gstCalc(i.bikriMulya, i.quantity, i.gstDar ?? 18);
                  return (
                    <div key={i.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="font-extrabold text-base text-gray-900">{i.naam}</div>
                        <button onClick={() => removeItem(i.id)} className="text-red-400 text-2xl leading-none">×</button>
                      </div>
                      <div className="text-sm text-gray-400 mt-0.5">एचएसएन: {i.hsnCode ?? "—"} · जीएसटी: {i.gstDar ?? 18}%</div>
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">मात्रा</div>
                          <input type="number" min={1} value={i.quantity} onChange={(e) => updateQty(i.id, Number(e.target.value))}
                            className="w-20 border border-gray-300 rounded-xl px-3 py-2 text-center text-base font-bold outline-none text-gray-800" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">मूल्य ₹</div>
                          <input type="number" min={0} value={i.bikriMulya} onChange={(e) => updatePrice(i.id, e.target.value)}
                            className="w-28 border border-gray-300 rounded-xl px-3 py-2 text-center text-base font-bold outline-none text-gray-800" />
                        </div>
                        <div className="ml-auto">
                          <div className="text-xs text-gray-500 mb-1">कुल</div>
                          <div className="text-xl font-extrabold text-green-700">₹{kul}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400 mt-2">सीजीएसटी: ₹{cgst} + एसजीएसटी: ₹{sgst}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 hidden lg:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500">
                      <th className="px-3 py-2 text-left">सामान</th>
                      <th className="px-3 py-2 text-left">एचएसएन</th>
                      <th className="px-3 py-2 text-center">मात्रा</th>
                      <th className="px-3 py-2 text-right">मूल्य ₹</th>
                      <th className="px-3 py-2 text-right">जीएसटी%</th>
                      <th className="px-3 py-2 text-right">सीजीएसटी</th>
                      <th className="px-3 py-2 text-right">एसजीएसटी</th>
                      <th className="px-3 py-2 text-right">कुल</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((i) => {
                      const { cgst, sgst, kul } = gstCalc(i.bikriMulya, i.quantity, i.gstDar ?? 18);
                      return (
                        <tr key={i.id} className="border-t border-gray-50">
                          <td className="px-3 py-2 font-bold text-gray-800">{i.naam}</td>
                          <td className="px-3 py-2 text-gray-400">{i.hsnCode ?? "—"}</td>
                          <td className="px-3 py-2 text-center">
                            <input type="number" min={1} value={i.quantity} onChange={(e) => updateQty(i.id, Number(e.target.value))}
                              className="w-16 border border-gray-200 rounded px-2 py-1 text-center text-sm outline-none text-gray-800" />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input type="number" min={0} value={i.bikriMulya} onChange={(e) => updatePrice(i.id, e.target.value)}
                              className="w-24 border border-gray-200 rounded px-2 py-1 text-right text-sm outline-none text-gray-800" />
                          </td>
                          <td className="px-3 py-2 text-right text-gray-700">{i.gstDar ?? 18}%</td>
                          <td className="px-3 py-2 text-right text-orange-600">₹{cgst}</td>
                          <td className="px-3 py-2 text-right text-orange-600">₹{sgst}</td>
                          <td className="px-3 py-2 text-right font-extrabold text-gray-900">₹{kul}</td>
                          <td className="px-3 py-2 text-center">
                            <button onClick={() => removeItem(i.id)} className="text-red-400 hover:text-red-600 text-xl">×</button>
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

      {/* बिल सारांश */}
      <div className="w-full lg:w-80 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="font-extrabold text-gray-800 text-base">💰 बिल सारांश</div>
          <div className="flex justify-between text-base">
            <span className="text-gray-500">कुल सामान</span>
            <span className="font-bold text-gray-800">{items.length}</span>
          </div>
          <div className="flex justify-between text-base">
            <span className="text-gray-500">मूल्य (जीएसटी से पहले)</span>
            <span className="font-bold text-gray-800">₹{summary.base.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base">
            <span className="text-gray-500">सीजीएसटी</span>
            <span className="text-orange-600 font-bold">₹{summary.cgst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base">
            <span className="text-gray-500">एसजीएसटी</span>
            <span className="text-orange-600 font-bold">₹{summary.sgst.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between">
            <span className="text-gray-600 text-base font-medium">कुल रकम</span>
            <span className="font-extrabold text-gray-900 text-3xl">₹{summary.kul.toFixed(2)}</span>
          </div>

          <div>
            <div className="text-base text-gray-600 font-medium mb-2">भुगतान का तरीका</div>
            <div className="grid grid-cols-2 gap-2">
              {भुगतानविधि.map((v) => (
                <button key={v} onClick={() => setPayment(v)}
                  className={`py-3 rounded-xl text-base font-bold border transition-all ${payment === v ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          {payment === "आंशिक" && (
            <div>
              <div className="text-base text-gray-600 font-medium mb-1">अभी दी गई रकम</div>
              <input type="number" min={1} max={summary.kul - 1} value={aansikRakam} onChange={(e) => setAansikRakam(e.target.value)}
                placeholder={`₹${summary.kul.toFixed(2)} से कम`}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:border-blue-400 text-gray-800" />
              {aansikRakam && (
                <div className="text-base text-orange-600 font-bold mt-1">
                  बाकी उधार: ₹{(summary.kul - parseFloat(aansikRakam || 0)).toFixed(2)}
                </div>
              )}
            </div>
          )}

          <button onClick={saveBill} disabled={items.length === 0 || saving}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-extrabold text-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-700 transition-colors">
            {saving ? "सेव हो रहा है..." : "🧾 बिल बनाओ"}
          </button>
        </div>
      </div>
    </div>
  );
}
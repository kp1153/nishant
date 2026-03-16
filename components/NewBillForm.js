"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const paymentMethods = ["नकद", "UPI", "उधार", "आंशिक"];

function gstCalc(mulya, matra, gstDar) {
  const base = mulya * matra;
  const gst = parseFloat(((base * gstDar) / 100).toFixed(2));
  const cgst = parseFloat((gst / 2).toFixed(2));
  const sgst = parseFloat((gst / 2).toFixed(2));
  return { base, gst, cgst, sgst, kul: parseFloat((base + gst).toFixed(2)) };
}

export default function NewBillForm({ grahakSuchi, samaanSuchi }) {
  const router = useRouter();
  const [selectedGrahak, setSelectedGrahak] = useState(null);
  const [items, setItems] = useState([]);
  const [payment, setPayment] = useState("नकद");
  const [searchGrahak, setSearchGrahak] = useState("");
  const [searchSamaan, setSearchSamaan] = useState("");
  const [saving, setSaving] = useState(false);
  const [manual, setManual] = useState(false);
  const [manualItem, setManualItem] = useState({
    naam: "",
    mulya: "",
    matra: "1",
    gstDar: "18",
  });
  const [manual, setManual] = useState(false);
  const [manualItem, setManualItem] = useState({
    naam: "",
    mulya: "",
    matra: "1",
    gstDar: "18",
  });
  const [aansikRakam, setAansikRakam] = useState("");

  const udharWala = payment === "उधार" || payment === "आंशिक";

  const summary = items.reduce(
    (acc, i) => {
      const { base, cgst, sgst, kul } = gstCalc(
        i.bikriMulya,
        i.quantity,
        i.gstDar ?? 18,
      );
      return {
        base: acc.base + base,
        cgst: acc.cgst + cgst,
        sgst: acc.sgst + sgst,
        kul: acc.kul + kul,
      };
    },
    { base: 0, cgst: 0, sgst: 0, kul: 0 },
  );

  function addItem(s) {
    const exists = items.find((i) => i.id === s.id);
    if (exists) {
      setItems(
        items.map((i) =>
          i.id === s.id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      );
    } else {
      setItems([...items, { ...s, quantity: 1 }]);
    }
    setSearchSamaan("");
  }

  function updateQty(id, val) {
    if (val < 1) return;
    setItems(items.map((i) => (i.id === id ? { ...i, quantity: val } : i)));
  }

  function removeItem(id) {
    setItems(items.filter((i) => i.id !== id));
  }
  function addManualItem() {
    if (!manualItem.naam || !manualItem.mulya) return;
    const id = `manual-${Date.now()}`;
    setItems([
      ...items,
      {
        id,
        naam: manualItem.naam,
        bikriMulya: parseFloat(manualItem.mulya),
        quantity: parseInt(manualItem.matra) || 1,
        gstDar: parseFloat(manualItem.gstDar) || 18,
        hsnCode: null,
        isManual: true,
      },
    ]);
    setManualItem({ naam: "", mulya: "", matra: "1", gstDar: "18" });
    setManual(false);
  }

  const filteredGrahak = grahakSuchi?.filter(
    (g) => g.naam.includes(searchGrahak) || g.mobile.includes(searchGrahak),
  );

  const filteredSamaan = samaanSuchi?.filter((s) =>
    s.naam.includes(searchSamaan),
  );

  async function sirafBilPar() {
    setSelectedGrahak({ id: null, naam: searchGrahak, mobile: null });
    setSearchGrahak("");
  }

  async function dbMeinBhiSave() {
    const res = await fetch("/api/grahak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam: searchGrahak, mobile: "" }),
    });
    if (res.ok) {
      const data = await res.json();
      setSelectedGrahak({ id: data.id, naam: searchGrahak, mobile: null });
      setSearchGrahak("");
    }
  }

  async function saveBill() {
    if (items.length === 0) return;
    if (udharWala && !selectedGrahak?.id)
      return alert("उधार के लिए ग्राहक जरूरी है");
    if (payment === "आंशिक") {
      const rakam = parseFloat(aansikRakam);
      if (!rakam || rakam <= 0 || rakam >= summary.kul)
        return alert("आंशिक रकम सही नहीं है");
    }
    setSaving(true);
    const res = await fetch("/api/bill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grahakId: selectedGrahak?.id ?? null,
        grahakNaam: selectedGrahak?.naam ?? null,
        items: items.map((i) => {
          const { base, cgst, sgst, kul } = gstCalc(
            i.bikriMulya,
            i.quantity,
            i.gstDar ?? 18,
          );
          return {
            id: i.isManual ? null : i.id,
            naam: i.naam,
            matra: i.quantity,
            mulya: i.bikriMulya,
            gstDar: i.gstDar ?? 18,
            cgst,
            sgst,
            kul,
          };
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

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-bold text-gray-700">👤 ग्राहक</div>
            <span className="text-xs text-gray-400">
              {udharWala ? "⚠️ उधार के लिए जरूरी" : "वैकल्पिक"}
            </span>
          </div>
          {selectedGrahak ? (
            <div className="flex items-center justify-between bg-blue-50 rounded-lg px-4 py-3">
              <div>
                <div className="font-semibold text-gray-800">
                  {selectedGrahak.naam}
                </div>
                <div className="text-xs text-gray-500">
                  {selectedGrahak.mobile ?? "नया ग्राहक"}
                </div>
              </div>
              <button
                onClick={() => setSelectedGrahak(null)}
                className="text-xs text-red-500 font-semibold"
              >
                बदलें
              </button>
            </div>
          ) : (
            <div>
              <input
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gray-400 text-gray-800"
                placeholder="नाम या मोबाइल से खोजें"
                value={searchGrahak}
                onChange={(e) => setSearchGrahak(e.target.value)}
              />
              {searchGrahak && (
                <div className="w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-sm max-h-60 overflow-y-auto">
                  {filteredGrahak?.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => {
                        setSelectedGrahak(g);
                        setSearchGrahak("");
                      }}
                      className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50"
                    >
                      <div className="font-semibold text-sm text-gray-800">
                        {g.naam}
                      </div>
                      <div className="text-xs text-gray-400">{g.mobile}</div>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 p-3 bg-gray-50 space-y-2">
                    <div className="text-xs text-gray-400">
                      "{searchGrahak}" सूची में नहीं है
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={sirafBilPar}
                        className="flex-1 text-xs font-semibold bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100"
                      >
                        सिर्फ बिल पर
                      </button>
                      <button
                        onClick={dbMeinBhiSave}
                        className="flex-1 text-xs font-semibold bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600"
                      >
                        सूची में भी जोड़ें
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-bold text-gray-700">📦 सामान जोड़ें</div>
            <button
              onClick={() => setManual(!manual)}
              className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200"
            >
              {manual ? "लिस्ट से चुनें" : "+ मैनुअल जोड़ें"}
            </button>
          </div>
          {manual && (
            <div className="flex flex-col gap-2 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <input
                placeholder="सामान का नाम"
                value={manualItem.naam}
                onChange={(e) =>
                  setManualItem({ ...manualItem, naam: e.target.value })
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 text-gray-800"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="मूल्य ₹"
                  value={manualItem.mulya}
                  onChange={(e) =>
                    setManualItem({ ...manualItem, mulya: e.target.value })
                  }
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 text-gray-800"
                />
                <input
                  type="number"
                  placeholder="मात्रा"
                  value={manualItem.matra}
                  onChange={(e) =>
                    setManualItem({ ...manualItem, matra: e.target.value })
                  }
                  className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 text-gray-800"
                />
                <input
                  type="number"
                  placeholder="GST%"
                  value={manualItem.gstDar}
                  onChange={(e) =>
                    setManualItem({ ...manualItem, gstDar: e.target.value })
                  }
                  className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 text-gray-800"
                />
              </div>
              <button
                onClick={addManualItem}
                className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-600"
              >
                जोड़ें
              </button>
            </div>
          )}
          <div>
            <input
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gray-400 text-gray-800"
              placeholder="सामान का नाम लिखें"
              value={searchSamaan}
              onChange={(e) => setSearchSamaan(e.target.value)}
            />
            {searchSamaan && (
              <div className="w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-sm max-h-48 overflow-y-auto">
                {filteredSamaan?.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-400">
                    सामान नहीं मिला
                  </div>
                ) : (
                  filteredSamaan?.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => addItem(s)}
                      className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-50"
                    >
                      <div>
                        <div className="font-semibold text-sm text-gray-800">
                          {s.naam}
                        </div>
                        <div className="text-xs text-gray-400">
                          {s.shreni} · {s.matra} {s.ikaai} बचा · GST{" "}
                          {s.gstDar ?? 18}%
                        </div>
                      </div>
                      <div className="text-sm font-bold text-gray-700">
                        ₹{s.bikriMulya}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <>
              <div className="mt-4 space-y-2 lg:hidden">
                {items.map((i) => {
                  const { cgst, sgst, kul } = gstCalc(
                    i.bikriMulya,
                    i.quantity,
                    i.gstDar ?? 18,
                  );
                  return (
                    <div
                      key={i.id}
                      className="border border-gray-100 rounded-lg p-3 bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-semibold text-sm text-gray-800">
                          {i.naam}
                        </div>
                        <button
                          onClick={() => removeItem(i.id)}
                          className="text-red-400 text-lg leading-none"
                        >
                          ×
                        </button>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        HSN: {i.hsnCode ?? "—"} · GST: {i.gstDar ?? 18}%
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <input
                          type="number"
                          min={1}
                          value={i.quantity}
                          onChange={(e) =>
                            updateQty(i.id, Number(e.target.value))
                          }
                          className="w-16 border border-gray-200 rounded px-2 py-1 text-center text-sm outline-none text-gray-800"
                        />
                        <span className="text-xs text-gray-500">
                          × ₹{i.bikriMulya}
                        </span>
                        <span className="ml-auto text-sm font-bold text-green-700">
                          ₹{kul}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        CGST: ₹{cgst} + SGST: ₹{sgst}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 hidden lg:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500">
                      <th className="px-3 py-2 text-left">सामान</th>
                      <th className="px-3 py-2 text-left">HSN</th>
                      <th className="px-3 py-2 text-center">मात्रा</th>
                      <th className="px-3 py-2 text-right">मूल्य</th>
                      <th className="px-3 py-2 text-right">GST%</th>
                      <th className="px-3 py-2 text-right">CGST</th>
                      <th className="px-3 py-2 text-right">SGST</th>
                      <th className="px-3 py-2 text-right">कुल</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((i) => {
                      const { cgst, sgst, kul } = gstCalc(
                        i.bikriMulya,
                        i.quantity,
                        i.gstDar ?? 18,
                      );
                      return (
                        <tr key={i.id} className="border-t border-gray-50">
                          <td className="px-3 py-2 font-semibold text-gray-800">
                            {i.naam}
                          </td>
                          <td className="px-3 py-2 text-gray-400">
                            {i.hsnCode ?? "—"}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <input
                              type="number"
                              min={1}
                              value={i.quantity}
                              onChange={(e) =>
                                updateQty(i.id, Number(e.target.value))
                              }
                              className="w-16 border border-gray-200 rounded px-2 py-1 text-center text-sm outline-none text-gray-800"
                            />
                          </td>
                          <td className="px-3 py-2 text-right text-gray-700">
                            ₹{i.bikriMulya}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-700">
                            {i.gstDar ?? 18}%
                          </td>
                          <td className="px-3 py-2 text-right text-orange-600">
                            ₹{cgst}
                          </td>
                          <td className="px-3 py-2 text-right text-orange-600">
                            ₹{sgst}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-gray-800">
                            ₹{kul}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => removeItem(i.id)}
                              className="text-red-400 hover:text-red-600 text-lg"
                            >
                              ×
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

      <div className="w-full lg:w-72 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="font-bold text-gray-700">💰 बिल सारांश</div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">कुल आइटम</span>
            <span className="font-semibold text-gray-800">{items.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">मूल्य (GST से पहले)</span>
            <span className="font-semibold text-gray-800">
              ₹{summary.base.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">CGST</span>
            <span className="text-orange-600 font-semibold">
              ₹{summary.cgst.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">SGST</span>
            <span className="text-orange-600 font-semibold">
              ₹{summary.sgst.toFixed(2)}
            </span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between">
            <span className="text-gray-500 text-sm">कुल रकम</span>
            <span className="font-bold text-gray-900 text-lg">
              ₹{summary.kul.toFixed(2)}
            </span>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-2">भुगतान विधि</div>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((v) => (
                <button
                  key={v}
                  onClick={() => setPayment(v)}
                  className={`py-2 rounded-lg text-sm font-semibold border transition-all ${payment === v ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {payment === "आंशिक" && (
            <div>
              <div className="text-sm text-gray-500 mb-1">अभी दी गई रकम</div>
              <input
                type="number"
                min={1}
                max={summary.kul - 1}
                value={aansikRakam}
                onChange={(e) => setAansikRakam(e.target.value)}
                placeholder={`कुल ₹${summary.kul.toFixed(2)} से कम`}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gray-400 text-gray-800"
              />
              {aansikRakam && (
                <div className="text-xs text-orange-600 mt-1">
                  बाकी उधार: ₹
                  {(summary.kul - parseFloat(aansikRakam || 0)).toFixed(2)}
                </div>
              )}
            </div>
          )}

          <button
            onClick={saveBill}
            disabled={items.length === 0 || saving}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-600 transition-colors"
          >
            {saving ? "सेव हो रहा है..." : "🧾 बिल सेव करें"}
          </button>
        </div>
      </div>
    </div>
  );
}

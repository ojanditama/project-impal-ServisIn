"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomerBottomNav from "@/components/CustomerBottomNav";
import { AIChatbot, DiagnosticReport } from "@/models/AIChatbot";

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  time: string;
  diagnostic?: DiagnosticReport;
}

export default function AiDiagnosticPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "ai",
      text: "Halo Rizky! 👋 Saya asisten telemetri & diagnosa AI ServisIn. Ceritakan kendalamu: apakah ada bunyi decit mesin, asap knalpot mencurigakan, getaran setir, atau indikator sensor speedometer yang menyala?",
      time: "10:41 WIB",
    },
    {
      id: "msg-2",
      sender: "user",
      text: "Mesin mobil Avanza 2020 saya bunyi berdecit keras saat AC dinyalakan dan agak bergetar saat tarikan awal.",
      time: "10:42 WIB",
    },
    {
      id: "msg-3",
      sender: "ai",
      text: "Berdasarkan analisis telemetri suara dan beban mesin Avanza Anda, bunyi berdecit saat AC menyala 88% diakibatkan oleh Fan Belt kendur/aus.",
      time: "10:42 WIB",
      diagnostic: {
        title: "Hasil Diagnosa AI",
        accuracy: 94,
        breakdown: [
          {
            name: "Fan Belt / V-Belt Kendur atau Aus",
            probability: 88,
            explanation:
              "Beban putaran kompresor AC menyebabkan belt selip dan berdecit tajam.",
          },
          {
            name: "Magnetic Clutch AC Kompresor",
            probability: 12,
            explanation:
              "Bearing puli kompresor AC aus atau celah kopling magnetik tidak rata.",
          },
        ],
        costEstimate: "Rp 120rb - 180rb",
        urgency: "Sedang (1 - 3 Hari)",
        recommendation:
          "Lakukan penyetelan tegangan tensioner atau ganti 1 set V-Belt 4PK/6PK OEM Toyota. Pengecekan bearing pulley juga dianjurkan.",
        recommendedService: "Tune Up & Ganti Fan Belt",
      },
    },
  ]);

  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: "usr-" + Date.now(),
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    const bot = new AIChatbot({
      id: "bot-" + Date.now(),
      userId: "usr-cst-001",
      queryText: textToSend,
    });

    await bot.sendGeminiPrompt();

    setTimeout(() => {
      setThinking(false);
      const aiReply: ChatMessage = {
        id: "ai-" + Date.now(),
        sender: "ai",
        text: bot.responseText,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
        diagnostic: bot.diagnosticData,
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 700);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-surface flex flex-col justify-between pb-20 selection:bg-primary-fixed selection:text-on-primary-fixed relative">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface/85 backdrop-blur-xl border-b border-surface-container-high/40 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              arrow_back
            </span>
          </Link>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
              ServisIn
            </span>
            <span className="text-[10px] text-primary-container font-bold uppercase tracking-wider">
              AI DIAGNOSTIK
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              dark_mode
            </span>
          </button>
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80"
            alt="Profil"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-container/30"
          />
        </div>
      </header>

      {/* Sub-header Banner */}
      <div className="px-4 pt-3">
        <div className="bg-surface-container-lowest rounded-2xl p-3 border border-surface-container-high/60 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                  smart_toy
                </span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-label-lg text-label-lg font-bold text-on-surface">
                  ServisBot AI
                </h2>
                <span className="px-1.5 py-0.2 rounded bg-secondary-fixed text-secondary font-bold text-[9px]">
                  v4.8 Neural
                </span>
              </div>
              <span className="text-[10px] text-on-surface-variant">
                Aktif • 2.4k database mesin
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-bold text-[10px] shadow-sm">
              ★ VIP MEMBER
            </span>
            <span className="text-[10px] text-on-surface-variant block mt-0.5">
              Toyota Avanza 2020
            </span>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 px-4 py-3 flex flex-col gap-3.5 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            {msg.sender === "ai" ? (
              <div className="flex items-start gap-2 max-w-[92%]">
                <div className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container flex-shrink-0 mt-1">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    psychology
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="bg-surface-container p-3.5 rounded-2xl rounded-tl-sm text-on-surface text-xs leading-relaxed shadow-sm">
                    {msg.text}
                  </div>

                  {/* If this message contains rich diagnostic card */}
                  {msg.diagnostic && (
                    <div className="bg-surface-container-lowest rounded-2xl p-4 border border-surface-container-high/80 shadow-md flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 20 }}>
                            analytics
                          </span>
                          <div>
                            <h3 className="font-label-lg text-label-lg font-bold text-on-surface">
                              {msg.diagnostic.title}
                            </h3>
                            <span className="text-[10px] text-on-surface-variant">
                              Pencocokan 14.200 log kasus Avanza
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-bold text-[10px]">
                          Akurasi {msg.diagnostic.accuracy}%
                        </span>
                      </div>

                      {/* Breakdown Bars */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                          ESTIMASI TITIK KERUSAKAN
                        </span>

                        {msg.diagnostic.breakdown.map((item, idx) => (
                          <div key={idx} className="bg-surface-container-low p-2.5 rounded-xl flex flex-col gap-1">
                            <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                              <span className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${idx === 0 ? "bg-primary-container" : "bg-secondary"}`}></span>
                                {item.name}
                              </span>
                              <span className={idx === 0 ? "text-primary-container font-black" : "text-secondary"}>
                                {item.probability}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${idx === 0 ? "bg-primary-container" : "bg-secondary"}`}
                                style={{ width: `${item.probability}%` }}
                              ></div>
                            </div>
                            <p className="text-[11px] text-on-surface-variant mt-0.5">
                              {item.explanation}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* 2-col Metrics */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-surface-container-low p-2 rounded-xl text-center">
                          <span className="text-[10px] text-on-surface-variant block font-medium">
                            ESTIMASI BIAYA
                          </span>
                          <span className="text-xs font-bold text-on-surface">
                            {msg.diagnostic.costEstimate}
                          </span>
                          <span className="text-[9px] text-on-surface-variant block">Termasuk jasa stel/ganti</span>
                        </div>

                        <div className="bg-surface-container-low p-2 rounded-xl text-center">
                          <span className="text-[10px] text-on-surface-variant block font-medium">
                            URGENSI
                          </span>
                          <span className="text-xs font-bold text-primary-container">
                            {msg.diagnostic.urgency}
                          </span>
                          <span className="text-[9px] text-on-surface-variant block">Cegah putus di jalan</span>
                        </div>
                      </div>

                      {/* Recommendation */}
                      <div className="bg-surface-container p-2.5 rounded-xl text-[11px] text-on-surface leading-snug flex items-start gap-2">
                        <span className="material-symbols-outlined text-secondary flex-shrink-0" style={{ fontSize: 18 }}>
                          verified
                        </span>
                        <div>
                          <strong className="block text-on-surface font-semibold mb-0.5">
                            Rekomendasi Teknisi ServisIn:
                          </strong>
                          <span>{msg.diagnostic.recommendation}</span>
                        </div>
                      </div>

                      {/* Order CTA */}
                      <button
                        onClick={() => router.push("/booking?ref=ai_diagnostic")}
                        className="w-full h-11 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-[0.99] transition-all"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                          engineering
                        </span>
                        <span>Pesan Montir untuk Masalah Ini Sekarang</span>
                      </button>
                    </div>
                  )}

                  <span className="text-[10px] text-on-surface-variant pl-2">
                    {msg.time} • Terverifikasi Bengkel Resmi
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-end max-w-[85%]">
                <div className="bg-primary text-on-primary p-3.5 rounded-2xl rounded-tr-sm text-xs leading-relaxed shadow-sm">
                  {msg.text}
                </div>
                <span className="text-[10px] text-on-surface-variant pr-2 mt-1">
                  {msg.time} ✓✓
                </span>
              </div>
            )}
          </div>
        ))}

        {thinking && (
          <div className="flex items-center gap-2 text-xs text-on-surface-variant pl-8">
            <div className="w-4 h-4 border-2 border-primary-container border-t-transparent rounded-full animate-spin"></div>
            <span>ServisBot sedang menganalisa telemetri &amp; log sensor...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-1.5 flex gap-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => handleSend("Asap knalpot keluar putih dan oli cepat berkurang")}
          className="px-3 py-1.5 rounded-full bg-surface-container-low text-on-surface font-label-sm text-[11px] flex-shrink-0 hover:bg-surface-container"
        >
          ☁️ Asap knalpot putih
        </button>

        <button
          type="button"
          onClick={() => handleSend("Rem bunyi berdecit saat diinjak di turunan")}
          className="px-3 py-1.5 rounded-full bg-surface-container-low text-on-surface font-label-sm text-[11px] flex-shrink-0 hover:bg-surface-container"
        >
          ⚙️ Rem bunyi berdecit
        </button>

        <button
          type="button"
          onClick={() => handleSend("Mobil tidak mau distarter di pagi hari")}
          className="px-3 py-1.5 rounded-full bg-surface-container-low text-on-surface font-label-sm text-[11px] flex-shrink-0 hover:bg-surface-container"
        >
          ⚡ Aki mogok / starter
        </button>
      </div>

      {/* Input Dock */}
      <div className="p-3 bg-surface-container-lowest border-t border-surface-container-high/60 shadow-lg">
        <div className="flex items-center gap-2 bg-surface-container-low rounded-2xl px-3 py-1.5 border border-surface-container-high/40">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ketik gejala bunyi, getaran, atau kode OBD..."
            className="flex-1 bg-transparent text-on-surface text-xs py-2 focus:outline-none placeholder:text-on-surface-variant/60"
          />

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-md disabled:opacity-50 transition-all hover:brightness-105"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              send
            </span>
          </button>
        </div>

        {/* Input tools row */}
        <div className="flex items-center justify-between pt-2 px-1 text-[11px] text-on-surface-variant">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => alert("Kamera dibuka untuk scan speedometer & lampu indikator.")}
              className="flex items-center gap-1 hover:text-on-surface"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                photo_camera
              </span>
              <span>Foto Spido</span>
            </button>
            <button
              type="button"
              onClick={() => alert("Scanner Bluetooth OBD-II terhubung: 0 Fault Code.")}
              className="flex items-center gap-1 hover:text-on-surface"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                bluetooth
              </span>
              <span>OBD2</span>
            </button>
          </div>

          <span className="flex items-center gap-1 text-tertiary font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
            AI Siap
          </span>
        </div>
      </div>

      <CustomerBottomNav />
    </div>
  );
}

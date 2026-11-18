"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomerBottomNav from "@/components/CustomerBottomNav";
import { AIChatbot, DiagnosticReport } from "@/models/AIChatbot";
import { dbStore } from "@/lib/store";

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  time: string;
  diagnostic?: DiagnosticReport;
}

export default function AiDiagnosticPage() {
  const router = useRouter();
  const [userTier, setUserTier] = useState<"Regular" | "VIP">("Regular");

  useEffect(() => {
    setUserTier(dbStore.getUserTier());
  }, []);

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

  // =========================================================================
  // 1. NON-VIP USER: SHOW VIP PAYWALL / LOCK SCREEN
  // =========================================================================
  if (userTier !== "VIP") {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-surface flex flex-col justify-between p-4 pb-24 selection:bg-primary-fixed selection:text-on-primary-fixed relative">
        {/* Header */}
        <header className="flex items-center justify-between pt-2 pb-3">
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              arrow_back
            </span>
          </Link>
          <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            AI Diagnostic
          </h1>
          <Link
            href="/premium"
            className="px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 font-bold text-[10px] flex items-center gap-1 shadow-sm"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              workspace_premium
            </span>
            <span>UPGRADE</span>
          </Link>
        </header>

        {/* Lock Hero Card */}
        <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-primary-container to-primary flex items-center justify-center text-white shadow-xl">
              <span className="material-symbols-outlined" style={{ fontSize: 44 }}>
                lock
              </span>
            </div>
            <span className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-surface-container-lowest border-2 border-surface flex items-center justify-center text-amber-500 shadow-md">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                psychology
              </span>
            </span>
          </div>

          <div className="mt-5 max-w-xs">
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] uppercase tracking-wider">
              Eksklusif Member VIP
            </span>
            <h2 className="font-headline-md text-xl font-black text-on-surface mt-2.5">
              Fitur AI Diagnostic Terkunci
            </h2>
            <p className="font-body-sm text-xs text-on-surface-variant mt-2 leading-relaxed">
              Konsultasi keluhan mesin, analisa telemetri suara/getaran, dan estimasi biaya komponen dengan <strong>AI ServisIn Neural v4.8</strong> hanya dapat diakses oleh member berstatus <strong>VIP</strong>.
            </p>
          </div>

          {/* Value Preview Cards */}
          <div className="w-full mt-6 bg-surface-container-lowest rounded-2xl p-4 border border-surface-container-high/60 shadow-sm text-left flex flex-col gap-2.5">
            <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
              Keuntungan yang Didapat di VIP:
            </span>
            <div className="flex items-center gap-2.5 text-xs text-on-surface">
              <span className="w-5 h-5 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center text-xs font-bold">
                ✓
              </span>
              <span>Analisis kerusakan mesin akurat hingga 95%</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-on-surface">
              <span className="w-5 h-5 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center text-xs font-bold">
                ✓
              </span>
              <span>Estimasi rentang biaya servis &amp; suku cadang OEM</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-on-surface">
              <span className="w-5 h-5 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center text-xs font-bold">
                ✓
              </span>
              <span>Konsultasi tanya-jawab keluhan mobil/motor tanpa batas</span>
            </div>
          </div>

          {/* Upgrade Action Buttons */}
          <div className="w-full flex flex-col gap-2.5 mt-6">
            <button
              onClick={() => router.push("/premium")}
              className="w-full h-13 rounded-xl bg-gradient-to-r from-primary via-primary-container to-amber-500 text-on-primary font-label-lg font-bold flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                workspace_premium
              </span>
              <span>Buka Kunci dengan VIP • Mulai Rp 39rb/bln</span>
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full h-10 rounded-xl bg-surface-container text-on-surface-variant font-label-md text-xs font-semibold hover:bg-surface-container-high"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>

        <CustomerBottomNav />
      </div>
    );
  }

  // =========================================================================
  // 2. VIP MEMBER: FULL ACCESS TO AI DIAGNOSTIC CHAT
  // =========================================================================
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
          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-bold text-[10px] shadow-sm flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
              verified
            </span>
            <span>VIP UNLOCKED</span>
          </span>
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
                Aktif • Akses Penuh VIP Member
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-bold text-[10px] shadow-sm">
              ★ VIP MEMBER
            </span>
            <span className="text-[10px] text-on-surface-variant block mt-0.5">
              Avanza Veloz 1.5
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
                    <div className="bg-surface-container-lowest rounded-2xl p-4 border border-secondary/30 shadow-md flex flex-col gap-3">
                      <div className="flex items-center justify-between pb-2 border-b border-surface-container-high/60">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>
                            analytics
                          </span>
                          <span className="font-headline-sm text-xs font-bold text-on-surface">
                            {msg.diagnostic.title}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-label-sm text-[10px] font-bold">
                          {msg.diagnostic.accuracy}% Akurasi
                        </span>
                      </div>

                      {/* Breakdown */}
                      <div className="space-y-2">
                        {msg.diagnostic.breakdown.map((item, idx) => (
                          <div key={idx} className="bg-surface-container-low rounded-xl p-2.5">
                            <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                              <span>{item.name}</span>
                              <span className="text-secondary">{item.probability}%</span>
                            </div>
                            <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-1.5 overflow-hidden">
                              <div
                                className="bg-secondary h-full rounded-full"
                                style={{ width: `${item.probability}%` }}
                              ></div>
                            </div>
                            <p className="text-[11px] text-on-surface-variant mt-1.5 leading-snug">
                              {item.explanation}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Pricing and Urgency */}
                      <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-2.5 rounded-xl">
                        <div>
                          <span className="text-[10px] text-on-surface-variant block">
                            Estimasi Biaya:
                          </span>
                          <span className="font-headline-sm text-xs font-bold text-primary">
                            {msg.diagnostic.costEstimate}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-on-surface-variant block">
                            Tingkat Urgensi:
                          </span>
                          <span className="font-headline-sm text-xs font-bold text-tertiary">
                            {msg.diagnostic.urgency}
                          </span>
                        </div>
                      </div>

                      {/* Direct Booking CTA */}
                      <button
                        onClick={() =>
                          router.push(
                            `/booking?service=${encodeURIComponent(
                              msg.diagnostic?.recommendedService || "Tune Up"
                            )}`
                          )
                        }
                        className="w-full h-11 rounded-xl bg-primary text-on-primary font-label-md text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:brightness-105 active:scale-95 transition-all"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                          handyman
                        </span>
                        <span>Pesan Servis Ini Sekarang</span>
                      </button>
                    </div>
                  )}

                  <span className="text-[9px] text-on-surface-variant px-1">{msg.time}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-end gap-1 max-w-[85%]">
                <div className="bg-primary text-on-primary p-3 rounded-2xl rounded-tr-sm text-xs leading-relaxed shadow-sm">
                  {msg.text}
                </div>
                <span className="text-[9px] text-on-surface-variant px-1">{msg.time}</span>
              </div>
            )}
          </div>
        ))}

        {/* AI Typing Indicator */}
        {thinking && (
          <div className="flex items-start gap-2 max-w-[80%]">
            <div className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container flex-shrink-0">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                psychology
              </span>
            </div>
            <div className="bg-surface-container p-3 rounded-2xl flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-secondary animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-secondary animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 rounded-full bg-secondary animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => handleSend("Rem depan bunyi berdecit saat diinjak pelan.")}
          className="px-3 py-1.5 rounded-full bg-surface-container-low border border-surface-container-high/60 text-[11px] font-semibold text-on-surface whitespace-nowrap hover:bg-surface-container transition-colors"
        >
          🔊 Rem bunyi berdecit
        </button>
        <button
          onClick={() => handleSend("Setir mobil bergetar kencang di kecepatan 80 km/jam.")}
          className="px-3 py-1.5 rounded-full bg-surface-container-low border border-surface-container-high/60 text-[11px] font-semibold text-on-surface whitespace-nowrap hover:bg-surface-container transition-colors"
        >
          📳 Setir bergetar di tol
        </button>
        <button
          onClick={() => handleSend("Lampu check engine kuning menyala terus.")}
          className="px-3 py-1.5 rounded-full bg-surface-container-low border border-surface-container-high/60 text-[11px] font-semibold text-on-surface whitespace-nowrap hover:bg-surface-container transition-colors"
        >
          ⚠️ Lampu check engine
        </button>
      </div>

      {/* Input Form Bar */}
      <div className="p-3 bg-surface-container-lowest border-t border-surface-container-high/60">
        <div className="flex items-center gap-2 bg-surface-container-low rounded-2xl px-3 py-1.5 border border-surface-container-high focus-within:ring-2 focus-within:ring-secondary">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ketik keluhan suara, getaran, atau asap..."
            className="flex-1 bg-transparent text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none py-1.5"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="w-8 h-8 rounded-xl bg-secondary text-on-secondary flex items-center justify-center disabled:opacity-40 hover:brightness-105 transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              send
            </span>
          </button>
        </div>
      </div>

      <CustomerBottomNav />
    </div>
  );
}

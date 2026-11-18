"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppNavbar from "@/components/AppNavbar";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        costEstimate: "Rp 120.000 - Rp 180.000",
        urgency: "Sedang (1 - 3 Hari)",
        recommendation:
          "Lakukan penyetelan tegangan tensioner atau ganti 1 set V-Belt 4PK/6PK OEM Toyota. Pengecekan bearing pulley juga dianjurkan.",
        recommendedService: "Tune Up & Ganti Fan Belt",
      },
    },
  ]);

  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, thinking]);

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
  // 1. NON-VIP USER: SHOW VIP PAYWALL / LOCK SCREEN (RESPONSIVE)
  // =========================================================================
  if (userTier !== "VIP") {
    return (
      <div className="min-h-screen bg-surface flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
        <AppNavbar showBack={true} backHref="/dashboard" title="AI Mechanic Diagnostic" />

        <main className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16 flex-1 flex flex-col items-center justify-center text-center pb-24 md:pb-12">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-primary-container to-primary flex items-center justify-center text-white shadow-2xl">
              <span className="material-symbols-outlined" style={{ fontSize: 48 }}>
                lock
              </span>
            </div>
            <span className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-surface-container-lowest border-2 border-surface flex items-center justify-center text-amber-500 shadow-md">
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                psychology
              </span>
            </span>
          </div>

          <div className="mt-6 max-w-xl">
            <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs uppercase tracking-wider">
              Eksklusif Member ServisIn VIP
            </span>
            <h1 className="font-headline-md text-2xl md:text-3xl font-extrabold text-on-surface mt-3">
              Fitur AI Diagnostic Terkunci
            </h1>
            <p className="font-body-sm text-xs md:text-sm text-on-surface-variant mt-2 leading-relaxed">
              Konsultasi keluhan mesin, analisa telemetri suara/getaran, dan estimasi biaya komponen dengan <strong>AI ServisIn Neural v4.8</strong> hanya dapat diakses secara eksklusif oleh member berstatus <strong>VIP</strong>.
            </p>
          </div>

          {/* Value Preview Cards in 3 Columns on Desktop */}
          <div className="w-full max-w-4xl mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-high/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-tertiary-fixed text-tertiary flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                    analytics
                  </span>
                </div>
                <h3 className="font-bold text-sm text-on-surface">Akurasi Diagnosa 95%</h3>
                <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                  Mendeteksi kerusakan v-belt, rem aus, sensor aki, hingga overheat sebelum merembet ke bagian lain.
                </p>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-high/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                    payments
                  </span>
                </div>
                <h3 className="font-bold text-sm text-on-surface">Estimasi Biaya Transparan</h3>
                <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                  Dapatkan proyeksi biaya jasa mekanik dan harga suku cadang OEM orisinil sebelum memutuskan booking.
                </p>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-high/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                    chat
                  </span>
                </div>
                <h3 className="font-bold text-sm text-on-surface">Konsultasi 24 Jam</h3>
                <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                  Tanya jawab keluhan mobil/motor tanpa batasan kuota kapan pun Anda mengalami kendala di jalan.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 w-full max-w-md">
            <button
              onClick={() => router.push("/premium")}
              className="w-full sm:flex-1 h-13 py-3.5 rounded-xl bg-gradient-to-r from-primary via-primary-container to-amber-500 text-on-primary font-bold text-sm flex items-center justify-center gap-2 shadow-xl hover:brightness-105 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                workspace_premium
              </span>
              <span>Buka Kunci VIP • Mulai Rp 39rb/bln</span>
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-auto px-6 h-13 py-3.5 rounded-xl bg-surface-container text-on-surface-variant font-bold text-xs hover:bg-surface-container-high"
            >
              Kembali ke Beranda
            </button>
          </div>
        </main>

        <CustomerBottomNav />
      </div>
    );
  }

  // =========================================================================
  // 2. VIP MEMBER: FULL ACCESS TO AI DIAGNOSTIC CHAT (RESPONSIVE)
  // =========================================================================
  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Universal Responsive Navbar */}
      <AppNavbar showBack={true} backHref="/dashboard" title="AI Mechanic Diagnostic" />

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6 flex-1 pb-24 md:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Telemetry & Vehicle Context (Desktop Sidebar) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Active Vehicle & Telemetry Status */}
            <div className="bg-surface-container-lowest rounded-3xl p-5 border border-surface-container-high/60 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-xs shadow-sm">
                    🚗
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">Toyota Avanza 1.5G</h3>
                    <span className="text-xs text-on-surface-variant">B 1234 SVI • Th 2020</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Connected
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-surface-container-low p-2.5 rounded-xl">
                  <span className="text-[10px] text-on-surface-variant block">Kondisi Mesin:</span>
                  <span className="font-bold text-amber-600">Perlu Pengecekan</span>
                </div>
                <div className="bg-surface-container-low p-2.5 rounded-xl">
                  <span className="text-[10px] text-on-surface-variant block">Odometer:</span>
                  <span className="font-bold text-on-surface">42.850 km</span>
                </div>
              </div>
            </div>

            {/* AI Assistant Spec Card */}
            <div className="bg-surface-container-lowest rounded-3xl p-5 border border-surface-container-high/60 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-secondary text-on-secondary flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                    smart_toy
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-on-surface">ServisBot AI</h4>
                    <span className="px-1.5 py-0.5 rounded bg-secondary-fixed text-secondary font-bold text-[9px]">
                      v4.8 Neural
                    </span>
                  </div>
                  <span className="text-xs text-on-surface-variant">
                    Didukung telemetri sensor OBD-II &amp; katalog servis resmi
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500" style={{ fontSize: 20 }}>
                  workspace_premium
                </span>
                <span>
                  Status: <strong>VIP Unlocked</strong> (Akses Tanpa Batas)
                </span>
              </div>
            </div>

            {/* Quick Consultation Chips (Desktop Sidebar) */}
            <div className="bg-surface-container-lowest rounded-3xl p-5 border border-surface-container-high/60 shadow-sm flex flex-col gap-2.5">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Pertanyaan Populer:
              </span>
              <button
                onClick={() => handleSend("Rem depan bunyi berdecit saat diinjak pelan.")}
                className="p-2.5 rounded-xl bg-surface-container-low text-left text-xs font-semibold text-on-surface hover:bg-surface-container hover:text-primary transition-all flex items-center gap-2"
              >
                <span>🔊</span>
                <span>Rem depan bunyi berdecit pelan</span>
              </button>
              <button
                onClick={() => handleSend("Setir mobil bergetar kencang di kecepatan 80 km/jam.")}
                className="p-2.5 rounded-xl bg-surface-container-low text-left text-xs font-semibold text-on-surface hover:bg-surface-container hover:text-primary transition-all flex items-center gap-2"
              >
                <span>📳</span>
                <span>Setir bergetar kencang di tol</span>
              </button>
              <button
                onClick={() => handleSend("Lampu check engine kuning menyala terus di dashboard.")}
                className="p-2.5 rounded-xl bg-surface-container-low text-left text-xs font-semibold text-on-surface hover:bg-surface-container hover:text-primary transition-all flex items-center gap-2"
              >
                <span>⚠️</span>
                <span>Lampu check engine menyala</span>
              </button>
              <button
                onClick={() => handleSend("Knalpot mengeluarkan asap putih tipis saat mesin dingin.")}
                className="p-2.5 rounded-xl bg-surface-container-low text-left text-xs font-semibold text-on-surface hover:bg-surface-container hover:text-primary transition-all flex items-center gap-2"
              >
                <span>💨</span>
                <span>Asap knalpot putih saat dingin</span>
              </button>
            </div>
          </div>

          {/* Right Column: Chat Interactive Container */}
          <div className="lg:col-span-8 flex flex-col bg-surface-container-lowest rounded-3xl border border-surface-container-high/60 shadow-lg overflow-hidden h-[78vh]">
            {/* Chat Top Banner */}
            <div className="px-5 py-3.5 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-secondary text-on-secondary flex items-center justify-center font-bold text-xs shadow-sm">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    psychology
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-on-surface">Ruang Konsultasi Diagnostik</h3>
                  <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    AI Online &amp; Siap Menganalisis
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-bold text-[10px]">
                  VIP PRIORITY
                </span>
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 px-5 py-4 flex flex-col gap-4 overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  {msg.sender === "ai" ? (
                    <div className="flex items-start gap-3 max-w-[90%] md:max-w-[80%]">
                      <div className="w-8 h-8 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container flex-shrink-0 mt-0.5">
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                          psychology
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="bg-surface-container p-4 rounded-2xl rounded-tl-sm text-on-surface text-xs md:text-sm leading-relaxed shadow-sm">
                          {msg.text}
                        </div>

                        {/* Rich Diagnostic Report Card */}
                        {msg.diagnostic && (
                          <div className="bg-surface-container-lowest rounded-2xl p-4 md:p-5 border border-secondary/30 shadow-md flex flex-col gap-3.5">
                            <div className="flex items-center justify-between pb-2 border-b border-surface-container-high/60">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-secondary" style={{ fontSize: 22 }}>
                                  analytics
                                </span>
                                <span className="font-bold text-sm text-on-surface">
                                  {msg.diagnostic.title}
                                </span>
                              </div>
                              <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-bold text-xs">
                                {msg.diagnostic.accuracy}% Akurasi
                              </span>
                            </div>

                            {/* Breakdown List */}
                            <div className="space-y-2.5">
                              {msg.diagnostic.breakdown.map((item, idx) => (
                                <div key={idx} className="bg-surface-container-low rounded-xl p-3">
                                  <div className="flex items-center justify-between text-xs md:text-sm font-bold text-on-surface">
                                    <span>{item.name}</span>
                                    <span className="text-secondary font-extrabold">{item.probability}%</span>
                                  </div>
                                  <div className="w-full bg-surface-container-highest rounded-full h-2 mt-2 overflow-hidden">
                                    <div
                                      className="bg-secondary h-full rounded-full transition-all duration-500"
                                      style={{ width: `${item.probability}%` }}
                                    ></div>
                                  </div>
                                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                                    {item.explanation}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {/* Pricing and Urgency */}
                            <div className="grid grid-cols-2 gap-3 bg-surface-container-low p-3 rounded-xl">
                              <div>
                                <span className="text-[11px] text-on-surface-variant block">
                                  Estimasi Biaya:
                                </span>
                                <span className="text-xs md:text-sm font-bold text-primary mt-0.5 block">
                                  {msg.diagnostic.costEstimate}
                                </span>
                              </div>
                              <div>
                                <span className="text-[11px] text-on-surface-variant block">
                                  Tingkat Urgensi:
                                </span>
                                <span className="text-xs md:text-sm font-bold text-tertiary mt-0.5 block">
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
                              className="w-full h-12 rounded-xl bg-primary text-on-primary font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-95 transition-all"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                                handyman
                              </span>
                              <span>Pesan Servis Ini Sekarang</span>
                            </button>
                          </div>
                        )}

                        <span className="text-[10px] text-on-surface-variant px-1">{msg.time}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end gap-1 max-w-[85%] md:max-w-[70%]">
                      <div className="bg-primary text-on-primary p-3.5 rounded-2xl rounded-tr-sm text-xs md:text-sm leading-relaxed shadow-sm">
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-on-surface-variant px-1">{msg.time}</span>
                    </div>
                  )}
                </div>
              ))}

              {/* AI Typing Indicator */}
              {thinking && (
                <div className="flex items-start gap-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      psychology
                    </span>
                  </div>
                  <div className="bg-surface-container p-3.5 rounded-2xl flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-secondary animate-bounce"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-secondary animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-secondary animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Mobile Quick Chips (Only visible on small screens) */}
            <div className="lg:hidden px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-surface-container-high/40">
              <button
                onClick={() => handleSend("Rem depan bunyi berdecit saat diinjak pelan.")}
                className="px-3 py-1.5 rounded-full bg-surface-container-low border border-surface-container-high/60 text-xs font-semibold text-on-surface whitespace-nowrap hover:bg-surface-container"
              >
                🔊 Rem berdecit
              </button>
              <button
                onClick={() => handleSend("Setir mobil bergetar kencang di kecepatan 80 km/jam.")}
                className="px-3 py-1.5 rounded-full bg-surface-container-low border border-surface-container-high/60 text-xs font-semibold text-on-surface whitespace-nowrap hover:bg-surface-container"
              >
                📳 Setir bergetar
              </button>
              <button
                onClick={() => handleSend("Lampu check engine kuning menyala.")}
                className="px-3 py-1.5 rounded-full bg-surface-container-low border border-surface-container-high/60 text-xs font-semibold text-on-surface whitespace-nowrap hover:bg-surface-container"
              >
                ⚠️ Check engine
              </button>
            </div>

            {/* Input Form Bar */}
            <div className="p-4 bg-surface-container-lowest border-t border-surface-container-high/60">
              <div className="flex items-center gap-2 bg-surface-container-low rounded-2xl px-4 py-2 border border-surface-container-high focus-within:ring-2 focus-within:ring-secondary">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ketik keluhan bunyi, getaran setir, atau gejala mesin..."
                  className="flex-1 bg-transparent text-xs md:text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none py-1.5"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-xl bg-secondary text-on-secondary flex items-center justify-center disabled:opacity-40 hover:brightness-105 active:scale-95 transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    send
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Customer Bottom Nav (Auto hidden on desktop via md:hidden) */}
      <CustomerBottomNav />
    </div>
  );
}

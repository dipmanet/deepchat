"use client";
import { useEffect, useRef, useState } from "react";

const messages = [
  { id: 1, sender: "Sarah", avatar: "S", bg: "bg-purple-500", text: "Hey team! Project update is live 🚀", time: "10:42 AM", own: false },
  { id: 2, sender: "Alex", avatar: "A", bg: "bg-green-500", text: "Awesome! Just reviewed the designs.", time: "10:43 AM", own: false },
  { id: 3, sender: "You", avatar: "Y", bg: "bg-blue-600", text: "Launching by end of week! 🎉", time: "10:44 AM", own: true },
  { id: 4, sender: "Sarah", avatar: "S", bg: "bg-purple-500", text: "Perfect timing. Let's ship it!", time: "10:45 AM", own: false },
];

function ChatMockup() {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    messages.forEach((msg, i) => {
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setVisibleMessages((prev) => [...prev, msg.id]);
        }, 700);
      }, i * 1400);
    });
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-2xl shadow-blue-200/40 border border-gray-100 overflow-hidden w-full max-w-sm mx-auto">
      {/* Chat Header */}
      <div className="bg-blue-600 px-4 py-3 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400 opacity-80" />
          <div className="w-3 h-3 rounded-full bg-yellow-400 opacity-80" />
          <div className="w-3 h-3 rounded-full bg-green-400 opacity-80" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-white/90 text-xs font-medium tracking-wide"># design-team</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-400 dot-pulse" />
          <span className="text-white/60 text-xs">4 online</span>
        </div>
      </div>

      {/* Sidebar + Chat split */}
      <div className="flex" style={{ height: "320px" }}>
        {/* Mini Sidebar */}
        <div className="w-16 bg-blue-700 flex flex-col items-center py-3 gap-3 flex-shrink-0">
          {["S", "A", "Y", "M"].map((letter, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white cursor-pointer transition-all duration-200 hover:scale-110 ${
                i === 0 ? "bg-white/20 ring-2 ring-white/40" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {letter}
            </div>
          ))}
          <div className="mt-auto w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
            <span className="text-white/60 text-lg leading-none">+</span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Channel list */}
          <div className="px-3 py-2 border-b border-gray-100 flex gap-3 overflow-x-auto">
            {["# general", "# design", "# dev"].map((ch, i) => (
              <span
                key={i}
                className={`text-xs whitespace-nowrap px-2 py-1 rounded-md cursor-pointer transition-colors ${
                  i === 1 ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {ch}
              </span>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2 scrollbar-hide">
            {messages.map((msg) =>
              visibleMessages.includes(msg.id) ? (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 msg-bubble ${msg.own ? "flex-row-reverse" : ""}`}
                  style={{ opacity: 1 }}
                >
                  <div
                    className={`w-6 h-6 rounded-full ${msg.bg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                  >
                    {msg.avatar}
                  </div>
                  <div
                    className={`max-w-[70%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                      msg.own
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ) : null
            )}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-end gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">...</div>
                <div className="bg-gray-100 px-3 py-2.5 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 typing-dot" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 typing-dot" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 typing-dot" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-3 py-2 border-t border-gray-100">
            <div className="bg-gray-50 rounded-xl px-3 py-2 flex items-center gap-2">
              <span className="text-gray-300 text-xs flex-1">Message #design-team...</span>
              <button className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 overflow-hidden flex items-center pt-20"
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/20 blob animate-float-slow" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-300/15 blob animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-orange-400/10 blob animate-float-slow" style={{ animationDelay: "4s" }} />

        {/* Dot grid overlay */}
        <div className="absolute inset-0 dot-grid opacity-20" />

        {/* Decorative circles */}
        <div className="absolute top-20 right-1/4 w-4 h-4 rounded-full bg-orange-400 animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-40 right-16 w-3 h-3 rounded-full bg-white/40 animate-float" style={{ animationDelay: "3s" }} />
        <div className="absolute top-1/3 left-16 w-5 h-5 rounded-full bg-blue-300/60 animate-float-slow" style={{ animationDelay: "0.5s" }} />

        {/* Orange accent shape */}
        <div className="absolute top-16 right-12 w-24 h-3 bg-orange-400 rounded-full opacity-70 animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute bottom-32 left-24 w-16 h-2 bg-white/30 rounded-full animate-float" style={{ animationDelay: "2.5s" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Text Content */}
        <div className="text-white">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8 animate-slide-up">
            <span className="w-2 h-2 rounded-full bg-green-400 dot-pulse" />
            <span className="text-white/80 text-xs font-medium tracking-widest uppercase">New: AI-Powered Channels</span>
          </div>

          {/* Headline */}
          <h1
            className="display-heading text-5xl md:text-6xl xl:text-7xl text-white mb-6 animate-slide-up"
            style={{ animationDelay: "0.15s", opacity: 0 }}
          >
            Have your
            <br />
            <span className="relative inline-block">
              best chat
              <div className="absolute -bottom-1 left-0 right-0 h-1.5 bg-orange-400 rounded-full transform scale-x-0 animate-slide-in-right" style={{ animationDelay: "0.9s" }} />
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-white/70 text-lg md:text-xl leading-relaxed mb-10 max-w-lg animate-slide-up"
            style={{ animationDelay: "0.3s", opacity: 0 }}
          >
            The modern team communication platform that brings your whole company together. Fast, intuitive, and built for real work.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 animate-slide-up"
            style={{ animationDelay: "0.45s", opacity: 0 }}
          >
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-7 py-4 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 group"
            >
              Start for Free
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-7 py-4 rounded-xl font-semibold text-sm hover:bg-white/10 hover:border-white/60 transition-all duration-300 hover:-translate-y-1"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5"/>
                <path d="M10 8l6 4-6 4V8z" fill="white"/>
              </svg>
              Watch Demo
            </a>
          </div>

          {/* Trust badges */}
          <div
            className="flex flex-wrap items-center gap-6 mt-12 animate-fade-in"
            style={{ animationDelay: "0.8s", opacity: 0 }}
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["bg-purple-400", "bg-green-400", "bg-orange-400", "bg-pink-400"].map((c, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-blue-700 flex items-center justify-center text-white text-xs font-bold`}>
                    {["S","A","M","K"][i]}
                  </div>
                ))}
              </div>
              <span className="text-white/70 text-sm">10k+ teams</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[1,2,3,4,5].map(i => (
                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
              <span className="text-white/70 text-sm ml-1">4.9 / 5.0</span>
            </div>
          </div>
        </div>

        {/* Right: Chat Mockup */}
        <div
          className="relative animate-slide-in-right"
          style={{ animationDelay: "0.3s", opacity: 0 }}
        >
          {/* Glow behind chat */}
          <div className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-full scale-90" />

          <div className="relative animate-float">
            <ChatMockup />
          </div>

          {/* Floating notification cards */}
          <div
            className="absolute -left-8 top-16 glass-card p-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in-left hover-lift"
            style={{ animationDelay: "1.2s" }}
          >
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">Task Done!</p>
              <p className="text-xs text-gray-400">Design review complete</p>
            </div>
          </div>

          <div
            className="absolute -right-4 bottom-24 glass-card p-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in-right hover-lift"
            style={{ animationDelay: "1.5s" }}
          >
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">24 members active</p>
              <p className="text-xs text-gray-400">Right now in #general</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}

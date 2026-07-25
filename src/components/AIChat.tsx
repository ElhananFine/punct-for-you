import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { X, Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { GoogleGenAI } from "@google/genai";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

export function AIChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content:
        "היי! אני העוזר החכם של פונקט מדיה. 🤖\nאני יכול לעזור לך למצוא תאריכים פנויים לפרסום, לסווג תוכן לקטגוריות, או סתם לעשות סדר בלוח השידורים.\nאיך אפשר לעזור היום?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const prompt = `
        You are an AI assistant for a WhatsApp advertising agency called "Punkt Media" (פונקט מדיה).
        The user is asking a question about scheduling messages, finding free slots, or categorizing content.
        Respond in Hebrew. Be helpful, concise, and professional but friendly.
        
        User question: ${userMsg.content}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-preview",
        contents: prompt,
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: response.text || "מצטער, לא הצלחתי להבין. אפשר לנסות שוב?",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "אופס! משהו השתבש בתקשורת עם השרת. נסה שוב מאוחר יותר.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ x: "-100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "-100%", opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      // שים לב לעדכון פה: במובייל זה רוחב מלא (w-full) ובדסקטופ 400 פיקסלים (md:w-[400px])
      className="fixed left-0 top-0 bottom-0 w-full md:w-[400px] bg-[var(--color-punkt-surface)] border-r border-[var(--color-punkt-border)] shadow-2xl z-[100] flex flex-col"
    >
      {/* Header */}
      <div className="h-20 border-b border-[var(--color-punkt-border)] flex items-center justify-between px-6 bg-gradient-to-l from-[var(--color-punkt-surface)] to-[var(--color-punkt-bg)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-punkt-green)]/20 border border-[var(--color-punkt-green)] flex items-center justify-center text-[var(--color-punkt-green)] neon-glow">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg leading-none">
              PUNCT AI
            </h3>
            <span className="text-xs text-[var(--color-punkt-muted)]">
              עוזר אישי חכם
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-[var(--color-punkt-muted)] hover:text-white rounded-full hover:bg-white/5 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 md:gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-[var(--color-punkt-surface-hover)] border border-[var(--color-punkt-border)]" : "bg-[var(--color-punkt-green)] text-black neon-glow"}`}
            >
              {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div
              className={`max-w-[85%] md:max-w-[80%] rounded-2xl p-4 ${msg.role === "user" ? "bg-[var(--color-punkt-surface-hover)] border border-[var(--color-punkt-border)] rounded-tr-sm" : "bg-[var(--color-punkt-green)]/10 border border-[var(--color-punkt-green)]/30 text-[var(--color-punkt-green)] rounded-tl-sm"}`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </p>
              <span className="text-[10px] opacity-50 mt-2 block font-mono">
                {msg.timestamp.toLocaleTimeString("he-IL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[var(--color-punkt-green)] text-black flex items-center justify-center neon-glow">
              <Bot size={16} />
            </div>
            <div className="bg-[var(--color-punkt-green)]/10 border border-[var(--color-punkt-green)]/30 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2 text-[var(--color-punkt-green)]">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm font-bold">חושב...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 md:p-6 border-t border-[var(--color-punkt-border)] bg-[var(--color-punkt-bg)] flex-shrink-0 pb-safe">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="שאל אותי על תאריכים פנויים..."
            className="w-full bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] rounded-xl py-4 pr-4 pl-14 text-sm focus:outline-none focus:border-[var(--color-punkt-green)] transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-[var(--color-punkt-green)] text-black rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            <Send size={18} className="rotate-270" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}

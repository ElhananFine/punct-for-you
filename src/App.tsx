import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  MessageSquare,
  Settings,
  LayoutDashboard,
  Bell,
  Search,
  Plus,
  Menu,
  X,
} from "lucide-react";
import { GanttChart } from "./components/GanttChart";
import { AIChat } from "./components/AIChat";
import { motion, AnimatePresence } from "motion/react";
import { isSameWeek, isSameDay, parseISO, isBefore } from "date-fns";

export interface ScheduledMessage {
  id: string;
  wa_message_id: string;
  scheduled_at: string;
  content: string;
  media_type: "text" | "image" | "video";
  media_url?: string;
  status: "scheduled" | "sent" | "canceled";
  category?: string;
}

export default function App() {
  // הגדרה חכמה של מצב התפריט - פתוח בדסקטופ, סגור במובייל
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeView, setActiveView] = useState<
    "dashboard" | "gantt" | "settings"
  >("dashboard");

  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // סגירת התפריט אוטומטית במובייל כשבוחרים משהו, והתאמה לשינוי גודל מסך
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavClick = (view: typeof activeView) => {
    setActiveView(view);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false); // סגירת תפריט במובייל אחרי לחיצה
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          "https://three-of-day-4rqp.onrender.com/api/schedules",
        );
        const data = await response.json();
        setMessages(data || []);
      } catch (error) {
        console.error("Failed to fetch schedules:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    let sentThisWeek = 0;
    let scheduledToday = 0;

    messages.forEach((msg) => {
      if (msg.status === "canceled") return;

      const msgDate = parseISO(msg.scheduled_at);

      if (
        isSameWeek(msgDate, now, { weekStartsOn: 0 }) &&
        (msg.status === "sent" || isBefore(msgDate, now))
      ) {
        sentThisWeek++;
      }

      if (
        isSameDay(msgDate, now) &&
        msg.status === "scheduled" &&
        !isBefore(msgDate, now)
      ) {
        scheduledToday++;
      }
    });

    return { sentThisWeek, scheduledToday };
  }, [messages]);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-punkt-bg)] text-[var(--color-punkt-text)]">
      {/* רקע כהה למובייל כשהתפריט פתוח */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: 280, opacity: 0 }} // שינינו אנימציה שתתאים ל-RTL
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 280, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed lg:relative right-0 top-0 bottom-0 w-[280px] max-w-[80vw] flex-shrink-0 border-l border-[var(--color-punkt-border)] bg-[var(--color-punkt-surface)] z-50 flex flex-col shadow-2xl lg:shadow-none"
          >
            <div className="p-4 lg:p-6 flex items-center justify-between border-b border-[var(--color-punkt-border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-punkt-green)] flex items-center justify-center text-[var(--color-punkt-bg)] font-bold text-xl neon-glow">
                  P
                </div>
                <div>
                  <h1 className="font-display font-bold text-xl tracking-tight leading-none">
                    PUNKT
                  </h1>
                  <span className="text-xs text-[var(--color-punkt-green)] font-bold tracking-widest uppercase">
                    Media
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 text-[var(--color-punkt-muted)] hover:text-white bg-[var(--color-punkt-bg)] rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <div className="text-xs font-bold text-[var(--color-punkt-muted)] mb-4 mt-2 px-4 uppercase tracking-widest">
                ניהול קמפיינים
              </div>
              <NavItem
                icon={<LayoutDashboard size={20} />}
                label="דשבורד ראשי"
                active={activeView === "dashboard"}
                onClick={() => handleNavClick("dashboard")}
              />
              <NavItem
                icon={<Calendar size={20} />}
                label="לוח שידורים (Gantt)"
                active={activeView === "gantt"}
                onClick={() => handleNavClick("gantt")}
              />

              <div className="text-xs font-bold text-[var(--color-punkt-muted)] mb-4 mt-8 px-4 uppercase tracking-widest">
                מערכת
              </div>
              <NavItem
                icon={<Settings size={20} />}
                label="הגדרות"
                active={activeView === "settings"}
                onClick={() => handleNavClick("settings")}
              />
            </nav>

            <div className="p-4 lg:p-6 border-t border-[var(--color-punkt-border)] pb-8 lg:pb-6">
              <button
                onClick={() => {
                  setIsChatOpen(true);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-[var(--color-punkt-green)] to-emerald-400 text-[var(--color-punkt-bg)] rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity neon-glow"
              >
                <MessageSquare size={18} />
                <span>PUNKT AI</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative w-full">
        {/* Header */}
        <header className="h-16 lg:h-20 border-b border-[var(--color-punkt-border)] glass-panel flex items-center justify-between px-4 lg:px-6 z-10 sticky top-0">
          <div className="flex items-center gap-3 lg:gap-4">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -mr-2 lg:mr-0 text-[var(--color-punkt-muted)] hover:text-white rounded-lg hover:bg-[var(--color-punkt-surface)] transition-colors"
              >
                <Menu size={24} />
              </button>
            )}
            <h2 className="text-xl lg:text-2xl font-display font-bold truncate">
              {activeView === "dashboard"
                ? "דשבורד ראשי"
                : activeView === "gantt"
                  ? "לוח שידורים"
                  : "הגדרות"}
            </h2>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <div className="relative hidden md:block">
              <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-punkt-muted)]"
                size={18}
              />
              <input
                type="text"
                placeholder="חיפוש קמפיין..."
                className="bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] rounded-full py-2 pr-10 pl-4 text-sm focus:outline-none focus:border-[var(--color-punkt-green)] transition-colors w-64"
              />
            </div>
            {/* כפתור פלוס מצומצם במובייל */}
            <button
              disabled
              className="flex items-center justify-center gap-2 bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] w-10 h-10 lg:w-auto lg:px-4 lg:py-2 rounded-full transition-colors opacity-50 cursor-not-allowed"
            >
              <Plus size={18} className="text-[var(--color-punkt-green)]" />
              <span className="hidden lg:block text-sm font-bold">
                תזמון חדש
              </span>
            </button>
          </div>
        </header>

        {/* Dynamic Content Area */}
        {activeView === "dashboard" && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-4 lg:p-6 grid grid-cols-2 gap-3 lg:gap-6 border-b border-[var(--color-punkt-border)] bg-[var(--color-punkt-surface)]/30 flex-shrink-0">
              <StatCard
                title="נשלח השבוע"
                value={isLoading ? "..." : stats.sentThisWeek.toString()}
                trend="פעיל"
              />
              <StatCard
                title="מתוזמן להיום"
                value={isLoading ? "..." : stats.scheduledToday.toString()}
                trend="ממתין"
              />
            </div>
            <main className="flex-1 overflow-hidden relative bg-[var(--color-punkt-bg)] gantt-grid">
              <GanttChart messages={messages} isLoading={isLoading} />
            </main>
          </div>
        )}

        {activeView === "gantt" && (
          <main className="flex-1 overflow-hidden relative bg-[var(--color-punkt-bg)] gantt-grid">
            <GanttChart messages={messages} isLoading={isLoading} />
          </main>
        )}

        {activeView === "settings" && (
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[var(--color-punkt-bg)]">
            <div className="max-w-2xl mx-auto bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] rounded-2xl p-6 lg:p-8 mt-4 lg:mt-8">
              <h3 className="text-xl font-display font-bold mb-6">
                הגדרות מערכת
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-punkt-muted)] mb-2">
                    שם העסק
                  </label>
                  <input
                    type="text"
                    defaultValue="פונקט מדיה"
                    className="w-full bg-[var(--color-punkt-bg)] border border-[var(--color-punkt-border)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-punkt-green)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-punkt-muted)] mb-2">
                    מספר טלפון לבוט
                  </label>
                  <input
                    type="text"
                    defaultValue="+41782669371"
                    className="w-full bg-[var(--color-punkt-bg)] border border-[var(--color-punkt-border)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-punkt-green)] transition-colors text-left"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-punkt-muted)] mb-2">
                    שם קבוצת היעד
                  </label>
                  <input
                    type="text"
                    defaultValue="פונקט בשבילך"
                    className="w-full bg-[var(--color-punkt-bg)] border border-[var(--color-punkt-border)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-punkt-green)] transition-colors"
                  />
                </div>
                <div className="pt-4 border-t border-[var(--color-punkt-border)]">
                  <button className="w-full lg:w-auto bg-[var(--color-punkt-green)] text-black font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity">
                    שמירת הגדרות
                  </button>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* AI Chat Sidebar/Overlay */}
      <AnimatePresence>
        {isChatOpen && <AIChat onClose={() => setIsChatOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

function StatCard({
  title,
  value,
  trend,
}: {
  title: string;
  value: string;
  trend: string;
}) {
  const isPositive = trend.startsWith("+") || trend === "פעיל";
  return (
    <div className="bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] p-4 lg:p-5 rounded-2xl relative overflow-hidden group hover:border-[var(--color-punkt-green)] transition-colors">
      <div className="absolute top-0 left-0 w-24 h-24 bg-[var(--color-punkt-green)]/5 rounded-full -translate-y-1/2 -translate-x-1/2 blur-xl group-hover:bg-[var(--color-punkt-green)]/10 transition-colors"></div>
      <h4 className="text-xs lg:text-sm text-[var(--color-punkt-muted)] mb-2 font-bold truncate">
        {title}
      </h4>
      <div className="flex items-end justify-between">
        <span className="text-2xl lg:text-3xl font-display font-bold">
          {value}
        </span>
        <span
          className={`text-[10px] lg:text-xs font-bold px-2 py-1 rounded-lg ${isPositive ? "bg-[var(--color-punkt-green)]/10 text-[var(--color-punkt-green)]" : "bg-[var(--color-punkt-surface-hover)] text-[var(--color-punkt-muted)]"}`}
        >
          {trend}
        </span>
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? "bg-[var(--color-punkt-surface-hover)] text-[var(--color-punkt-green)] border border-[var(--color-punkt-border)] shadow-sm" : "text-[var(--color-punkt-muted)] hover:text-white hover:bg-[var(--color-punkt-surface)]"}`}
    >
      {icon}
      <span className="font-bold text-sm">{label}</span>
    </button>
  );
}

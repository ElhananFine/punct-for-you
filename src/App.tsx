import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Calendar,
  MessageSquare,
  Settings,
  LayoutDashboard,
  Search,
  Plus,
  Menu,
  X,
  Send,
  Loader2,
  Paperclip,
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
  group_id?: string;
}

// 1. הגדרת מערך הקבוצות (חייב לתאום ל-Backend)
export const GROUPS = [
  { id: "punkt_foryou", name: "פונקט בשבילך", color: "#56c08e" },
  { id: "salon_nashi", name: "סלון נשי", color: "#ec4899" },
  { id: "mitbach_nashi", name: "מטבח נשי", color: "#f59e0b" },
];

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeView, setActiveView] = useState<
    "dashboard" | "gantt" | "settings"
  >("dashboard");
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  const [isNewScheduleOpen, setIsNewScheduleOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavClick = (view: typeof activeView) => {
    setActiveView(view);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

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

  useEffect(() => {
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

  const filteredMessages = useMemo(() => {
    if (selectedGroup === "all") return messages;
    return messages.filter(
      (msg) => (msg.group_id || "punkt_foryou") === selectedGroup,
    );
  }, [messages, selectedGroup]);

  const handleCreateSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);

      // החלף ב-URL המדויק של ה-Edge function שלך!
      const SUPABASE_FUNCTION_URL =
        "https://edqhvnrdygdqvetcrebv.supabase.co/functions/v1/send-wa-schedule";

      const response = await fetch(SUPABASE_FUNCTION_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          "שגיאה בשליחת התזמון. ודא שהפונקציה בסופאבייס עובדת תקין.",
        );
      }

      setIsNewScheduleOpen(false);
      setTimeout(() => fetchMessages(), 2000);
    } catch (error: any) {
      alert("קרתה תקלה בשליחה: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-punkt-bg)] text-[var(--color-punkt-text)]">
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

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: 280, opacity: 0 }}
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
                    PUNCT
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
                <span>PUNCT AI</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 relative w-full">
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

            <button
              onClick={() => setIsNewScheduleOpen(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--color-punkt-green)] to-emerald-500 text-black w-10 h-10 lg:w-auto lg:px-4 lg:py-2 rounded-full transition-all hover:scale-105"
            >
              <Plus size={18} />
              <span className="hidden lg:block text-sm font-bold">
                תזמון חדש
              </span>
            </button>
          </div>
        </header>

        {(activeView === "dashboard" || activeView === "gantt") && (
          <div className="flex flex-col h-full overflow-hidden">
            {activeView === "dashboard" && (
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
            )}

            {/* פילטר קבוצות */}
            <div className="px-4 py-3 flex gap-2 overflow-x-auto border-b border-[var(--color-punkt-border)] bg-[var(--color-punkt-bg)] hide-scrollbar flex-shrink-0">
              <button
                onClick={() => setSelectedGroup("all")}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${selectedGroup === "all" ? "bg-white text-black" : "bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] text-[var(--color-punkt-muted)] hover:text-white"}`}
              >
                הכל
              </button>
              {GROUPS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGroup(g.id)}
                  style={{
                    backgroundColor:
                      selectedGroup === g.id
                        ? g.color
                        : "var(--color-punkt-surface)",
                    color:
                      selectedGroup === g.id
                        ? "#000"
                        : "var(--color-punkt-muted)",
                    borderColor:
                      selectedGroup === g.id
                        ? g.color
                        : "var(--color-punkt-border)",
                  }}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all border hover:text-white`}
                >
                  {g.name}
                </button>
              ))}
            </div>

            <main className="flex-1 overflow-hidden relative bg-[var(--color-punkt-bg)] gantt-grid">
              <GanttChart messages={filteredMessages} isLoading={isLoading} />
            </main>
          </div>
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
                    className="w-full bg-[var(--color-punkt-bg)] border border-[var(--color-punkt-border)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-punkt-green)]"
                  />
                </div>
              </div>
            </div>
          </main>
        )}
      </div>

      <AnimatePresence>
        {isChatOpen && <AIChat onClose={() => setIsChatOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {isNewScheduleOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-[var(--color-punkt-border)] flex justify-between items-center bg-gradient-to-r from-[var(--color-punkt-surface)] to-[var(--color-punkt-bg)] flex-shrink-0">
                <h3 className="font-display font-bold text-xl text-white">
                  תזמון הודעה חדשה
                </h3>
                <button
                  onClick={() => setIsNewScheduleOpen(false)}
                  className="text-[var(--color-punkt-muted)] hover:text-white transition"
                >
                  <X size={24} />
                </button>
              </div>

              <form
                ref={formRef}
                onSubmit={handleCreateSchedule}
                className="flex-1 overflow-y-auto p-6 space-y-5"
              >
                <div>
                  <label className="block text-sm font-bold text-[var(--color-punkt-muted)] mb-2">
                    לאיזו קבוצה?
                  </label>
                  <select
                    name="groupId"
                    required
                    className="w-full bg-[var(--color-punkt-bg)] border border-[var(--color-punkt-border)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-punkt-green)] appearance-none"
                  >
                    <option value="all">כל הקבוצות (ישלח לכולן במקביל)</option>
                    {GROUPS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[var(--color-punkt-muted)] mb-2">
                      תאריך
                    </label>
                    <input
                      name="date"
                      type="text"
                      placeholder="DD/MM"
                      required
                      pattern="\d{1,2}[\/\.]\d{1,2}"
                      className="w-full bg-[var(--color-punkt-bg)] border border-[var(--color-punkt-border)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-punkt-green)] text-center"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[var(--color-punkt-muted)] mb-2">
                      שעה
                    </label>
                    <input
                      name="time"
                      type="text"
                      placeholder="HH:MM"
                      required
                      pattern="\d{1,2}:\d{2}"
                      className="w-full bg-[var(--color-punkt-bg)] border border-[var(--color-punkt-border)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-punkt-green)] text-center"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--color-punkt-muted)] mb-2">
                    טקסט ההודעה (לא חובה)
                  </label>
                  <textarea
                    name="content"
                    rows={5}
                    placeholder="הקלד את תוכן ההודעה כאן..."
                    className="w-full bg-[var(--color-punkt-bg)] border border-[var(--color-punkt-border)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-punkt-green)] resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--color-punkt-muted)] mb-2">
                    קובץ מצורף (תמונה/וידאו - לא חובה)
                  </label>
                  <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-[var(--color-punkt-border)] rounded-xl py-6 hover:border-[var(--color-punkt-green)] transition-colors cursor-pointer bg-[var(--color-punkt-bg)]">
                    <Paperclip
                      size={20}
                      className="text-[var(--color-punkt-muted)]"
                    />
                    <span className="text-[var(--color-punkt-muted)] text-sm font-bold">
                      לחץ להעלאת קובץ
                    </span>
                    <input
                      type="file"
                      name="file"
                      className="hidden"
                      accept="image/*,video/*"
                      onChange={(e) => {
                        const fileName = e.target.files?.[0]?.name;
                        if (fileName)
                          e.target.parentElement!.querySelector(
                            "span",
                          )!.innerText = fileName;
                      }}
                    />
                  </label>
                </div>

                <div className="pt-4 pb-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[var(--color-punkt-green)] to-emerald-500 text-black font-bold py-3.5 px-6 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} /> מעבד
                        ושולח...
                      </>
                    ) : (
                      <>
                        <Send size={20} /> שלח לתזמון
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
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

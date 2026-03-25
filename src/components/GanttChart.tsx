import React, { useState, useMemo, useEffect } from "react";
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  getHours,
  getMinutes,
  addWeeks,
  subWeeks,
  startOfDay,
  startOfMonth,
  getDaysInMonth,
  addMonths,
  subMonths,
  isBefore,
  parseISO,
} from "date-fns";
import {
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon,
  Video,
  AlignLeft,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { motion } from "motion/react";
import { he } from "date-fns/locale";

interface ScheduledMessage {
  id: string;
  wa_message_id: string;
  scheduled_at: string;
  content: string;
  media_type: "text" | "image" | "video";
  media_url?: string;
  status: "scheduled" | "sent" | "canceled";
  category?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function GanttChart() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("week");
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // שאיבת נתונים מהשרת
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // יש לשנות את ה-URL לכתובת השרת האמיתית שלך אם זה מורץ על דומיינים שונים
        const response = await fetch("/api/schedules");
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

  const startDate = useMemo(() => {
    if (viewMode === "month") return startOfMonth(currentDate);
    if (viewMode === "week")
      return startOfWeek(currentDate, { weekStartsOn: 0 });
    return startOfDay(currentDate);
  }, [currentDate, viewMode]);

  const days = useMemo(() => {
    if (viewMode === "month")
      return Array.from({ length: getDaysInMonth(startDate) }, (_, i) =>
        addDays(startDate, i),
      );
    if (viewMode === "week")
      return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
    return [startDate];
  }, [startDate, viewMode]);

  const handlePrev = () => {
    setCurrentDate((prev) => {
      if (viewMode === "month") return subMonths(prev, 1);
      if (viewMode === "week") return subWeeks(prev, 1);
      return addDays(prev, -1);
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      if (viewMode === "month") return addMonths(prev, 1);
      if (viewMode === "week") return addWeeks(prev, 1);
      return addDays(prev, 1);
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="p-4 flex items-center justify-between border-b border-[var(--color-punkt-border)] bg-[var(--color-punkt-surface)]/50 backdrop-blur-md z-10 relative">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[var(--color-punkt-bg)] rounded-xl border border-[var(--color-punkt-border)] p-1 shadow-inner">
            <button
              onClick={() => setViewMode("month")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === "month" ? "bg-[var(--color-punkt-surface-hover)] text-[var(--color-punkt-green)] shadow-md" : "text-[var(--color-punkt-muted)] hover:text-white"}`}
            >
              חודש
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === "week" ? "bg-[var(--color-punkt-surface-hover)] text-[var(--color-punkt-green)] shadow-md" : "text-[var(--color-punkt-muted)] hover:text-white"}`}
            >
              שבוע
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === "day" ? "bg-[var(--color-punkt-surface-hover)] text-[var(--color-punkt-green)] shadow-md" : "text-[var(--color-punkt-muted)] hover:text-white"}`}
            >
              יום
            </button>
          </div>

          <div className="flex items-center gap-3 bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] rounded-xl p-1">
            <button
              onClick={handleNext}
              className="p-2 rounded-lg hover:bg-[var(--color-punkt-surface-hover)] transition-colors hover:text-[var(--color-punkt-green)]"
            >
              <ChevronRight size={20} />
            </button>
            <h3 className="text-lg font-display font-bold min-w-[180px] text-center tracking-wide">
              {viewMode === "month"
                ? format(startDate, "MMMM yyyy", { locale: he })
                : viewMode === "week"
                  ? `${format(startDate, "d MMM", { locale: he })} - ${format(addDays(startDate, 6), "d MMM, yyyy", { locale: he })}`
                  : format(startDate, "EEEE, d בMMMM yyyy", { locale: he })}
            </h3>
            <button
              onClick={handlePrev}
              className="p-2 rounded-lg hover:bg-[var(--color-punkt-surface-hover)] transition-colors hover:text-[var(--color-punkt-green)]"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm font-bold bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] px-6 py-2.5 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--color-punkt-green)] neon-glow"></div>
            <span className="tracking-wide">נשלח</span>
          </div>
          <div className="w-px h-4 bg-[var(--color-punkt-border)]"></div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--color-punkt-gold)] shadow-[0_0_10px_rgba(253,185,19,0.5)]"></div>
            <span className="tracking-wide">מתוזמן</span>
          </div>
        </div>
      </div>

      {/* Gantt Grid */}
      <div className="flex-1 overflow-auto relative">
        <div className="min-w-[1200px] h-full flex flex-col">
          {/* Header Row (Hours) */}
          <div className="flex border-b border-[var(--color-punkt-border)] sticky top-0 z-20 bg-[var(--color-punkt-bg)]/90 backdrop-blur-md shadow-sm">
            <div className="w-32 flex-shrink-0 border-l border-[var(--color-punkt-border)] p-4 flex items-center justify-center font-display font-bold text-[var(--color-punkt-muted)] tracking-widest uppercase">
              {viewMode === "day" ? "שעה" : "יום"}
            </div>
            <div className="flex-1 flex relative">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="flex-1 border-l border-[var(--color-punkt-border)]/30 p-3 text-center text-xs text-[var(--color-punkt-muted)] font-mono font-bold"
                >
                  {hour.toString().padStart(2, "0")}:00
                </div>
              ))}
            </div>
          </div>

          {/* Days Rows */}
          <div className="flex-1 overflow-y-auto relative">
            {days.map((day, dayIndex) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dayIndex * 0.05 }}
                key={day.toISOString()}
                className="flex border-b border-[var(--color-punkt-border)] min-h-[120px] group hover:bg-[var(--color-punkt-surface)]/40 transition-colors relative"
              >
                <div className="w-32 flex-shrink-0 border-l border-[var(--color-punkt-border)] p-4 flex flex-col items-center justify-center bg-[var(--color-punkt-surface)]/80 relative z-10">
                  <span className="text-lg font-display font-bold tracking-wide">
                    {format(day, "EEEE", { locale: he })}
                  </span>
                  <span className="text-sm text-[var(--color-punkt-green)] font-mono mt-1">
                    {format(day, "dd/MM")}
                  </span>
                  {isSameDay(day, new Date()) && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--color-punkt-green)] animate-ping"></div>
                  )}
                </div>

                <div className="flex-1 relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {HOURS.map((hour) => (
                      <div
                        key={hour}
                        className="flex-1 border-l border-[var(--color-punkt-border)]/20 border-dashed"
                      ></div>
                    ))}
                  </div>

                  {/* Current Time Indicator (if today) */}
                  {isSameDay(day, new Date()) && (
                    <div
                      className="absolute top-0 bottom-0 w-px bg-[var(--color-punkt-green)] z-0 shadow-[0_0_10px_rgba(86,192,142,0.8)]"
                      style={{
                        right: `${((getHours(new Date()) + getMinutes(new Date()) / 60) / 24) * 100}%`,
                      }}
                    >
                      <div className="absolute -top-1 -translate-x-1/2 w-3 h-3 rounded-full bg-[var(--color-punkt-green)]"></div>
                    </div>
                  )}

                  {/* Messages */}
                  <Tooltip.Provider delayDuration={100}>
                    {messages
                      .filter(
                        (m) =>
                          isSameDay(parseISO(m.scheduled_at), day) &&
                          m.status !== "canceled",
                      )
                      .map((msg, idx) => {
                        const scheduledAtDate = parseISO(m.scheduled_at);
                        const hour = getHours(scheduledAtDate);
                        const minute = getMinutes(scheduledAtDate);
                        const leftPercent = ((hour + minute / 60) / 24) * 100;

                        const isSent =
                          msg.status === "sent" ||
                          isBefore(scheduledAtDate, new Date());
                        const colorClass = isSent
                          ? "bg-gradient-to-br from-[var(--color-punkt-green)] to-emerald-600 text-black"
                          : "bg-gradient-to-br from-[var(--color-punkt-gold)] to-amber-500 text-black";
                        const glowClass = isSent
                          ? "shadow-[0_0_20px_rgba(86,192,142,0.5)]"
                          : "shadow-[0_0_20px_rgba(253,185,19,0.5)]";

                        return (
                          <Tooltip.Root key={msg.id}>
                            {/* ה-Trigger נשאר זהה */}
                            <Tooltip.Trigger asChild>
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  type: "spring",
                                  delay: dayIndex * 0.1 + idx * 0.05,
                                }}
                                className={`absolute top-1/2 -translate-y-1/2 h-14 rounded-xl flex items-center justify-center cursor-default hover:z-30 ${colorClass} ${glowClass} border-2 border-white/20`}
                                style={{
                                  right: `${leftPercent}%`,
                                  width: "48px",
                                  transform: "translate(50%, -50%)",
                                }}
                              >
                                {msg.media_type === "image" && (
                                  <ImageIcon size={20} />
                                )}
                                {msg.media_type === "video" && (
                                  <Video size={20} />
                                )}
                                {msg.media_type === "text" && (
                                  <AlignLeft size={20} />
                                )}
                              </motion.div>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                              <Tooltip.Content
                                className="z-50 bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] p-5 rounded-2xl shadow-2xl max-w-sm text-right glass-panel"
                                sideOffset={10}
                              >
                                <div className="flex items-center justify-between mb-4 border-b border-[var(--color-punkt-border)] pb-3">
                                  <div className="flex items-center gap-2 text-sm text-[var(--color-punkt-green)] font-mono font-bold bg-[var(--color-punkt-green)]/10 px-3 py-1 rounded-lg">
                                    <Clock size={14} />
                                    {format(scheduledAtDate, "HH:mm")}
                                  </div>
                                </div>
                                <div className="text-sm whitespace-pre-wrap leading-relaxed font-medium text-gray-200">
                                  {msg.content}
                                </div>

                                {/* טיפול במדיה - וידאו או תמונה */}
                                {msg.media_url && (
                                  <div className="mt-4 rounded-xl overflow-hidden border border-[var(--color-punkt-border)] relative">
                                    {msg.media_type === "video" ? (
                                      <video
                                        src={msg.media_url}
                                        controls
                                        className="w-full h-48 object-cover bg-black"
                                      />
                                    ) : (
                                      <img
                                        src={msg.media_url}
                                        alt="Media preview"
                                        className="w-full h-40 object-cover"
                                      />
                                    )}
                                  </div>
                                )}
                                <Tooltip.Arrow className="fill-[var(--color-punkt-surface)]" />
                              </Tooltip.Content>
                            </Tooltip.Portal>
                          </Tooltip.Root>
                        );
                      })}
                  </Tooltip.Provider>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

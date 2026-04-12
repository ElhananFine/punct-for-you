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
import { he } from "date-fns/locale";
import {
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon,
  Video,
  AlignLeft,
  Clock,
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { motion } from "motion/react";
import { ScheduledMessage } from "../App";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface GanttChartProps {
  messages: ScheduledMessage[];
  isLoading: boolean;
}

export function GanttChart({ messages, isLoading }: GanttChartProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("week");

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-[var(--color-punkt-green)] font-bold text-xl animate-pulse">
          טוען נתונים...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-3 border-b border-[var(--color-punkt-border)] bg-[var(--color-punkt-surface)]/50 backdrop-blur-md z-10 relative flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-[var(--color-punkt-bg)] rounded-xl border border-[var(--color-punkt-border)] p-1 shadow-inner w-full sm:w-auto">
            <button
              onClick={() => setViewMode("month")}
              className={`flex-1 sm:flex-none px-2 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${viewMode === "month" ? "bg-[var(--color-punkt-surface-hover)] text-[var(--color-punkt-green)] shadow-md" : "text-[var(--color-punkt-muted)] hover:text-white"}`}
            >
              חודש
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`flex-1 sm:flex-none px-2 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${viewMode === "week" ? "bg-[var(--color-punkt-surface-hover)] text-[var(--color-punkt-green)] shadow-md" : "text-[var(--color-punkt-muted)] hover:text-white"}`}
            >
              שבוע
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`flex-1 sm:flex-none px-2 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${viewMode === "day" ? "bg-[var(--color-punkt-surface-hover)] text-[var(--color-punkt-green)] shadow-md" : "text-[var(--color-punkt-muted)] hover:text-white"}`}
            >
              יום
            </button>
          </div>

          <div className="flex items-center justify-between bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] rounded-xl p-1 w-full sm:w-auto">
            <button
              onClick={handleNext}
              className="p-1.5 md:p-2 rounded-lg hover:bg-[var(--color-punkt-surface-hover)] transition-colors hover:text-[var(--color-punkt-green)]"
            >
              <ChevronRight size={18} />
            </button>
            <h3 className="text-sm md:text-lg font-display font-bold min-w-[140px] md:min-w-[180px] text-center tracking-wide truncate px-2">
              {viewMode === "month"
                ? format(startDate, "MMMM yyyy", { locale: he })
                : viewMode === "week"
                  ? `${format(startDate, "d MMM", { locale: he })} - ${format(addDays(startDate, 6), "d MMM yyyy", { locale: he })}`
                  : format(startDate, "EEEE, d בMMMM yyyy", { locale: he })}
            </h3>
            <button
              onClick={handlePrev}
              className="p-1.5 md:p-2 rounded-lg hover:bg-[var(--color-punkt-surface-hover)] transition-colors hover:text-[var(--color-punkt-green)]"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>

        <div className="flex justify-center items-center gap-4 text-xs md:text-sm font-bold bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] px-4 py-2 rounded-xl w-full md:w-auto">
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[var(--color-punkt-green)] neon-glow"></div>
            <span className="tracking-wide">נשלח</span>
          </div>
          <div className="w-px h-3 md:h-4 bg-[var(--color-punkt-border)]"></div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[var(--color-punkt-gold)] shadow-[0_0_10px_rgba(253,185,19,0.5)]"></div>
            <span className="tracking-wide">מתוזמן</span>
          </div>
        </div>
      </div>

      {viewMode === "day" && isMobile ? (
        <MobileVerticalDayView messages={messages} date={startDate} />
      ) : (
        /* Container that stretches properly on desktop but enforces min-width */
        <div className="flex-1 overflow-x-auto overflow-y-auto bg-[var(--color-punkt-bg)]">
          <div className="min-w-[800px] lg:min-w-[1200px] flex flex-col h-full w-full">
            {/* Header Row (Hours) */}
            <div className="flex sticky top-0 z-30 bg-[var(--color-punkt-bg)]/95 backdrop-blur-md shadow-sm border-b border-[var(--color-punkt-border)]">
              <div className="w-20 md:w-32 flex-shrink-0 sticky right-0 z-40 bg-[var(--color-punkt-bg)] border-l border-[var(--color-punkt-border)] p-2 md:p-4 flex items-center justify-center font-display font-bold text-xs md:text-sm text-[var(--color-punkt-muted)] tracking-widest uppercase shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.5)]">
                {viewMode === "day" ? "שעה" : "יום"}
              </div>

              {/* ממוקם בדיוק מתמטי (אחוזים) כדי שלא יזוז פיקסל */}
              {/* ממוקם בדיוק מתמטי (אחוזים) כדי שלא יזוז פיקסל */}
              <div className="flex-1 relative min-h-[40px] md:min-h-[50px] overflow-hidden">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="absolute top-0 bottom-0 border-r border-[var(--color-punkt-border)]/30"
                    style={{ right: `${(hour / 24) * 100}%` }}
                  >
                    {/* במובייל מסתירים שעות אי-זוגיות ומסתירים את ה-:00 */}
                    <span
                      className={`absolute top-1/2 -translate-y-1/2 right-1 md:right-2 text-[10px] md:text-xs text-[var(--color-punkt-muted)] font-mono font-bold ${hour % 2 !== 0 ? "hidden md:block" : ""}`}
                    >
                      {hour.toString().padStart(2, "0")}
                      <span className="hidden md:inline">:00</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Days Rows */}
            <div className="flex-1 flex flex-col relative pb-10">
              {days.map((day, dayIndex) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: dayIndex * 0.05 }}
                  key={day.toISOString()}
                  className="flex border-b border-[var(--color-punkt-border)] min-h-[90px] md:min-h-[120px] group hover:bg-[var(--color-punkt-surface)]/40 transition-colors"
                >
                  <div className="w-20 md:w-32 flex-shrink-0 sticky right-0 z-20 bg-[var(--color-punkt-surface)]/95 backdrop-blur-md border-l border-[var(--color-punkt-border)] p-2 md:p-4 flex flex-col items-center justify-center shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.3)]">
                    <span className="text-sm md:text-lg font-display font-bold tracking-wide text-center">
                      {format(day, "EEEE", { locale: he })}
                    </span>
                    <span className="text-[10px] md:text-sm text-[var(--color-punkt-green)] font-mono mt-1">
                      {format(day, "dd/MM")}
                    </span>
                    {isSameDay(day, new Date()) && (
                      <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[var(--color-punkt-green)] animate-ping"></div>
                    )}
                  </div>

                  <div className="flex-1 relative">
                    <div className="absolute inset-0 pointer-events-none">
                      {HOURS.map((hour) => (
                        <div
                          key={hour}
                          className="absolute top-0 bottom-0 border-r border-[var(--color-punkt-border)]/15 border-dashed"
                          style={{ right: `${(hour / 24) * 100}%` }}
                        />
                      ))}
                    </div>

                    {isSameDay(day, new Date()) && (
                      <div
                        className="absolute top-0 bottom-0 w-[2px] bg-[var(--color-punkt-green)] z-10 shadow-[0_0_10px_rgba(86,192,142,0.8)]"
                        style={{
                          right: `${((getHours(new Date()) + getMinutes(new Date()) / 60) / 24) * 100}%`,
                        }}
                      >
                        <div className="absolute -top-1 right-1/2 translate-x-1/2 w-2 h-2 md:w-3 md:h-3 rounded-full bg-[var(--color-punkt-green)]"></div>
                      </div>
                    )}

                    <Tooltip.Provider delayDuration={0}>
                      {messages
                        .filter(
                          (m) =>
                            isSameDay(parseISO(m.scheduled_at), day) &&
                            m.status !== "canceled",
                        )
                        .map((msg, idx) => {
                          const scheduledAtDate = parseISO(msg.scheduled_at);
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
                            ? "shadow-[0_0_15px_rgba(86,192,142,0.4)] md:shadow-[0_0_20px_rgba(86,192,142,0.5)]"
                            : "shadow-[0_0_15px_rgba(253,185,19,0.4)] md:shadow-[0_0_20px_rgba(253,185,19,0.5)]";

                          return (
                            <Tooltip.Root key={msg.id}>
                              <Tooltip.Trigger asChild>
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{
                                    type: "spring",
                                    delay: dayIndex * 0.1 + idx * 0.05,
                                  }}
                                  className={`absolute top-1/2 -translate-y-1/2 h-10 md:h-14 rounded-[10px] md:rounded-xl flex items-center justify-center cursor-default hover:z-30 ${colorClass} ${glowClass} border-2 border-white/20`}
                                  style={{
                                    right: `${leftPercent}%`,
                                    width: "40px",
                                    transform: "translate(50%, -50%)",
                                  }}
                                >
                                  {msg.media_type === "image" && (
                                    <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
                                  )}
                                  {msg.media_type === "video" && (
                                    <Video className="w-4 h-4 md:w-5 md:h-5" />
                                  )}
                                  {msg.media_type === "text" && (
                                    <AlignLeft className="w-4 h-4 md:w-5 md:h-5" />
                                  )}
                                </motion.div>
                              </Tooltip.Trigger>
                              <Tooltip.Portal>
                                <Tooltip.Content
                                  className="z-[60] bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] p-4 md:p-5 rounded-2xl shadow-2xl w-[260px] md:w-auto md:max-w-sm text-right glass-panel"
                                  sideOffset={10}
                                  collisionPadding={10}
                                >
                                  <div className="flex items-center justify-between mb-3 border-b border-[var(--color-punkt-border)] pb-3">
                                    <div className="flex items-center gap-2 text-xs md:text-sm text-[var(--color-punkt-green)] font-mono font-bold bg-[var(--color-punkt-green)]/10 px-3 py-1 rounded-lg">
                                      <Clock size={14} />
                                      {format(scheduledAtDate, "HH:mm")}
                                    </div>
                                  </div>
                                  <div className="text-xs md:text-sm whitespace-pre-wrap leading-relaxed font-medium text-gray-200">
                                    {msg.content}
                                  </div>

                                  {msg.media_url && (
                                    <div className="mt-3 md:mt-4 rounded-xl overflow-hidden border border-[var(--color-punkt-border)] relative">
                                      {msg.media_type === "video" ? (
                                        <video
                                          src={msg.media_url}
                                          controls
                                          className="w-full h-32 md:h-48 object-cover bg-black"
                                        />
                                      ) : (
                                        <img
                                          src={msg.media_url}
                                          alt="Media preview"
                                          className="w-full h-32 md:h-40 object-cover"
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
      )}
    </div>
  );
}

function MobileVerticalDayView({
  messages,
  date,
}: {
  messages: ScheduledMessage[];
  date: Date;
}) {
  return (
    <div className="flex-1 overflow-y-auto relative bg-[var(--color-punkt-bg)]">
      <div className="flex flex-col pb-20">
        {HOURS.map((hour) => {
          const hourMsgs = messages.filter((m) => {
            const d = parseISO(m.scheduled_at);
            return (
              isSameDay(d, date) &&
              getHours(d) === hour &&
              m.status !== "canceled"
            );
          });

          return (
            <div
              key={hour}
              className="flex border-b border-[var(--color-punkt-border)] min-h-[70px]"
            >
              <div className="w-16 flex-shrink-0 border-l border-[var(--color-punkt-border)] py-3 px-1 flex flex-col items-center text-[11px] font-mono font-bold text-[var(--color-punkt-muted)] bg-[var(--color-punkt-surface)]/30">
                <span>{hour.toString().padStart(2, "0")}:00</span>
                {isSameDay(date, new Date()) &&
                  getHours(new Date()) === hour && (
                    <div className="w-2 h-2 rounded-full bg-[var(--color-punkt-green)] mt-2 shadow-[0_0_8px_rgba(86,192,142,0.8)]"></div>
                  )}
              </div>

              <div className="flex-1 p-3 flex flex-col gap-3 relative">
                {hourMsgs.length === 0 ? (
                  <div className="absolute inset-0 border-b border-dashed border-[var(--color-punkt-border)]/20 pointer-events-none top-1/2"></div>
                ) : (
                  hourMsgs.map((msg) => {
                    const scheduledAtDate = parseISO(msg.scheduled_at);
                    const isSent =
                      msg.status === "sent" ||
                      isBefore(scheduledAtDate, new Date());

                    return (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-xl border relative z-10 ${
                          isSent
                            ? "bg-gradient-to-br from-[var(--color-punkt-green)]/10 to-emerald-600/5 border-[var(--color-punkt-green)]/30 text-gray-200"
                            : "bg-gradient-to-br from-[var(--color-punkt-gold)]/10 to-amber-500/5 border-[var(--color-punkt-gold)]/30 text-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-[var(--color-punkt-muted)]">
                            {msg.media_type === "image" && (
                              <ImageIcon
                                size={14}
                                className={
                                  isSent
                                    ? "text-[var(--color-punkt-green)]"
                                    : "text-[var(--color-punkt-gold)]"
                                }
                              />
                            )}
                            {msg.media_type === "video" && (
                              <Video
                                size={14}
                                className={
                                  isSent
                                    ? "text-[var(--color-punkt-green)]"
                                    : "text-[var(--color-punkt-gold)]"
                                }
                              />
                            )}
                            {msg.media_type === "text" && (
                              <AlignLeft
                                size={14}
                                className={
                                  isSent
                                    ? "text-[var(--color-punkt-green)]"
                                    : "text-[var(--color-punkt-gold)]"
                                }
                              />
                            )}
                            <span className="text-[11px] font-mono font-bold">
                              {format(scheduledAtDate, "HH:mm")}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed line-clamp-3">
                          {msg.content}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

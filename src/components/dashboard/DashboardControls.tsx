import React, { useMemo } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { isSameWeek, isSameDay, parseISO, isBefore } from "date-fns";
import { ScheduledMessage } from "../../types";
import { GROUPS } from "../../constants";

export function DashboardStats({
  messages,
  isLoading,
}: {
  messages: ScheduledMessage[];
  isLoading: boolean;
}) {
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
      )
        sentThisWeek++;
      if (
        isSameDay(msgDate, now) &&
        msg.status === "scheduled" &&
        !isBefore(msgDate, now)
      )
        scheduledToday++;
    });
    return { sentThisWeek, scheduledToday };
  }, [messages]);

  return (
    <div className="p-4 lg:p-6 grid grid-cols-2 gap-3 lg:gap-6 border-b border-[var(--color-punkt-border)] bg-[var(--color-punkt-surface)]/30 flex-shrink-0 z-10 relative">
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
  );
}

export function Filters({
  statusFilter,
  setStatusFilter,
  selectedGroup,
  setSelectedGroup,
}: any) {
  return (
    <div className="px-4 py-3 flex gap-3 overflow-x-auto border-b border-[var(--color-punkt-border)] bg-[var(--color-punkt-bg)] hide-scrollbar flex-shrink-0 z-10 relative items-center">
      <div className="flex bg-[var(--color-punkt-surface)] rounded-full p-1 border border-[var(--color-punkt-border)] flex-shrink-0">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${statusFilter === "all" ? "bg-white text-black" : "text-[var(--color-punkt-muted)] hover:text-white"}`}
        >
          הכל
        </button>
        <button
          onClick={() => setStatusFilter("sent")}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-colors ${statusFilter === "sent" ? "bg-emerald-500/20 text-emerald-400" : "text-[var(--color-punkt-muted)] hover:text-white"}`}
        >
          <CheckCircle2 size={12} /> עבר (נשלח)
        </button>
        <button
          onClick={() => setStatusFilter("scheduled")}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-colors ${statusFilter === "scheduled" ? "bg-amber-500/20 text-amber-400" : "text-[var(--color-punkt-muted)] hover:text-white"}`}
        >
          <Clock size={12} /> עתיד (מתוזמן)
        </button>
      </div>
      <div className="w-px h-6 bg-[var(--color-punkt-border)] mx-1 flex-shrink-0"></div>
      <button
        onClick={() => setSelectedGroup("all")}
        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${selectedGroup === "all" ? "bg-white text-black" : "bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] text-[var(--color-punkt-muted)] hover:text-white"}`}
      >
        כל הקבוצות
      </button>
      {GROUPS.map((g) => (
        <button
          key={g.id}
          onClick={() => setSelectedGroup(g.id)}
          style={{
            backgroundColor:
              selectedGroup === g.id ? g.color : "var(--color-punkt-surface)",
            color: selectedGroup === g.id ? "#000" : "var(--color-punkt-muted)",
            borderColor:
              selectedGroup === g.id ? g.color : "var(--color-punkt-border)",
          }}
          className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all border hover:text-white"
        >
          {g.name}
        </button>
      ))}
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

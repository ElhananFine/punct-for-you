import React, { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { he } from "date-fns/locale";
import { Trash2, Repeat, Loader2, CalendarClock } from "lucide-react";
import { GROUPS } from "../../constants";

export function RecurringSchedulesView() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecurring = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        "https://three-of-day-bp4b.onrender.com/api/recurring",
      );
      const data = await res.json();
      setSchedules(data || []);
    } catch (e) {
      console.error("Failed to fetch recurring", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurring();
  }, []);

  const handleCancel = async (id: string) => {
    if (
      !window.confirm(
        "האם למחוק את התזמון הקבוע הזה? המערכת תפסיק לשגר אותו באופן מיידי.",
      )
    )
      return;

    try {
      await fetch(
        "https://three-of-day-bp4b.onrender.com/api/recurring/cancel",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        },
      );
      fetchRecurring();
    } catch (e) {
      alert("שגיאה בביטול");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[var(--color-punkt-bg)] z-0 relative">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h3 className="text-2xl font-display font-bold flex items-center gap-2">
            <Repeat className="text-[var(--color-punkt-green)]" /> ניהול תזמונים
            קבועים
          </h3>
          <p className="text-[var(--color-punkt-muted)] mt-2">
            כאן מופיעים כל התזמונים שמוגדרים לחזור על עצמם (יומי/שבועי). ניתן
            לבטל אותם בכל עת.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
          </div>
        ) : schedules.length === 0 ? (
          <div className="bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] rounded-2xl p-12 text-center text-gray-400">
            אין כרגע תזמונים קבועים פעילים במערכת.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map((item) => (
              <div
                key={item.id}
                className="bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] rounded-2xl p-5 hover:border-[var(--color-punkt-green)] transition-all"
              >
                <div className="flex justify-between items-start mb-3 border-b border-gray-800 pb-3">
                  <div className="flex flex-col">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-sm">
                      <CalendarClock size={16} />
                      {item.mode === "daily"
                        ? "חוזר כל יום"
                        : `חוזר כל יום ${item.mode}`}{" "}
                      בשעה {item.time_str}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      קבוצה:{" "}
                      {GROUPS.find((g) => g.id === item.group_id)?.name ||
                        item.group_id}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCancel(item.id)}
                    className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                    title="בטל תזמון קבוע"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="text-sm text-gray-300 whitespace-pre-wrap line-clamp-4">
                  {item.content}
                </div>

                <div className="mt-4 text-xs font-mono text-gray-500">
                  תאריך סיום מוגדר:{" "}
                  {format(parseISO(item.end_date), "dd/MM/yyyy")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

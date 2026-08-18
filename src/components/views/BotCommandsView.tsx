import React, { useState } from "react";
import { GROUPS } from "../../constants";
import {
  Send,
  BarChart2,
  Trash2,
  PauseCircle,
  PlayCircle,
  Link,
  Settings,
  MessageSquare,
} from "lucide-react";

export function BotCommandsView() {
  const [selectedGroup, setSelectedGroup] = useState<string>("punkt_foryou");
  const [isSending, setIsSending] = useState(false);

  // פונקציה ששולחת את הפקודה ישירות ל-WhatsApp ללא תוספות של #שלח
  const sendCommand = async (command: string) => {
    setIsSending(true);
    try {
      // שימוש ב-API הישיר של רנדר שלא משנה את הטקסט
      const response = await fetch(
        "https://three-of-day-bp4b.onrender.com/api/send-direct",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupId: selectedGroup,
            content: command,
          }),
        },
      );

      if (!response.ok) throw new Error("שגיאה בשליחת הפקודה");
      alert(`✅ הפקודה ${command} נשלחה בהצלחה!\nהבוט יגיב בווטסאפ בקרוב.`);
    } catch (e: any) {
      alert("שגיאה: " + e.message);
    } finally {
      setIsSending(false);
    }
  };

  const isZinger = selectedGroup !== "punkt_foryou";

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[var(--color-punkt-bg)] z-0 relative">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h3 className="text-2xl font-display font-bold text-white mb-2">
            מרכז פקודות בוט 🤖
          </h3>
          <p className="text-[var(--color-punkt-muted)]">
            בחר קבוצה ולחץ על פעולה. המערכת תשלח את הפקודה והבוט יחזיר תשובה
            בווטסאפ.
          </p>
        </div>

        <div className="bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] p-6 rounded-2xl mb-8">
          <label className="block text-sm font-bold text-[var(--color-punkt-green)] mb-3">
            בחר קבוצה לניהול:
          </label>
          <div className="flex flex-wrap gap-3">
            {GROUPS.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGroup(g.id)}
                className={`px-5 py-2.5 rounded-xl font-bold transition-all ${selectedGroup === g.id ? "bg-[var(--color-punkt-green)] text-black shadow-[0_0_15px_rgba(86,192,142,0.4)]" : "bg-[var(--color-punkt-bg)] border border-[var(--color-punkt-border)] text-gray-400 hover:border-[var(--color-punkt-green)]"}`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CommandCard
            icon={<BarChart2 />}
            title="סטטיסטיקות ונתונים"
            command="#נתונים"
            desc="קבל דוח נתונים מהבוט"
            isSending={isSending}
            onClick={sendCommand}
          />
          <CommandCard
            icon={<Trash2 />}
            title="ניקוי תור"
            command={isZinger ? "#ניקוי" : "#ניקוי הכל"}
            desc="מוחק את כל ההודעות הממתינות"
            isSending={isSending}
            onClick={sendCommand}
          />
          <CommandCard
            icon={<PauseCircle />}
            title="השהיית פרסומים"
            command="#הפסקה 10 דקות"
            desc="משהה את הבוט ל-10 דקות"
            isSending={isSending}
            onClick={sendCommand}
          />
          <CommandCard
            icon={<PlayCircle />}
            title="ביטול השהייה (עצור)"
            command="#הפסקה עצור"
            desc="ממשיך את שידור התור מיד"
            isSending={isSending}
            onClick={sendCommand}
          />
          <CommandCard
            icon={<Link />}
            title="קישורי קבוצות"
            command="#קישורים"
            desc="שולח את רשימת קישורי ההזמנה"
            isSending={isSending}
            onClick={sendCommand}
          />
          <CommandCard
            icon={<Settings />}
            title="עזרה ופקודות"
            command="#פקודות"
            desc="מציג את תפריט העזרה המלא"
            isSending={isSending}
            onClick={sendCommand}
          />
        </div>

        {/* פאנל פקודה חופשית */}
        <div className="mt-8 bg-[var(--color-punkt-surface-hover)] border border-[var(--color-punkt-border)] p-6 rounded-2xl">
          <h4 className="text-white font-bold mb-4 flex items-center gap-2">
            <MessageSquare size={18} /> שליחת פקודה חופשית / מותאמת אישית
          </h4>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const val = (
                e.currentTarget.elements.namedItem(
                  "customCmd",
                ) as HTMLInputElement
              ).value;
              if (val) sendCommand(val);
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              name="customCmd"
              placeholder="למשל: #הפסקה 3 שעות"
              className="flex-1 bg-[var(--color-punkt-bg)] border border-[var(--color-punkt-border)] rounded-xl px-4 text-white focus:border-[var(--color-punkt-green)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSending}
              className="bg-gray-200 text-black px-6 py-2 rounded-xl font-bold hover:bg-white transition-colors"
            >
              שלח
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function CommandCard({ icon, title, command, desc, isSending, onClick }: any) {
  return (
    <button
      onClick={() => onClick(command)}
      disabled={isSending}
      className="bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] p-5 rounded-2xl text-right hover:border-[var(--color-punkt-green)] hover:bg-[var(--color-punkt-surface-hover)] transition-all group disabled:opacity-50"
    >
      <div className="text-[var(--color-punkt-green)] mb-3">{icon}</div>
      <h4 className="text-white font-bold text-lg mb-1">{title}</h4>
      <p className="text-[var(--color-punkt-muted)] text-sm mb-3">{desc}</p>
      <code className="bg-black/50 px-2 py-1 rounded text-xs text-emerald-300 font-mono inline-block">
        {command}
      </code>
    </button>
  );
}

import React, { useEffect, useState } from "react";
import { TikTokPoolLink } from "../../types";
import { format, parseISO } from "date-fns";
import { he } from "date-fns/locale";
import {
  Trash2,
  CheckCircle,
  ExternalLink,
  CalendarPlus,
  Loader2,
  RefreshCw,
  Plus,
} from "lucide-react";

interface TikTokPoolViewProps {
  onScheduleLink: (link: TikTokPoolLink) => void;
}

export function TikTokPoolView({ onScheduleLink }: TikTokPoolViewProps) {
  const [links, setLinks] = useState<TikTokPoolLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States for adding a new link manually
  const [newUrl, setNewUrl] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        "https://three-of-day-bp4b.onrender.com/api/tiktok/pool",
      );
      const data = await res.json();
      setLinks(data || []);
    } catch (e) {
      console.error("Failed to fetch pool", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    setIsAdding(true);
    try {
      const res = await fetch(
        "https://three-of-day-bp4b.onrender.com/api/tiktok/pool/add",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: newUrl, notes: newNotes }),
        },
      );
      const data = await res.json();
      if (data.status === "duplicate") {
        alert(data.message); // התראת כפילות שמוחזרת מהשרת
      } else {
        setNewUrl("");
        setNewNotes("");
        fetchLinks(); // רענון הרשימה לאחר הוספה
      }
    } catch (err) {
      alert("שגיאה בהוספת הקישור. ודא שהשרת פועל.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleMarkUsed = async (id: string) => {
    if (
      !window.confirm(
        "האם אתה בטוח שברצונך לסמן קישור זה כטופל? הוא ייעלם מהרשימה.",
      )
    )
      return;
    try {
      await fetch(
        "https://three-of-day-bp4b.onrender.com/api/tiktok/pool/mark-used",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, targetGroupId: "manual_mark" }),
        },
      );
      fetchLinks();
    } catch (e) {
      alert("שגיאה בעדכון");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("למחוק את הקישור לצמיתות?")) return;
    try {
      await fetch(
        "https://three-of-day-bp4b.onrender.com/api/tiktok/pool/delete",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        },
      );
      fetchLinks();
    } catch (e) {
      alert("שגיאה במחיקה");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[var(--color-punkt-bg)] z-0 relative">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-display font-bold">
              מאגר קישורים ממתינים
            </h3>
            <p className="text-sm text-[var(--color-punkt-muted)] mt-1">
              כל קישור שנשלח לקבוצת הווטסאפ או מתווסף כאן, ימתין בתור לשיבוץ.
            </p>
          </div>
          <button
            onClick={fetchLinks}
            className="flex items-center gap-2 bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] px-4 py-2 rounded-xl text-sm hover:text-white transition"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />{" "}
            רענן נתונים
          </button>
        </div>

        {/* פאנל הוספת קישור ידני */}
        <form
          onSubmit={handleAddLink}
          className="bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-3 shadow-lg"
        >
          <input
            type="url"
            placeholder="https://www.tiktok.com/..."
            required
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="flex-1 bg-[var(--color-punkt-bg)] border border-[var(--color-punkt-border)] rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-[var(--color-punkt-green)] text-left"
            dir="ltr"
          />
          <input
            type="text"
            placeholder="הערות למנהל (לא חובה)..."
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            className="flex-1 bg-[var(--color-punkt-bg)] border border-[var(--color-punkt-border)] rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-[var(--color-punkt-green)]"
          />
          <button
            type="submit"
            disabled={!newUrl || isAdding}
            className="bg-[var(--color-punkt-green)] text-black font-bold px-6 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isAdding ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            הוסף למאגר
          </button>
        </form>

        {/* תצוגת הקישורים */}
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2
              className="animate-spin text-[var(--color-punkt-green)]"
              size={32}
            />
          </div>
        ) : links.length === 0 ? (
          <div className="text-center bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] rounded-2xl p-12 text-[var(--color-punkt-muted)]">
            אין כרגע קישורים שממתינים לטיפול במאגר.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {links.map((link) => (
              <div
                key={link.id}
                className="bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] rounded-2xl p-5 flex flex-col justify-between hover:border-[var(--color-punkt-green)]/50 transition"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs bg-[var(--color-punkt-bg)] px-2 py-1 rounded text-gray-400 font-mono">
                      {format(parseISO(link.created_at), "dd MMM HH:mm", {
                        locale: he,
                      })}
                    </span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                  <div
                    className="text-gray-300 text-sm font-mono truncate mb-2"
                    dir="ltr"
                  >
                    {link.url}
                  </div>
                  <div className="bg-[var(--color-punkt-bg)] p-3 rounded-xl border border-[var(--color-punkt-border)] min-h-[60px] text-sm text-gray-200">
                    {link.notes ? (
                      <span>💬 {link.notes}</span>
                    ) : (
                      <span className="opacity-40 italic">ללא הערות</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-2 border-t border-[var(--color-punkt-border)] pt-4">
                  <button
                    onClick={() => onScheduleLink(link)}
                    className="flex-1 bg-[var(--color-punkt-green)] text-black font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-1 hover:opacity-90 transition"
                  >
                    <CalendarPlus size={16} /> תזמן
                  </button>
                  <button
                    onClick={() => handleMarkUsed(link.id)}
                    title="סמן כטופל (יעלים מכאן)"
                    className="p-2 bg-[var(--color-punkt-surface-hover)] text-emerald-400 rounded-lg border border-[var(--color-punkt-border)] hover:bg-emerald-500/10 transition"
                  >
                    <CheckCircle size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    title="מחק לצמיתות"
                    className="p-2 bg-[var(--color-punkt-surface-hover)] text-red-400 rounded-lg border border-[var(--color-punkt-border)] hover:bg-red-500/10 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

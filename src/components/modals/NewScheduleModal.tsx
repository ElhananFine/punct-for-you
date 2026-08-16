import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  X,
  Send,
  Loader2,
  Paperclip,
  Zap,
  EyeOff,
  Clock as ClockIcon,
  Link2,
  RefreshCw,
  UploadCloud,
  CloudSun,
  Sparkles,
  Inbox,
  LayoutDashboard,
} from "lucide-react";
import { TikTokPoolLink } from "../../types";
import { format, parseISO } from "date-fns";
import { GROUPS } from "../../constants";
import { he } from "date-fns/locale";

interface NewScheduleModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialTikTokLink?: TikTokPoolLink | null;
}

export function NewScheduleModal({
  onClose,
  onSuccess,
  initialTikTokLink,
}: NewScheduleModalProps) {
  const formRef = useRef<HTMLFormElement>(null);

  // Local Form State
  const [uploadMode, setUploadMode] = useState<"manual" | "tiktok" | "weather">(
    initialTikTokLink ? "tiktok" : "manual",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Content & Logic states
  const [textContent, setTextContent] = useState("");
  const [sendNow, setSendNow] = useState(false);
  const [isStatus, setIsStatus] = useState(false);
  const [noSignature, setNoSignature] = useState(false);
  const [pauseOption, setPauseOption] = useState("none");

  // Manual Mode (AI Image & Drag Drop) states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false); // סטייט חדש לגרירת קבצים

  // TikTok Mode states
  const [tiktokUrl, setTiktokUrl] = useState(
    initialTikTokLink ? initialTikTokLink.url : "",
  );
  const [isFetchingTiktok, setIsFetchingTiktok] = useState(false);
  const [fetchedMediaUrl, setFetchedMediaUrl] = useState("");
  const [originalTiktokDesc, setOriginalTiktokDesc] = useState("");

  // TikTok Pool states
  const [pendingLinks, setPendingLinks] = useState<TikTokPoolLink[]>([]);
  const [isLoadingPool, setIsLoadingPool] = useState(false);
  const [selectedPoolLinkId, setSelectedPoolLinkId] = useState<string | null>(
    initialTikTokLink ? initialTikTokLink.id : null,
  );

  // Weather Mode states
  const [isGeneratingWeather, setIsGeneratingWeather] = useState(false);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [weatherDate, setWeatherDate] = useState(
    tomorrow.toISOString().split("T")[0],
  );

  useEffect(() => {
    if (uploadMode === "tiktok" && !initialTikTokLink) fetchPendingLinks();
  }, [uploadMode]);

  const fetchPendingLinks = async () => {
    setIsLoadingPool(true);
    try {
      const res = await fetch(
        "https://three-of-day-bp4b.onrender.com/api/tiktok/pool",
      );
      if (res.ok) setPendingLinks((await res.json()) || []);
    } catch (e) {
    } finally {
      setIsLoadingPool(false);
    }
  };

  const handleSelectPoolLink = (link: TikTokPoolLink) => {
    setTiktokUrl(link.url);
    setSelectedPoolLinkId(link.id);
  };

  const handleAnalyzeFileWithAI = async () => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("image/")) {
      alert("ניסוח אוטומטי זמין כרגע רק לתמונות.");
      return;
    }
    if (selectedFile.size > 4 * 1024 * 1024) {
      alert("התמונה כבדה מדי (מעל 4MB). העלה תמונה קלה יותר לניתוח.");
      return;
    }

    setIsAnalyzingFile(true);
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await fetch(
          "https://three-of-day-bp4b.onrender.com/api/ai/analyze-media",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ base64Data, mimeType: selectedFile.type }),
          },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setTextContent(data.text);
      } catch (e: any) {
        alert("שגיאה בניתוח התמונה: " + e.message);
      } finally {
        setIsAnalyzingFile(false);
      }
    };
  };

  const handleFetchTiktok = async () => {
    if (!tiktokUrl) return;
    setIsFetchingTiktok(true);
    try {
      const res = await fetch(
        "https://three-of-day-bp4b.onrender.com/api/tiktok/fetch",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: tiktokUrl }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "שגיאה במשיכת הנתונים מטיקטוק");

      const poolNote = selectedPoolLinkId
        ? pendingLinks.find((l) => l.id === selectedPoolLinkId)?.notes ||
          initialTikTokLink?.notes
        : "";
      setTextContent(
        poolNote ? `${data.text}\n\n*הערת מנהל:* ${poolNote}` : data.text,
      );
      setFetchedMediaUrl(data.mediaUrl);
      setOriginalTiktokDesc(data.originalDesc);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsFetchingTiktok(false);
    }
  };

  const handleRegenerateTiktokText = async () => {
    setIsFetchingTiktok(true);
    try {
      const res = await fetch(
        "https://three-of-day-bp4b.onrender.com/api/tiktok/regenerate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ desc: originalTiktokDesc }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTextContent(data.text);
    } catch (e: any) {
      alert("שגיאה ביצירת טקסט חדש: " + e.message);
    } finally {
      setIsFetchingTiktok(false);
    }
  };

  const handleGenerateWeather = async () => {
    setIsGeneratingWeather(true);
    try {
      const res = await fetch(
        "https://three-of-day-bp4b.onrender.com/api/weather/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetDate: weatherDate }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTextContent(data.text);
    } catch (e: any) {
      alert("שגיאה ביצירת תחזית: " + e.message);
    } finally {
      setIsGeneratingWeather(false);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const selectedGroupId = formData.get("groupId") as string;

    if (selectedGroupId === "all" && GROUPS.length > 3) {
      alert(
        "שגיאה: חשבון Green API החינמי שלך מוגבל למשלוח ל-3 קבוצות בלבד בחודש.\nיש לשדרג למסלול Business.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      formData.append("sendNow", sendNow.toString());
      formData.append("isStatus", isStatus.toString());
      formData.append("noSignature", noSignature.toString());
      formData.append("pause", pauseOption);
      formData.append("content", textContent);

      if (uploadMode === "manual" && selectedFile)
        formData.set("file", selectedFile);
      if (uploadMode === "tiktok" && fetchedMediaUrl)
        formData.append("mediaUrl", fetchedMediaUrl);

      const response = await fetch(
        "https://edqhvnrdygdqvetcrebv.supabase.co/functions/v1/send-wa-schedule",
        { method: "POST", body: formData },
      );
      if (!response.ok) throw new Error("שגיאה בשליחת התזמון");

      if (uploadMode === "tiktok" && selectedPoolLinkId) {
        await fetch(
          "https://three-of-day-bp4b.onrender.com/api/tiktok/pool/mark-used",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: selectedPoolLinkId,
              targetGroupId: selectedGroupId,
            }),
          },
        );
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
        className="bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-[var(--color-punkt-border)] flex justify-between items-center bg-gradient-to-r from-[var(--color-punkt-surface)] to-[var(--color-punkt-bg)] flex-shrink-0">
          <h3 className="font-display font-bold text-xl text-white">
            תזמון הודעה חדשה
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--color-punkt-muted)] hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        <form
          ref={formRef}
          onSubmit={handleCreateSchedule}
          className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar"
        >
          {/* Mode Selector */}
          <div className="flex bg-[var(--color-punkt-bg)] p-1 rounded-xl mb-4 border border-[var(--color-punkt-border)]">
            <button
              type="button"
              onClick={() => setUploadMode("manual")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${uploadMode === "manual" ? "bg-[var(--color-punkt-surface)] text-[var(--color-punkt-green)] shadow-md" : "text-[var(--color-punkt-muted)]"}`}
            >
              <div className="flex items-center justify-center gap-2">
                <UploadCloud size={16} /> מהמחשב
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setUploadMode("tiktok");
                fetchPendingLinks();
              }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${uploadMode === "tiktok" ? "bg-[var(--color-punkt-surface)] text-[var(--color-punkt-green)] shadow-md" : "text-[var(--color-punkt-muted)]"}`}
            >
              <div className="flex items-center justify-center gap-2">
                <Link2 size={16} /> מטיקטוק
              </div>
            </button>
            <button
              type="button"
              onClick={() => setUploadMode("weather")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${uploadMode === "weather" ? "bg-[var(--color-punkt-surface)] text-[var(--color-punkt-green)] shadow-md" : "text-[var(--color-punkt-muted)]"}`}
            >
              <div className="flex items-center justify-center gap-2">
                <CloudSun size={16} /> מזג אוויר
              </div>
            </button>
          </div>

          {/* === Dynamic Input Areas === */}

          {/* 1. TikTok Mode */}
          {uploadMode === "tiktok" && (
            <div className="space-y-4">
              <div className="bg-[var(--color-punkt-surface-hover)] p-4 rounded-xl border border-[var(--color-punkt-border)]">
                <div className="flex items-center justify-between mb-3 border-b border-[var(--color-punkt-border)] pb-2">
                  <h4 className="text-sm font-bold flex items-center gap-2 text-white">
                    <Inbox size={16} className="text-pink-400" /> מאגר קישורים
                    ממתינים
                  </h4>
                  <button
                    type="button"
                    onClick={fetchPendingLinks}
                    className="text-xs text-[var(--color-punkt-muted)] hover:text-white flex items-center gap-1"
                  >
                    <RefreshCw
                      size={12}
                      className={isLoadingPool ? "animate-spin" : ""}
                    />{" "}
                    רענן
                  </button>
                </div>

                <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                  {isLoadingPool ? (
                    <div className="text-center py-4 text-[var(--color-punkt-muted)] text-xs">
                      <Loader2
                        size={16}
                        className="animate-spin mx-auto mb-1"
                      />{" "}
                      טוען מאגר...
                    </div>
                  ) : pendingLinks.length === 0 ? (
                    <div className="text-center py-4 text-[var(--color-punkt-muted)] text-xs">
                      אין כרגע קישורים שממתינים.
                    </div>
                  ) : (
                    pendingLinks.map((link) => (
                      <div
                        key={link.id}
                        onClick={() => handleSelectPoolLink(link)}
                        className={`p-2 rounded-lg border text-xs cursor-pointer transition-colors ${selectedPoolLinkId === link.id ? "border-[var(--color-punkt-green)] bg-[var(--color-punkt-green)]/10" : "border-[var(--color-punkt-border)] bg-[var(--color-punkt-bg)] hover:border-gray-500"}`}
                      >
                        <div
                          className="text-gray-300 truncate font-mono"
                          dir="ltr"
                        >
                          {link.url}
                        </div>
                        {link.notes && (
                          <div className="text-gray-400 mt-1 font-bold">
                            💬 {link.notes}
                          </div>
                        )}
                        <div className="text-[10px] text-gray-500 mt-1">
                          {format(
                            parseISO(link.created_at),
                            "dd/MM/yyyy HH:mm",
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-[var(--color-punkt-green)]/5 p-4 rounded-xl border border-[var(--color-punkt-green)]/20">
                <label className="block text-sm font-bold text-[var(--color-punkt-green)]">
                  הדבק קישור טיקטוק או בחר מהמאגר:
                </label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="url"
                    value={tiktokUrl}
                    onChange={(e) => {
                      setTiktokUrl(e.target.value);
                      setSelectedPoolLinkId(null);
                    }}
                    placeholder="https://www.tiktok.com/..."
                    className="flex-1 bg-[var(--color-punkt-bg)] border border-[var(--color-punkt-border)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-punkt-green)] text-left"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={handleFetchTiktok}
                    disabled={isFetchingTiktok || !tiktokUrl}
                    className="bg-[var(--color-punkt-green)] text-black font-bold px-4 rounded-xl hover:opacity-90 disabled:opacity-50 min-w-[100px] flex items-center justify-center"
                  >
                    {isFetchingTiktok ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      "משוך תוכן"
                    )}
                  </button>
                </div>
                {fetchedMediaUrl && (
                  <div className="relative mt-2 rounded-xl overflow-hidden border border-[var(--color-punkt-green)]/30 flex justify-center bg-black">
                    {fetchedMediaUrl.endsWith("jpg") ? (
                      <img
                        src={fetchedMediaUrl}
                        className="max-h-48 object-contain"
                      />
                    ) : (
                      <video
                        src={fetchedMediaUrl}
                        controls
                        className="max-h-48 w-full object-contain"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. Weather Mode */}
          {uploadMode === "weather" && (
            <div className="space-y-4 bg-blue-500/5 p-4 rounded-xl border border-blue-500/20 flex flex-col items-center">
              <CloudSun size={32} className="text-blue-400 mb-2" />
              <p className="text-sm text-center text-blue-200">
                בחר תאריך ליצירת תחזית מבוססת AI לפי 4 אזורים בארץ.
                <br />
                <span className="text-xs opacity-70">
                  (ניתן לבחור עד 5 ימים קדימה)
                </span>
              </p>

              <input
                type="date"
                value={weatherDate}
                onChange={(e) => setWeatherDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                max={
                  new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0]
                }
                className="bg-[var(--color-punkt-bg)] border border-[var(--color-punkt-border)] rounded-xl py-2 px-4 text-white focus:outline-none focus:border-blue-400 text-center w-full max-w-[200px]"
              />

              <button
                type="button"
                onClick={handleGenerateWeather}
                disabled={isGeneratingWeather}
                className="bg-blue-500 text-white font-bold py-2 px-6 rounded-xl hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2 w-full max-w-[200px] justify-center"
              >
                {isGeneratingWeather ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <CloudSun size={18} />
                )}
                {isGeneratingWeather ? "מייצר תחזית..." : "חולל תחזית"}
              </button>
            </div>
          )}

          {/* 3. Manual Mode (With Drag and Drop) */}
          {uploadMode === "manual" && (
            <div className="space-y-3">
              <label className="block text-sm font-bold text-[var(--color-punkt-muted)]">
                קובץ מצורף (תמונה/וידאו - לא חובה)
              </label>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setSelectedFile(e.dataTransfer.files[0]);
                  }
                }}
                className={`relative flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl py-8 transition-all cursor-pointer overflow-hidden ${
                  isDraggingFile
                    ? "border-[var(--color-punkt-green)] bg-[var(--color-punkt-green)]/10 scale-[1.02]"
                    : selectedFile
                      ? "border-[var(--color-punkt-green)] bg-[var(--color-punkt-green)]/5"
                      : "border-[var(--color-punkt-border)] bg-[var(--color-punkt-bg)] hover:border-[var(--color-punkt-green)]"
                }`}
              >
                {/* Input file is invisible but covers the whole div to allow clicking */}
                <input
                  type="file"
                  name="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0])
                      setSelectedFile(e.target.files[0]);
                  }}
                />

                <Paperclip
                  size={24}
                  className={
                    selectedFile || isDraggingFile
                      ? "text-[var(--color-punkt-green)]"
                      : "text-[var(--color-punkt-muted)]"
                  }
                />
                <span
                  className={`text-sm font-bold pointer-events-none ${selectedFile || isDraggingFile ? "text-[var(--color-punkt-green)]" : "text-[var(--color-punkt-muted)]"}`}
                >
                  {selectedFile
                    ? selectedFile.name
                    : isDraggingFile
                      ? "שחרר את הקובץ כאן..."
                      : "לחץ לבחירה או גרור קובץ לכאן"}
                </span>
              </div>

              {selectedFile && selectedFile.type.startsWith("image/") && (
                <button
                  type="button"
                  onClick={handleAnalyzeFileWithAI}
                  disabled={isAnalyzingFile}
                  className="w-full bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-green)]/30 text-[var(--color-punkt-green)] font-bold py-2 rounded-xl hover:bg-[var(--color-punkt-green)]/10 disabled:opacity-50 flex items-center justify-center gap-2 transition"
                >
                  {isAnalyzingFile ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> ה-AI מנתח
                      את התמונה...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> נסח טקסט אוטומטי מהתמונה
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Group Target */}
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

          {/* Advanced Bot Options */}
          <div className="bg-[var(--color-punkt-bg)] border border-[var(--color-punkt-border)] p-4 rounded-xl space-y-4">
            <h4 className="text-sm font-bold text-[var(--color-punkt-green)] border-b border-[var(--color-punkt-border)] pb-2 mb-3">
              הגדרות בוט מתקדמות
            </h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" />
                <span className="text-sm font-bold">
                  שליחה מיידית (עוקף תור)
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={sendNow}
                  onChange={(e) => setSendNow(e.target.checked)}
                />
                <div className="w-11 h-6 bg-[var(--color-punkt-surface-hover)] peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-punkt-green)]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutDashboard size={16} className="text-blue-400" />
                <span className="text-sm font-bold">שליחה כסטטוס</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isStatus}
                  onChange={(e) => setIsStatus(e.target.checked)}
                />
                <div className="w-11 h-6 bg-[var(--color-punkt-surface-hover)] peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-punkt-green)]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EyeOff size={16} className="text-gray-400" />
                <span className="text-sm font-bold">ללא חתימה בסוף</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={noSignature}
                  onChange={(e) => setNoSignature(e.target.checked)}
                />
                <div className="w-11 h-6 bg-[var(--color-punkt-surface-hover)] peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-punkt-green)]"></div>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-bold mb-2 mt-2">
                <ClockIcon size={16} className="text-purple-400" />
                השהיה אחרי השליחה (זמן מסך)
              </label>
              <select
                value={pauseOption}
                onChange={(e) => setPauseOption(e.target.value)}
                className="w-full bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[var(--color-punkt-green)] appearance-none text-sm"
              >
                <option value="none">ללא השהיה</option>
                <option value="10 דקות">10 דקות</option>
                <option value="חצי שעה">חצי שעה</option>
                <option value="שעה">שעה</option>
              </select>
            </div>
          </div>

          {/* Time & Date inputs */}
          <div
            className={`grid grid-cols-2 gap-4 transition-opacity ${sendNow ? "opacity-30 pointer-events-none" : "opacity-100"}`}
          >
            <div>
              <label className="block text-sm font-bold text-[var(--color-punkt-muted)] mb-2">
                תאריך
              </label>
              <input
                name="date"
                type="text"
                placeholder="DD.MM"
                required={!sendNow}
                pattern="\d{1,2}[\/\.]\d{1,2}"
                disabled={sendNow}
                className="w-full bg-[var(--color-punkt-bg)] border border-[var(--color-punkt-border)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-punkt-green)] text-center disabled:bg-[var(--color-punkt-surface)]"
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
                required={!sendNow}
                pattern="\d{1,2}:\d{2}"
                disabled={sendNow}
                className="w-full bg-[var(--color-punkt-bg)] border border-[var(--color-punkt-border)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-punkt-green)] text-center disabled:bg-[var(--color-punkt-surface)]"
                dir="ltr"
              />
            </div>
          </div>

          {/* Text Area */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-bold text-[var(--color-punkt-muted)]">
                טקסט המודעה
              </label>
              {uploadMode === "tiktok" && originalTiktokDesc && (
                <button
                  type="button"
                  onClick={handleRegenerateTiktokText}
                  disabled={isFetchingTiktok}
                  className="text-[var(--color-punkt-green)] text-xs flex items-center gap-1 hover:underline"
                >
                  <RefreshCw
                    size={12}
                    className={isFetchingTiktok ? "animate-spin" : ""}
                  />{" "}
                  נסח מחדש
                </button>
              )}
            </div>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={7}
              placeholder="הקלד את התוכן כאן..."
              className="w-full bg-[var(--color-punkt-bg)] border border-[var(--color-punkt-border)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-punkt-green)] resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 pb-2">
            <button
              type="submit"
              disabled={
                isSubmitting ||
                (uploadMode === "tiktok" && isFetchingTiktok) ||
                (uploadMode === "weather" && isGeneratingWeather) ||
                isAnalyzingFile
              }
              className="w-full bg-gradient-to-r from-[var(--color-punkt-green)] to-emerald-500 text-black font-bold py-3.5 px-6 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> מעבד ושולח...
                </>
              ) : (
                <>
                  <Send size={20} /> {sendNow ? "שלח עכשיו" : "שלח לתזמון"}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

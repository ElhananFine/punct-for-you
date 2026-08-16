import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  X,
  Send,
  Loader2,
  Paperclip,
  Zap,
  EyeOff,
  Link2,
  RefreshCw,
  UploadCloud,
  CloudSun,
  Sparkles,
  Inbox,
  Repeat,
  CalendarDays,
} from "lucide-react";
import { TikTokPoolLink } from "../../types";
import { GROUPS } from "../../constants";
import { format, parseISO, addDays } from "date-fns";
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

  const [uploadMode, setUploadMode] = useState<"manual" | "tiktok" | "weather">(
    initialTikTokLink ? "tiktok" : "manual",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");

  const [textContent, setTextContent] = useState("");
  const [sendNow, setSendNow] = useState(false);
  const [isStatus, setIsStatus] = useState(false);
  const [noSignature, setNoSignature] = useState(false);
  const [noWatermark, setNoWatermark] = useState(false);
  const [skipPlatform, setSkipPlatform] = useState("none");
  const [pauseOption, setPauseOption] = useState("none");
  const [selectedGroup, setSelectedGroup] = useState("all");

  const [recurringMode, setRecurringMode] = useState<
    "none" | "daily" | "weekly"
  >("none");
  const [recurringDay, setRecurringDay] = useState("ראשון");
  const [recurringEndDate, setRecurringEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const [tiktokUrl, setTiktokUrl] = useState(
    initialTikTokLink ? initialTikTokLink.url : "",
  );
  const [isFetchingTiktok, setIsFetchingTiktok] = useState(false);
  const [fetchedMediaUrl, setFetchedMediaUrl] = useState("");
  const [originalTiktokDesc, setOriginalTiktokDesc] = useState("");
  const [pendingLinks, setPendingLinks] = useState<TikTokPoolLink[]>([]);
  const [isLoadingPool, setIsLoadingPool] = useState(false);
  const [selectedPoolLinkId, setSelectedPoolLinkId] = useState<string | null>(
    initialTikTokLink ? initialTikTokLink.id : null,
  );

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
    if (!selectedFile.type.startsWith("image/"))
      return alert("ניסוח אוטומטי זמין כרגע רק לתמונות.");
    if (selectedFile.size > 4 * 1024 * 1024)
      return alert("התמונה כבדה מדי (מעל 4MB). העלה תמונה קלה יותר.");
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
      if (!res.ok) throw new Error(data.error);
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
    if (selectedGroup === "all" && GROUPS.length > 3) {
      alert(
        "שגיאה: חשבון חינמי מוגבל ל-3 קבוצות. יש לשדרג את חשבון Green API.",
      );
      return;
    }

    const formData = new FormData(e.currentTarget);
    const timeStr = formData.get("time") as string;
    setIsSubmitting(true);

    try {
      let finalContent = textContent;
      if (noWatermark) finalContent += "\n%";
      if (noSignature) finalContent += "\n\n#";
      if (skipPlatform !== "none")
        finalContent = `${skipPlatform}\n${finalContent}`;

      const zingerCmd =
        recurringMode === "daily"
          ? `#תזמון כל יום ${timeStr}`
          : `#תזמון כל ${recurringDay} ${timeStr}`;

      const uploadManualFile = async () => {
        if (!selectedFile) return null;
        setProgressMsg("מעלה מדיה דרך שרת הווטסאפ...");
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(selectedFile);
        });
        const ext = selectedFile.name.split(".").pop() || "jpg";
        const res = await fetch(
          "https://three-of-day-bp4b.onrender.com/api/upload-media",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              base64Data: base64,
              mimeType: selectedFile.type,
              extension: ext,
            }),
          },
        );
        const data = await res.json();
        return data.url;
      };

      // 1. טיפול בקבוצת פונקט (לולאות בבאקאנד)
      if (
        recurringMode !== "none" &&
        (selectedGroup === "punkt_foryou" || selectedGroup === "all")
      ) {
        setProgressMsg("מקים לולאה מותאמת בשרת...");
        let mUrl = fetchedMediaUrl;
        if (uploadMode === "manual" && selectedFile) {
          mUrl = await uploadManualFile();
        }
        await fetch(
          "https://three-of-day-bp4b.onrender.com/api/recurring/create",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              groupId: "punkt_foryou",
              content: finalContent,
              mediaType:
                uploadMode === "tiktok"
                  ? "video"
                  : selectedFile?.type.startsWith("image/")
                    ? "image"
                    : "video",
              mediaUrl: mUrl,
              timeStr: timeStr,
              mode: recurringMode === "daily" ? "daily" : recurringDay,
              endDate: recurringEndDate,
            }),
          },
        );
      }

      // 2. טיפול רגיל או זינגר
      if (selectedGroup !== "punkt_foryou") {
        setProgressMsg("שולח בקשה למכשיר...");
        const targets =
          selectedGroup === "all"
            ? GROUPS.filter((g) => g.id !== "punkt_foryou")
            : [{ id: selectedGroup }];

        for (const target of targets) {
          const payload = new FormData();
          payload.append("groupId", target.id);
          payload.append(
            "content",
            recurringMode !== "none"
              ? `${zingerCmd}\n${finalContent}`
              : finalContent,
          );
          payload.append(
            "sendNow",
            (sendNow || recurringMode !== "none").toString(),
          );
          payload.append("isStatus", isStatus.toString());
          payload.append("pause", pauseOption);
          if (uploadMode === "manual" && selectedFile)
            payload.set("file", selectedFile);
          if (uploadMode === "tiktok" && fetchedMediaUrl)
            payload.append("mediaUrl", fetchedMediaUrl);

          await fetch(
            "https://edqhvnrdygdqvetcrebv.supabase.co/functions/v1/send-wa-schedule",
            { method: "POST", body: payload },
          );
        }
      } else if (selectedGroup === "punkt_foryou" && recurringMode === "none") {
        setProgressMsg("שולח למכשיר...");
        formData.append("sendNow", sendNow.toString());
        formData.append("content", finalContent);
        if (uploadMode === "manual" && selectedFile)
          formData.set("file", selectedFile);
        if (uploadMode === "tiktok" && fetchedMediaUrl)
          formData.append("mediaUrl", fetchedMediaUrl);
        await fetch(
          "https://edqhvnrdygdqvetcrebv.supabase.co/functions/v1/send-wa-schedule",
          { method: "POST", body: formData },
        );
      }

      if (uploadMode === "tiktok" && selectedPoolLinkId) {
        await fetch(
          "https://three-of-day-bp4b.onrender.com/api/tiktok/pool/mark-used",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: selectedPoolLinkId,
              targetGroupId: selectedGroup,
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
      setProgressMsg("");
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
        className="bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
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
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
        >
          <div>
            <label className="block text-sm font-bold text-[var(--color-punkt-muted)] mb-2">
              לאיזו קבוצה?
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              name="groupId"
              className="w-full bg-[var(--color-punkt-bg)] border border-[var(--color-punkt-border)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-punkt-green)] appearance-none font-bold"
            >
              <option value="all">כל הקבוצות (ישלח לכולן במקביל)</option>
              {GROUPS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} {g.id === "punkt_foryou" ? "(Punkt)" : "(ZingeR)"}
                </option>
              ))}
            </select>
          </div>

          <div
            className={`bg-[var(--color-punkt-bg)] border border-[var(--color-punkt-border)] p-4 rounded-xl space-y-4 transition-opacity ${sendNow ? "opacity-30 pointer-events-none" : "opacity-100"}`}
          >
            <div className="flex items-center gap-2 border-b border-[var(--color-punkt-border)] pb-2">
              <CalendarDays
                size={18}
                className="text-[var(--color-punkt-green)]"
              />
              <h4 className="text-sm font-bold text-white">הגדרות תזמון</h4>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--color-punkt-muted)] mb-1.5">
                  תאריך (לחד פעמי)
                </label>
                <input
                  name="date"
                  type="text"
                  placeholder="DD/MM או 'היום'"
                  required={!sendNow && recurringMode === "none"}
                  disabled={recurringMode !== "none"}
                  className="w-full bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] rounded-lg py-2.5 px-3 text-white focus:border-[var(--color-punkt-green)] text-center disabled:opacity-30"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--color-punkt-muted)] mb-1.5">
                  שעה
                </label>
                <input
                  name="time"
                  type="text"
                  placeholder="HH:MM"
                  required={!sendNow}
                  pattern="\d{1,2}:\d{2}"
                  className="w-full bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] rounded-lg py-2.5 px-3 text-white focus:border-[var(--color-punkt-green)] text-center"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-[var(--color-punkt-muted)] mb-2 flex items-center gap-1">
                <Repeat size={14} /> תזמון קבוע (חוזר)
              </label>
              <div className="flex bg-[var(--color-punkt-surface)] rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setRecurringMode("none")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md ${recurringMode === "none" ? "bg-white text-black" : "text-gray-400"}`}
                >
                  חד פעמי
                </button>
                <button
                  type="button"
                  onClick={() => setRecurringMode("daily")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md ${recurringMode === "daily" ? "bg-[var(--color-punkt-green)] text-black" : "text-gray-400"}`}
                >
                  כל יום
                </button>
                <button
                  type="button"
                  onClick={() => setRecurringMode("weekly")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md ${recurringMode === "weekly" ? "bg-[var(--color-punkt-green)] text-black" : "text-gray-400"}`}
                >
                  שבועי
                </button>
              </div>
            </div>

            {recurringMode === "weekly" && (
              <select
                value={recurringDay}
                onChange={(e) => setRecurringDay(e.target.value)}
                className="w-full mt-2 bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] rounded-lg py-2 px-3 text-white text-sm"
              >
                {["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"].map(
                  (d) => (
                    <option key={d} value={d}>
                      כל יום {d}
                    </option>
                  ),
                )}
              </select>
            )}

            {recurringMode !== "none" &&
              (selectedGroup === "punkt_foryou" || selectedGroup === "all") && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg text-emerald-200 text-xs">
                  <strong>מערכת פונקט (שומרת שבת):</strong> המערכת תתזמן
                  אוטומטית עד תאריך הסיום שתבחר. <br />
                  <span className="font-bold flex items-center gap-1 mt-1 text-emerald-300">
                    <Sparkles size={12} /> המערכת מדלגת אוטומטית על שבתות ומועדי
                    ישראל!
                  </span>
                  <input
                    type="date"
                    value={recurringEndDate}
                    onChange={(e) => setRecurringEndDate(e.target.value)}
                    className="w-full mt-2 bg-black/50 border border-emerald-500/50 rounded py-1.5 px-2 text-white"
                  />
                </div>
              )}
          </div>

          <div className="bg-[var(--color-punkt-bg)] border border-[var(--color-punkt-border)] p-4 rounded-xl space-y-4">
            <h4 className="text-sm font-bold text-[var(--color-punkt-green)] border-b border-[var(--color-punkt-border)] pb-2 mb-3">
              אפשרויות הודעה מתקדמות
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendNow}
                  onChange={(e) => setSendNow(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-[var(--color-punkt-green)] w-4 h-4"
                />
                שליחה מיידית (#שלח)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isStatus}
                  onChange={(e) => setIsStatus(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-[var(--color-punkt-green)] w-4 h-4"
                />
                שליחה כסטטוס (#סטטוס)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-300">
                <input
                  type="checkbox"
                  checked={noSignature}
                  onChange={(e) => setNoSignature(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-gray-400 w-4 h-4"
                />
                ללא חתימה (סיומת #)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-300">
                <input
                  type="checkbox"
                  checked={noWatermark}
                  onChange={(e) => setNoWatermark(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-gray-400 w-4 h-4"
                />
                ללא סימן מים (סיומת %)
              </label>
            </div>

            <div className="pt-2 border-t border-[var(--color-punkt-border)]">
              <label className="block text-xs font-bold text-gray-400 mb-2">
                דילוג פלטפורמה (!)
              </label>
              <select
                value={skipPlatform}
                onChange={(e) => setSkipPlatform(e.target.value)}
                className="w-full bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] rounded-lg py-2 px-3 text-white text-sm"
              >
                <option value="none">ללא דילוג</option>
                <option value="!טלגרם">אל תשלח לטלגרם (!טלגרם)</option>
                <option value="!טוויטר">אל תשלח לטוויטר (!טוויטר)</option>
                <option value="!קבוצות">אל תשלח לקבוצות (!קבוצות)</option>
              </select>
            </div>
          </div>

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

          {uploadMode === "tiktok" && (
            <div className="space-y-4">
              <div className="bg-[var(--color-punkt-surface-hover)] p-4 rounded-xl border border-[var(--color-punkt-border)]">
                <div className="flex items-center justify-between mb-3 border-b border-[var(--color-punkt-border)] pb-2">
                  <h4 className="text-sm font-bold flex items-center gap-2 text-white">
                    <Inbox size={16} className="text-pink-400" /> מאגר טיקטוק
                  </h4>
                </div>
                <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                  {pendingLinks.length === 0 ? (
                    <div className="text-center text-[var(--color-punkt-muted)] text-xs">
                      אין קישורים.
                    </div>
                  ) : (
                    pendingLinks.map((link) => (
                      <div
                        key={link.id}
                        onClick={() => handleSelectPoolLink(link)}
                        className={`p-2 rounded-lg border text-xs cursor-pointer ${selectedPoolLinkId === link.id ? "border-[var(--color-punkt-green)] bg-[var(--color-punkt-green)]/10" : "border-gray-600"}`}
                      >
                        <div className="truncate" dir="ltr">
                          {link.url}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="לינק טיקטוק..."
                  className="flex-1 bg-[var(--color-punkt-bg)] border border-[var(--color-punkt-border)] rounded-xl py-3 px-4 text-white focus:outline-none text-left"
                  dir={tiktokUrl ? "ltr" : "rtl"}
                />
                <button
                  type="button"
                  onClick={handleFetchTiktok}
                  disabled={isFetchingTiktok || !tiktokUrl}
                  className="bg-[var(--color-punkt-green)] text-black font-bold px-4 rounded-xl hover:opacity-90"
                >
                  {isFetchingTiktok ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "משוך"
                  )}
                </button>
              </div>
            </div>
          )}

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

          {uploadMode === "manual" && (
            <div className="space-y-3">
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
                  if (e.dataTransfer.files?.[0])
                    setSelectedFile(e.dataTransfer.files[0]);
                }}
                className={`relative flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl py-8 transition-all ${isDraggingFile ? "border-[var(--color-punkt-green)] bg-[var(--color-punkt-green)]/10" : "border-gray-600 bg-[#111]"}`}
              >
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                  }}
                />
                <Paperclip size={24} className="text-gray-400" />
                <span className="text-sm text-gray-400 font-bold pointer-events-none mt-2">
                  {selectedFile ? selectedFile.name : "לחץ או גרור קובץ"}
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

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">
              טקסט
            </label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={5}
              className="w-full bg-[#111] border border-gray-600 rounded-xl py-3 px-4 text-white"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-black font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />{" "}
                  {progressMsg || "מעבד..."}
                </>
              ) : (
                <>
                  <Send /> תזמן למערכת
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

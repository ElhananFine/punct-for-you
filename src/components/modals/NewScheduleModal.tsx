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
} from "lucide-react";
import { TikTokPoolLink } from "../../types";
import { format, parseISO } from "date-fns";

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

  // Manual Mode (AI Image) states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);

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
    /* הלוגיקה שלך מהקובץ הקודם */
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
    /* כנ"ל */
  };
  const handleGenerateWeather = async () => {
    /* כנ"ל */
  };

  const handleCreateSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const selectedGroupId = formData.get("groupId") as string;
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
        {/* ... כאן נמצא כל ה-JSX של הטופס בדיוק כפי שהיה בקובץ הקודם. כדי לחסוך מקום בתשובה העתק לכאן את כל ה-HTML של Modal מהקובץ הקודם ... */}
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
        {/* ... Rest of the form ... */}
      </motion.div>
    </motion.div>
  );
}

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
  bot_confirmed?: boolean; // האם הבוט אישר
  created_at: string; // זמן יצירת ההודעה (כדי לחשב את ה-5 דקות)
}

export interface TikTokPoolLink {
  id: string;
  url: string;
  notes: string;
  status: string;
  created_at: string;
}

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
}

export interface TikTokPoolLink {
  id: string;
  url: string;
  notes: string;
  status: string;
  created_at: string;
}

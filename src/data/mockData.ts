import { addDays, setHours, setMinutes, startOfWeek } from 'date-fns';

export type MediaType = 'text' | 'image' | 'video';

export interface ScheduledMessage {
  id: string;
  scheduledAt: Date;
  content: string;
  mediaType: MediaType;
  mediaUrl?: string;
  status: 'scheduled' | 'sent' | 'canceled';
  category?: string;
}

const today = new Date();
const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 });

export const mockMessages: ScheduledMessage[] = [
  {
    id: '1',
    scheduledAt: setMinutes(setHours(addDays(startOfCurrentWeek, 1), 20), 0),
    content: '✨ *בואי להיות מאמנת אישית מקצועית*\nהצטרפי לתכנית הכשרה המשלבת *כלים מעשיים מ־CBT ו־NLP*',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80',
    status: 'sent',
    category: 'לימודים והכשרה',
  },
  {
    id: '2',
    scheduledAt: setMinutes(setHours(addDays(startOfCurrentWeek, 1), 20), 30),
    content: '*שווה שמיעה*\n👂👂👂',
    mediaType: 'video',
    status: 'sent',
    category: 'מוזיקה',
  },
  {
    id: '3',
    scheduledAt: setMinutes(setHours(addDays(startOfCurrentWeek, 1), 19), 10),
    content: '*את בוחרת מה לקחת❗❗*',
    mediaType: 'video',
    status: 'sent',
    category: 'השראה',
  },
  {
    id: '4',
    scheduledAt: setMinutes(setHours(addDays(startOfCurrentWeek, 1), 21), 45),
    content: '*שווה שמיעה*\n👂👂👂',
    mediaType: 'video',
    status: 'sent',
    category: 'מוזיקה',
  },
  {
    id: '5',
    scheduledAt: setMinutes(setHours(addDays(startOfCurrentWeek, 1), 23), 0),
    content: '*תחזית ארצית ליום ראשון*\nמעונן חלקית עד בהיר⛅\nתחול עלייה קלה בטמפרטורות🔝',
    mediaType: 'text',
    status: 'sent',
    category: 'תחזית',
  },
  {
    id: '6',
    scheduledAt: setMinutes(setHours(addDays(startOfCurrentWeek, 2), 9), 0),
    content: '*בוקר טוב ומבורך, ושבוע מלא עשייה ושפע*☀️🫶🏼✨',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1506744626753-1fa44df31c7f?w=400&q=80',
    status: 'scheduled',
    category: 'בוקר טוב',
  },
  {
    id: '7',
    scheduledAt: setMinutes(setHours(addDays(startOfCurrentWeek, 2), 11), 25),
    content: '*טיפים שחייב לדעת* 🪰🐛🐜',
    mediaType: 'video',
    status: 'scheduled',
    category: 'טיפים',
  },
  {
    id: '8',
    scheduledAt: setMinutes(setHours(addDays(startOfCurrentWeek, 2), 13), 40),
    content: '*שמרו את המתכון כי הוא הולך לגרום לכם להגיד ואוווו*🍝🧀\n*מתכון לפסטה ברוטב מושחת במיוחד*✨',
    mediaType: 'video',
    status: 'scheduled',
    category: 'מתכונים',
  },
  {
    id: '9',
    scheduledAt: setMinutes(setHours(addDays(startOfCurrentWeek, 2), 17), 35),
    content: '*זה לא רק סיכת סבתא! 😉*💇‍♀️',
    mediaType: 'video',
    status: 'scheduled',
    category: 'טיפוח',
  },
  {
    id: '10',
    scheduledAt: setMinutes(setHours(addDays(startOfCurrentWeek, 2), 23), 20),
    content: '*קורע לב* 😭💔\nאחרי 5 ימים ההלוויה קורעת לב שאי אפשר לעמוד בה',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?w=400&q=80',
    status: 'scheduled',
    category: 'צדקה',
  },
  {
    id: '11',
    scheduledAt: setMinutes(setHours(addDays(startOfCurrentWeek, 3), 9), 0),
    content: '*שיהיה יום מלא ברגעים קטנים של אושר*\n*בוקר טוב*🫶🏼',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=400&q=80',
    status: 'scheduled',
    category: 'בוקר טוב',
  },
  {
    id: '12',
    scheduledAt: setMinutes(setHours(addDays(startOfCurrentWeek, 3), 14), 10),
    content: '*פנקייק הזה כל כך אוורירי, שנראה לי שהוא עומד לעוף מהצלחת* 🥞🥞🥞',
    mediaType: 'video',
    status: 'scheduled',
    category: 'מתכונים',
  },
  {
    id: '13',
    scheduledAt: setMinutes(setHours(addDays(startOfCurrentWeek, 3), 20), 30),
    content: '*נמאס לכם להילחם עם הסילאן שנשאר על הכף? תראו את הקסם הזה...*🪄',
    mediaType: 'video',
    status: 'scheduled',
    category: 'טיפים',
  },
];

import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence } from "motion/react";
import { isBefore, parseISO } from "date-fns";

// Types
import { ScheduledMessage, TikTokPoolLink } from "./types";

// Layout & UI
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import {
  DashboardStats,
  Filters,
} from "./components/dashboard/DashboardControls";
import { AIChat } from "./components/AIChat";

// Views
import { GanttChart } from "./components/GanttChart";
import { TikTokPoolView } from "./components/views/TikTokPoolView";
import { NewScheduleModal } from "./components/modals/NewScheduleModal";

// ==========================================
// Main App Component
// ==========================================
export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeView, setActiveView] = useState<
    "dashboard" | "gantt" | "tiktok-pool" | "settings"
  >("dashboard");

  // Data
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "sent" | "scheduled"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isNewScheduleOpen, setIsNewScheduleOpen] = useState(false);
  const [initialTikTokLink, setInitialTikTokLink] =
    useState<TikTokPoolLink | null>(null);

  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        "https://three-of-day-bp4b.onrender.com/api/schedules",
      );
      setMessages((await response.json()) || []);
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = useMemo(() => {
    let filtered = messages;
    if (selectedGroup !== "all")
      filtered = filtered.filter(
        (msg) => (msg.group_id || "punkt_foryou") === selectedGroup,
      );
    const now = new Date();
    if (statusFilter === "sent")
      filtered = filtered.filter(
        (msg) =>
          msg.status === "sent" || isBefore(parseISO(msg.scheduled_at), now),
      );
    else if (statusFilter === "scheduled")
      filtered = filtered.filter(
        (msg) =>
          msg.status !== "sent" && !isBefore(parseISO(msg.scheduled_at), now),
      );
    if (searchQuery.trim())
      filtered = filtered.filter((msg) =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return filtered;
  }, [messages, selectedGroup, statusFilter, searchQuery]);

  const openNewScheduleWithLink = (link: TikTokPoolLink) => {
    setInitialTikTokLink(link);
    setIsNewScheduleOpen(true);
  };

  const closeNewSchedule = () => {
    setIsNewScheduleOpen(false);
    setTimeout(() => setInitialTikTokLink(null), 500); // נקה אחרי סגירת האנימציה
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-punkt-bg)] text-[var(--color-punkt-text)]">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeView={activeView}
        setActiveView={setActiveView}
        openChat={() => setIsChatOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 relative w-full">
        <Header
          activeView={activeView}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          openNewSchedule={() => setIsNewScheduleOpen(true)}
        />

        {(activeView === "dashboard" || activeView === "gantt") && (
          <div className="flex flex-col h-full overflow-hidden">
            {activeView === "dashboard" && (
              <DashboardStats messages={messages} isLoading={isLoading} />
            )}
            <Filters
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              selectedGroup={selectedGroup}
              setSelectedGroup={setSelectedGroup}
            />
            <main className="flex-1 overflow-hidden relative bg-[var(--color-punkt-bg)] gantt-grid z-0">
              <GanttChart messages={filteredMessages} isLoading={isLoading} />
            </main>
          </div>
        )}

        {activeView === "tiktok-pool" && (
          <TikTokPoolView onScheduleLink={openNewScheduleWithLink} />
        )}

        {activeView === "settings" && (
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[var(--color-punkt-bg)]">
            <div className="max-w-2xl mx-auto bg-[var(--color-punkt-surface)] p-6 rounded-2xl">
              הגדרות...
            </div>
          </main>
        )}
      </div>

      <AnimatePresence>
        {isChatOpen && <AIChat onClose={() => setIsChatOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {isNewScheduleOpen && (
          <NewScheduleModal
            onClose={closeNewSchedule}
            onSuccess={fetchMessages}
            initialTikTokLink={initialTikTokLink}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

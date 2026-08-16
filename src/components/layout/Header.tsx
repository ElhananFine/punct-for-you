import React from "react";
import { Menu, Search, Plus } from "lucide-react";

interface HeaderProps {
  activeView: string;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (v: boolean) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  openNewSchedule: () => void;
}

export function Header({
  activeView,
  isSidebarOpen,
  setIsSidebarOpen,
  searchQuery,
  setSearchQuery,
  openNewSchedule,
}: HeaderProps) {
  const viewTitles: any = {
    dashboard: "דשבורד ראשי",
    gantt: "לוח שידורים",
    "tiktok-pool": "מאגר קישורים לטיקטוק",
    settings: "הגדרות מערכת",
  };

  return (
    <header className="h-16 lg:h-20 border-b border-[var(--color-punkt-border)] glass-panel flex items-center justify-between px-4 lg:px-6 z-30 sticky top-0">
      <div className="flex items-center gap-3 lg:gap-4">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -mr-2 lg:mr-0 text-[var(--color-punkt-muted)] hover:text-white rounded-lg hover:bg-[var(--color-punkt-surface)] transition-colors"
          >
            <Menu size={24} />
          </button>
        )}
        <h2 className="text-xl lg:text-2xl font-display font-bold truncate">
          {viewTitles[activeView]}
        </h2>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <div className="relative hidden md:block">
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-punkt-muted)]"
            size={18}
          />
          <input
            type="text"
            placeholder="חיפוש קמפיין..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[var(--color-punkt-surface)] border border-[var(--color-punkt-border)] rounded-full py-2 pr-10 pl-4 text-sm focus:outline-none focus:border-[var(--color-punkt-green)] transition-colors w-64"
          />
        </div>
        <button
          onClick={openNewSchedule}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--color-punkt-green)] to-emerald-500 text-black w-10 h-10 lg:w-auto lg:px-4 lg:py-2 rounded-full transition-all hover:scale-105 cursor-pointer relative z-50 shadow-lg"
        >
          <Plus size={18} />
          <span className="hidden lg:block text-sm font-bold">תזמון חדש</span>
        </button>
      </div>
    </header>
  );
}

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Calendar,
  Settings,
  MessageSquare,
  Inbox,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  activeView: string;
  setActiveView: (v: any) => void;
  openChat: () => void;
}

export function Sidebar({
  isOpen,
  setIsOpen,
  activeView,
  setActiveView,
  openChat,
}: SidebarProps) {
  const handleNavClick = (view: string) => {
    setActiveView(view);
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: 280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 280, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed lg:relative right-0 top-0 bottom-0 w-[280px] max-w-[80vw] flex-shrink-0 border-l border-[var(--color-punkt-border)] bg-[var(--color-punkt-surface)] z-50 flex flex-col shadow-2xl lg:shadow-none"
          >
            <div className="p-4 lg:p-6 flex items-center justify-between border-b border-[var(--color-punkt-border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-punkt-green)] flex items-center justify-center text-[var(--color-punkt-bg)] font-bold text-xl neon-glow">
                  P
                </div>
                <div>
                  <h1 className="font-display font-bold text-xl tracking-tight leading-none">
                    PUNCT
                  </h1>
                  <span className="text-xs text-[var(--color-punkt-green)] font-bold tracking-widest uppercase">
                    Media
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden p-2 text-[var(--color-punkt-muted)] hover:text-white bg-[var(--color-punkt-bg)] rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <div className="text-xs font-bold text-[var(--color-punkt-muted)] mb-4 mt-2 px-4 uppercase tracking-widest">
                ניהול קמפיינים
              </div>
              <NavItem
                icon={<LayoutDashboard size={20} />}
                label="דשבורד ראשי"
                active={activeView === "dashboard"}
                onClick={() => handleNavClick("dashboard")}
              />
              <NavItem
                icon={<Calendar size={20} />}
                label="לוח שידורים"
                active={activeView === "gantt"}
                onClick={() => handleNavClick("gantt")}
              />
              <NavItem
                icon={<Inbox size={20} />}
                label="מאגר טיקטוק"
                active={activeView === "tiktok-pool"}
                onClick={() => handleNavClick("tiktok-pool")}
              />

              <div className="text-xs font-bold text-[var(--color-punkt-muted)] mb-4 mt-8 px-4 uppercase tracking-widest">
                מערכת
              </div>
              <NavItem
                icon={<Settings size={20} />}
                label="הגדרות"
                active={activeView === "settings"}
                onClick={() => handleNavClick("settings")}
              />
            </nav>

            <div className="p-4 lg:p-6 border-t border-[var(--color-punkt-border)] pb-8 lg:pb-6">
              <button
                onClick={() => {
                  openChat();
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-[var(--color-punkt-green)] to-emerald-400 text-[var(--color-punkt-bg)] rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity neon-glow"
              >
                <MessageSquare size={18} />
                <span>PUNCT AI</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function NavItem({ icon, label, active = false, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? "bg-[var(--color-punkt-surface-hover)] text-[var(--color-punkt-green)] border border-[var(--color-punkt-border)] shadow-sm" : "text-[var(--color-punkt-muted)] hover:text-white hover:bg-[var(--color-punkt-surface)]"}`}
    >
      {icon}
      <span className="font-bold text-sm">{label}</span>
    </button>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useRole } from "@/context/RoleContext";
import { getNavigationForRole } from "@/lib/navigation";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { role, roleLabel } = useRole();
  const navigation = getNavigationForRole(role);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [open]);

  const isLeaderAreaActive = pathname === "/leader" || pathname.startsWith("/leader/");
  const isAdminAreaActive = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: -340 }}
            animate={{ x: 0 }}
            exit={{ x: -340 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 top-0 z-50 flex h-screen max-h-screen w-[min(20rem,calc(100vw-1rem))] flex-col overflow-hidden border-r border-white/10 bg-white/5 backdrop-blur-lg"
          >
            <div className="flex shrink-0 items-center justify-between px-5 py-5 sm:px-7 sm:py-7">
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">MGB Connect</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 bg-white/5 p-2 transition hover:bg-white/10"
                aria-label="Sidebar schließen"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              <nav className="h-full overflow-y-auto overflow-x-hidden overscroll-contain px-2 pb-5 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:px-3">
                <div className="flex flex-col gap-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    const isLeaderParent = item.href === "/leader" && isLeaderAreaActive;
                    const isAdminParent = item.href === "/admin" && isAdminAreaActive;
                    const showActiveIndicator = active && !isLeaderParent && !isAdminParent;
                    const highlightParent = isLeaderParent || isAdminParent;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`group relative flex shrink-0 items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-150 sm:gap-4 ${
                          showActiveIndicator
                            ? "bg-white/10 shadow-[0_0_14px_rgba(255,180,40,0.10)]"
                            : "hover:bg-white/10 hover:shadow-[0_0_14px_rgba(255,180,40,0.08)]"
                        }`}
                      >
                        {showActiveIndicator && (
                          <motion.div
                            layoutId="sidebar-active-indicator"
                            className="absolute bottom-2 left-1.5 top-2 w-1 rounded-full bg-yellow-300"
                          />
                        )}
                        <div className="ml-2 shrink-0">
                          <Icon
                            size={21}
                            strokeWidth={1.8}
                            className={
                              showActiveIndicator || highlightParent
                                ? "text-yellow-300"
                                : "text-white/80 transition-colors duration-150 group-hover:text-yellow-300"
                            }
                          />
                        </div>
                        <span className={showActiveIndicator || highlightParent ? "font-medium text-yellow-300" : "font-medium text-white/90 transition-colors duration-150"}>
                          {item.title}
                        </span>
                      </Link>
                    );
                  })}
                  <div aria-hidden="true" className="h-5 shrink-0" />
                </div>
              </nav>
            </div>

            <div className="shrink-0 px-3 pb-4 pt-2 sm:px-4 sm:pb-5 sm:pt-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
                <p className="text-sm text-white/60">Rolle</p>
                <h3 className="mt-1 font-semibold text-white">{roleLabel}</h3>
                <p className="mt-1 text-xs text-white/30">{role}</p>
              </div>
              <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-3 sm:mt-3 sm:p-4">
                <p className="text-sm text-white/60">Version</p>
                <h3 className="mt-1 font-semibold text-white">MGB Connect Alpha</h3>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

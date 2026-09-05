"use client";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import { useRole } from "@/context/RoleContext";
import { getNavigationForRole } from "@/lib/navigation";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({
  open,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  const {
    role,
    roleLabel,
    setRole,
  } = useRole();

  const [roleSelectorOpen, setRoleSelectorOpen] =
    useState(false);

  const navigation =
    getNavigationForRole(role);

  /*
   * ============================================================
   * BODY-SCROLL SPERREN
   * ============================================================
   *
   * Wenn die Sidebar geöffnet ist, darf die Seite dahinter
   * nicht mehr scrollen.
   *
   * Der einzige Scrollbereich bleibt dadurch die Navigation
   * innerhalb der Sidebar.
   */

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    const previousTouchAction =
      document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.body.style.touchAction =
        previousTouchAction;
    };
  }, [open]);

  /*
   * ============================================================
   * BEREICHSERKENNUNG
   * ============================================================
   */

  const isLeaderAreaActive =
    pathname === "/leader" ||
    pathname.startsWith("/leader/");

  const isAdminAreaActive =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  /*
   * ============================================================
   * ENTWICKLUNGS-ROLLEN
   * ============================================================
   *
   * Dieser Block ist bewusst lokal gehalten und kann später
   * problemlos entfernt werden.
   */

  const developmentRoles = [
    {
      value: "messdiener",
      label: "Messdiener",
    },
    {
      value: "leiter",
      label: "Leiter",
    },
    {
      value: "planschreiber",
      label: "Planschreiber",
    },
    {
      value: "admin",
      label: "Administrator",
    },
  ] as const;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ==================================================
              BACKDROP
          ================================================== */}

          <motion.div
            className="
              fixed
              inset-0
              z-40
              bg-black/40
              backdrop-blur-sm
            "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* ==================================================
              SIDEBAR
          ================================================== */}

          <motion.aside
            initial={{ x: -340 }}
            animate={{ x: 0 }}
            exit={{ x: -340 }}
            transition={{
              duration: 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              fixed
              left-0
              top-0
              z-50

              flex
              h-screen
              max-h-screen
              w-80
              flex-col

              overflow-hidden

              border-r
              border-white/10

              bg-white/5
              backdrop-blur-lg
            "
          >
            {/* ==================================================
                HEADER
            ================================================== */}

            <div
              className="
                flex
                shrink-0
                items-center
                justify-between
                px-7
                py-7
              "
            >
              <h2
                className="
                  text-2xl
                  font-bold
                  tracking-tight
                  text-white
                "
              >
                MGB Connect
              </h2>

              <button
                type="button"
                onClick={onClose}
                className="
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  p-2

                  transition

                  hover:bg-white/10
                "
                aria-label="Sidebar schließen"
              >
                <CloseIcon />
              </button>
            </div>

            {/* ==================================================
                NAVIGATION

                Dieser Bereich ist der EINZIGE Scrollbereich.

                flex-1:
                → nimmt den gesamten verfügbaren Platz ein

                min-h-0:
                → verhindert, dass der Inhalt den Container
                  größer macht als den Bildschirm

                overflow-y-auto:
                → Navigation kann unabhängig scrollen
            ================================================== */}

            <div
              className="
                min-h-0
                flex-1
                overflow-hidden
              "
            >
              <nav
                className="
                  h-full

                  overflow-y-auto
                  overflow-x-hidden

                  overscroll-contain

                  px-3
                  pb-6
                  pt-1

                  [scrollbar-width:none]
                  [-ms-overflow-style:none]

                  [&::-webkit-scrollbar]:hidden
                "
              >
                <div className="flex flex-col gap-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;

                    const active =
                      pathname === item.href;

                    /*
                     * LEITERBEREICH
                     */

                    const isLeaderParent =
                      item.href === "/leader" &&
                      isLeaderAreaActive;

                    /*
                     * ADMINBEREICH
                     */

                    const isAdminParent =
                      item.href === "/admin" &&
                      isAdminAreaActive;

                    /*
                     * AKTIVER STRICH
                     */

                    const showActiveIndicator =
                      active &&
                      !isLeaderParent &&
                      !isAdminParent;

                    /*
                     * ELTERN-HIGHLIGHT
                     */

                    const highlightParent =
                      isLeaderParent ||
                      isAdminParent;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`
                          group
                          relative

                          flex
                          shrink-0
                          items-center
                          gap-4

                          rounded-2xl

                          px-3
                          py-3

                          text-left

                          transition-all
                          duration-150

                          ${
                            showActiveIndicator
                              ? `
                                bg-white/10
                                shadow-[0_0_14px_rgba(255,180,40,0.10)]
                              `
                              : `
                                hover:bg-white/10
                                hover:shadow-[0_0_14px_rgba(255,180,40,0.08)]
                              `
                          }
                        `}
                      >
                        {/* ==================================================
                            ACTIVE INDICATOR
                        ================================================== */}

                        {showActiveIndicator && (
                          <motion.div
                            layoutId="sidebar-active-indicator"
                            className="
                              absolute
                              left-1.5
                              top-2
                              bottom-2

                              w-1

                              rounded-full

                              bg-yellow-300
                            "
                          />
                        )}

                        {/* ==================================================
                            ICON
                        ================================================== */}

                        <div className="ml-2 shrink-0">
                          <Icon
                            size={22}
                            strokeWidth={1.8}
                            className={
                              showActiveIndicator ||
                              highlightParent
                                ? "text-yellow-300"
                                : `
                                  text-white/80
                                  transition-colors
                                  duration-150
                                  group-hover:text-yellow-300
                                `
                            }
                          />
                        </div>

                        {/* ==================================================
                            TITLE
                        ================================================== */}

                        <span
                          className={
                            showActiveIndicator ||
                            highlightParent
                              ? "font-medium text-yellow-300"
                              : `
                                font-medium
                                text-white/90
                                transition-colors
                                duration-150
                              `
                          }
                        >
                          {item.title}
                        </span>
                      </Link>
                    );
                  })}

                  {/* ==================================================
                      EXTRA SPACE
                  ================================================== */}

                  <div
                    aria-hidden="true"
                    className="h-5 shrink-0"
                  />
                </div>
              </nav>
            </div>

            {/* ==================================================
                FESTER UNTERER BEREICH

                Dieser Bereich gehört NICHT zum Scrollbereich.

                Rolle + Version bleiben unten.
            ================================================== */}

            <div
              className="
                shrink-0
                px-4
                pb-5
                pt-3
              "
            >
              {/* ==================================================
                  ROLLE
              ================================================== */}

              <button
                type="button"
                onClick={() =>
                  setRoleSelectorOpen(
                    (current) => !current
                  )
                }
                className="
                  w-full

                  rounded-2xl

                  border
                  border-white/10

                  bg-white/5

                  p-4

                  text-left

                  transition

                  hover:border-white/15
                  hover:bg-white/10
                "
              >
                <p className="text-sm text-white/60">
                  Rolle
                </p>

                <h3 className="mt-1 font-semibold text-white">
                  {roleLabel}
                </h3>

                <p className="mt-1 text-xs text-white/30">
                  {role}
                </p>
              </button>

              {/* ==================================================
                  ENTWICKLUNGS-ROLLENWECHSLER
              ================================================== */}

              <AnimatePresence>
                {roleSelectorOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      height: 0,
                      y: 5,
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                      y: 5,
                    }}
                    transition={{
                      duration: 0.18,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="overflow-hidden"
                  >
                    <div
                      className="
                        mt-2

                        rounded-2xl

                        border
                        border-amber-400/10

                        bg-white/5

                        p-2
                      "
                    >
                      <p
                        className="
                          px-3
                          pb-2
                          pt-1

                          text-[11px]
                          uppercase
                          tracking-[0.16em]

                          text-white/30
                        "
                      >
                        Entwicklung
                      </p>

                      <div className="space-y-1">
                        {developmentRoles.map(
                          (developmentRole) => {
                            const selected =
                              role ===
                              developmentRole.value;

                            return (
                              <button
                                key={
                                  developmentRole.value
                                }
                                type="button"
                                onClick={() => {
                                  setRole(
                                    developmentRole.value
                                  );

                                  setRoleSelectorOpen(
                                    false
                                  );
                                }}
                                className={`
                                  flex
                                  w-full
                                  items-center
                                  justify-between

                                  rounded-xl

                                  px-3
                                  py-2.5

                                  text-sm

                                  transition

                                  ${
                                    selected
                                      ? `
                                        bg-amber-400/10
                                        text-amber-300
                                      `
                                      : `
                                        text-white/70
                                        hover:bg-white/5
                                        hover:text-white
                                      `
                                  }
                                `}
                              >
                                <span>
                                  {
                                    developmentRole.label
                                  }
                                </span>

                                {selected && (
                                  <span className="text-xs text-amber-300/70">
                                    Aktiv
                                  </span>
                                )}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ==================================================
                  VERSION
              ================================================== */}

              <div
                className="
                  mt-3

                  rounded-2xl

                  border
                  border-white/10

                  bg-white/5

                  p-4
                "
              >
                <p className="text-sm text-white/60">
                  Version
                </p>

                <h3 className="mt-1 font-semibold text-white">
                  MGB Connect Alpha
                </h3>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ===============================================================
   CLOSE ICON
=============================================================== */

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-white"
    >
      <path
        d="M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M6 6L18 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
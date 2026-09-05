"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  } = useRole();

  /*
   * ============================================================
   * NAVIGATION
   * ============================================================
   *
   * Die Sidebar bekommt ihre Einträge vollständig aus
   * lib/navigation.ts.
   *
   * Dadurch entscheidet die Rollen-/Permission-Logik zentral,
   * welche Bereiche sichtbar sind.
   */
  const navigation = getNavigationForRole(role);

  /*
   * ============================================================
   * AKTIVER LEITERBEREICH
   * ============================================================
   *
   * Wenn wir uns auf /leader oder einer Unterseite befinden,
   * wird der Eintrag "Leiterbereich" gelb hervorgehoben.
   *
   * Wichtig:
   *
   * Der Leiterbereich selbst bekommt KEINEN gelben Strich,
   * wenn eine Unterseite geöffnet ist.
   *
   * Der gelbe Strich gehört ausschließlich zum tatsächlich
   * geöffneten Unterpunkt.
   */
  const isLeaderAreaActive =
    pathname === "/leader" ||
    pathname.startsWith("/leader/");

  /*
   * ============================================================
   * AKTIVER ADMINBEREICH
   * ============================================================
   */
  const isAdminAreaActive =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

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
              w-80
              flex-col
              border-r
              border-white/10
              bg-white/5
              backdrop-blur-lg
            "
          >
            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex items-center justify-between p-7">
              <h2 className="text-2xl font-bold text-white">
                MGB Connect
              </h2>

              <button
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
                GESAMTE NAVIGATION
            ================================================== */}

            <nav className="mt-3 flex flex-col gap-2 px-4">
              {navigation.map((item) => {
                /*
                 * Lucide-Icon aus dem NavigationItem.
                 */
                const Icon = item.icon;

                /*
                 * Direkter aktiver Menüpunkt.
                 *
                 * Beispiel:
                 *
                 * pathname = /leader/services
                 *
                 * item.href = /leader/services
                 *
                 * => active = true
                 */
                const active =
                  pathname === item.href;

                /*
                 * ==================================================
                   BEREICHSERKENNUNG
                   ==================================================
                 */

                const isLeaderItem =
                  item.href === "/leader" ||
                  item.href.startsWith("/leader/");

                const isAdminItem =
                  item.href === "/admin" ||
                  item.href.startsWith("/admin/");

                /*
                 * ==================================================
                   ELTERNBEREICH
                   ==================================================
                 *
                 * Der reine /leader-Eintrag wird gelb, sobald
                 * irgendeine Leiter-Unterseite geöffnet ist.
                 *
                 * Er bekommt dabei KEINEN gelben Strich.
                 */
                const isLeaderParent =
                  item.href === "/leader" &&
                  isLeaderAreaActive;

                /*
                 * Gleiches Prinzip für Administration.
                 */
                const isAdminParent =
                  item.href === "/admin" &&
                  isAdminAreaActive;

                /*
                 * ==================================================
                   AKTIVER STRICH
                   ==================================================
                 *
                 * Der Strich erscheint:
                 *
                 * - beim normalen aktiven Menüpunkt
                 * - bei einem tatsächlich geöffneten Unterpunkt
                 *
                 * Aber NICHT beim übergeordneten /leader- oder
                 * /admin-Eintrag.
                 */
                const showActiveIndicator =
                  active &&
                  !isLeaderParent &&
                  !isAdminParent;

                /*
                 * ==================================================
                   GELBE ELTERN-HERVORHEBUNG
                   ==================================================
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
                      items-center
                      gap-4
                      rounded-2xl
                      px-4
                      py-3
                      text-left
                      transition-all
                      duration-150

                      ${
                        showActiveIndicator
                          ? "bg-white/10 shadow-[0_0_14px_rgba(255,180,40,0.10)]"
                          : "hover:bg-white/10 hover:shadow-[0_0_14px_rgba(255,180,40,0.10)]"
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
                          left-2
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

                    <div className="ml-2">
                      <Icon
                        size={22}
                        className={
                          showActiveIndicator ||
                          highlightParent
                            ? "text-yellow-300"
                            : "text-white/80 transition group-hover:text-yellow-300"
                        }
                      />
                    </div>

                    {/* ==================================================
                        TITEL
                    ================================================== */}

                    <span
                      className={
                        showActiveIndicator ||
                        highlightParent
                          ? "font-medium text-yellow-300"
                          : "font-medium text-white/90"
                      }
                    >
                      {item.title}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* ==================================================
                UNTERER BEREICH
            ================================================== */}

            <div className="mt-auto p-5">

              {/* ==================================================
                  ROLLE
              ================================================== */}

              <div
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/5
                  p-4
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
              </div>

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
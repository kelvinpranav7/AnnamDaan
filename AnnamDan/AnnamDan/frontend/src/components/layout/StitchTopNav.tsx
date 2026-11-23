import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { formatRelative } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from "firebase/firestore";

interface NavItem {
  label: string;
  to: string;
  matchPaths?: string[];
}

export function StitchTopNav() {
  const nav = useNavigate();
  const loc = useLocation();
  const { user, signOut } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { items: notifications, setItems, markAll: localMarkAll } = useNotificationStore();
  const unread = notifications.filter((i) => !i.read).length;

  useEffect(() => {
    if (!user || !db) return;
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setItems(docs);
    });
    return () => unsub();
  }, [user, setItems]);

  async function markAll() {
    localMarkAll();
    if (!db || !user) return;
    try {
      const unreadNotifs = notifications.filter(n => !n.read);
      for (const n of unreadNotifs) {
        updateDoc(doc(db, "notifications", n.id), { read: true }).catch(() => {});
      }
    } catch (e) {}
  }

  const initials = (user?.name || user?.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const items: NavItem[] = [
    { label: "Our Mission", to: "/about", matchPaths: ["/about"] },
    {
      label: "How it Works",
      to: "/how-it-works",
      matchPaths: ["/how-it-works"],
    },
  ];

  if (user) {
    items.push(
      { label: "Food", to: "/app/food", matchPaths: ["/app/food"] },
      { label: "Dashboard", to: `/app/${user.role}`, matchPaths: [`/app/${user.role}`] }
    );
  }

  const isActive = (it: NavItem) => {
    const dashboardRoutes = ["/app/donor", "/app/volunteer", "/app/ngo", "/app/admin", "/app/food"];
    if (dashboardRoutes.includes(it.to)) {
      return loc.pathname === it.to;
    }
    return it.matchPaths?.some((p) => loc.pathname.startsWith(p)) ?? false;
  };

  // Close dropdown on outside click / Esc
  useEffect(() => {
    if (!menuOpen && !showNotif) return;
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (menuOpen && !menuRef.current?.contains(target)) {
        setMenuOpen(false);
      }
      if (showNotif && !notifRef.current?.contains(target)) {
        setShowNotif(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setShowNotif(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, showNotif]);

  // Close on route change
  useEffect(() => {
    setMenuOpen(false);
    setMobileMenuOpen(false);
  }, [loc.pathname]);

  function handleSignOut() {
    setMenuOpen(false);
    signOut();
    nav("/");
  }

  const dashboardPath = user ? `/app/${user.role}` : "/";

  return (
    <header className="bg-surface dark:bg-inverse-surface shadow-sm dark:shadow-none sticky top-0 z-50">
      <nav className="flex justify-between items-center px-gutter py-md max-w-container-max mx-auto">
        <Link
          to="/"
          className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed"
        >
          Annam Daan
        </Link>

        <div className="hidden md:flex items-center gap-lg">
          {items.map((it) =>
            isActive(it) ? (
              <NavLink
                key={it.label}
                to={it.to}
                className="font-body-md text-body-md text-primary font-bold border-b-2 border-primary pb-1"
              >
                {it.label}
              </NavLink>
            ) : (
              <NavLink
                key={it.label}
                to={it.to}
                className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors"
              >
                {it.label}
              </NavLink>
            )
          )}
        </div>

        <div className="flex items-center gap-md">
          {user ? (
            <>
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => {
                    setShowNotif((s) => !s);
                    if (!showNotif) setTimeout(markAll, 1200);
                  }}
                  className="relative w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-secondary-container transition-all"
                  aria-label="notifications"
                >
                  <span className="material-symbols-outlined text-[24px]">
                    notifications
                  </span>
                  {unread > 0 && (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-error ring-2 ring-surface" />
                  )}
                </button>

                {showNotif && (
                  <div
                    className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-outline-variant bg-surface-container-lowest shadow-modal overflow-hidden z-50"
                  >
                    <div className="flex items-center justify-between p-md border-b border-outline-variant">
                      <div className="font-body-md text-body-md font-bold text-on-surface">Notifications</div>
                      {unread > 0 && (
                        <span className="bg-error-container text-error px-sm py-xs rounded-full font-label-sm text-label-sm uppercase tracking-wider font-bold">
                          {unread} new
                        </span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant">
                      {notifications.length === 0 ? (
                        <div className="p-xl text-center text-on-surface-variant font-body-sm italic">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className="p-md hover:bg-surface-container-low transition-colors flex items-start gap-sm"
                          >
                            <div
                              className={`h-2.5 w-2.5 mt-1.5 rounded-full shrink-0 ${
                                n.type === "success"
                                  ? "bg-success"
                                  : n.type === "warning"
                                  ? "bg-warning"
                                  : n.type === "danger"
                                  ? "bg-error"
                                  : "bg-primary"
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-body-sm text-body-sm font-semibold text-on-surface">
                                {n.title}
                              </p>
                              <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs leading-normal">
                                {n.body}
                              </p>
                              <p className="font-label-sm text-[10px] uppercase tracking-wider text-muted-foreground mt-xs">
                                {formatRelative(n.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary font-bold hover:ring-2 hover:ring-primary/30 transition-all"
                  title="Account menu"
                >
                  {initials}
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-outline-variant bg-surface-container-lowest shadow-modal overflow-hidden z-50"
                  >
                    <div className="p-md border-b border-outline-variant">
                      <p className="font-body-md text-body-md font-bold text-on-surface truncate">
                        {user.name || "Member"}
                      </p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant truncate">
                        {user.email}
                      </p>
                      <span className="inline-block mt-xs bg-primary-fixed text-primary px-sm py-xs rounded-full font-label-sm text-label-sm uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>
                    <div className="py-xs">
                      <Link
                        to={dashboardPath}
                        className="flex items-center gap-sm px-md py-sm hover:bg-surface-container-low transition-colors font-body-md text-body-md text-on-surface"
                        role="menuitem"
                      >
                        <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                          dashboard
                        </span>
                        My Dashboard
                      </Link>

                      {user.role === "volunteer" && (
                        <>
                          <Link
                            to="/app/volunteer/new"
                            className="flex items-center gap-sm px-md py-sm hover:bg-surface-container-low transition-colors font-body-md text-body-md text-on-surface"
                            role="menuitem"
                          >
                            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                              add_circle
                            </span>
                            Share food
                          </Link>
                          <Link
                            to="/app/volunteer/tracking"
                            className="flex items-center gap-sm px-md py-sm hover:bg-surface-container-low transition-colors font-body-md text-body-md text-on-surface"
                            role="menuitem"
                          >
                            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                              local_shipping
                            </span>
                            Track donations
                          </Link>
                        </>
                      )}
                      <Link
                        to="/impact"
                        className="flex items-center gap-sm px-md py-sm hover:bg-surface-container-low transition-colors font-body-md text-body-md text-on-surface"
                        role="menuitem"
                      >
                        <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                          insights
                        </span>
                        Platform impact
                      </Link>
                    </div>
                    <div className="border-t border-outline-variant py-xs">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left flex items-center gap-sm px-md py-sm hover:bg-error-container transition-colors font-body-md text-body-md text-error"
                        role="menuitem"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          logout
                        </span>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-primary hover:bg-primary-container text-on-primary px-lg py-sm rounded-full font-label-sm text-label-sm transition-all active:scale-[0.98]"
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-secondary-container transition-all"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile navigation links */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-outline-variant bg-surface px-gutter py-md space-y-sm shadow-lg animate-fade-up">
          {items.map((it) => (
            <Link
              key={it.label}
              to={it.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`block font-body-md text-body-md py-sm px-md rounded-xl transition-all ${
                isActive(it)
                  ? "bg-primary-fixed text-primary font-bold"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
              }`}
            >
              {it.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

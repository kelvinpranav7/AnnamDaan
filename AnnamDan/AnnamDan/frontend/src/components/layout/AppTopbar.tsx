import { useState } from "react";
import { Bell, Search, ChevronDown, LogOut, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { formatRelative } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export function AppTopbar({ title }: { title?: string }) {
  const { user, signOut } = useAuthStore();
  const { items, markAll } = useNotificationStore();
  const unread = items.filter((i) => !i.read).length;
  const [showNotif, setShowNotif] = useState(false);
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 border-b border-border/70">
      <div className="flex items-center justify-between px-6 py-3.5 gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground">
            {user?.organization || (user?.role && capitalize(user.role))}
          </div>
          <h1 className="text-lg font-semibold truncate">
            {title || "Welcome back"}
          </h1>
        </div>

        <div className="hidden md:flex items-center gap-2 rounded-full bg-secondary px-4 h-10 w-80">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search donations, NGOs, volunteers…"
            className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground/70"
          />
          <kbd className="text-[10px] text-muted-foreground bg-white px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => {
                setShowNotif((s) => !s);
                if (!showNotif) setTimeout(markAll, 1200);
              }}
              className="relative h-10 w-10 grid place-items-center rounded-full border border-border bg-white hover:bg-secondary"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-white" />
              )}
            </button>
            <AnimatePresence>
              {showNotif && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  className="absolute right-0 mt-2 w-96 rounded-2xl border bg-white shadow-glow overflow-hidden z-50"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="font-semibold text-sm">Notifications</div>
                    <Badge variant="default">{unread} new</Badge>
                  </div>
                  <div className="max-h-96 overflow-auto scrollbar-thin">
                    {items.map((n) => (
                      <div
                        key={n.id}
                        className="px-4 py-3 border-b last:border-b-0 hover:bg-secondary/50"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`h-2 w-2 mt-2 rounded-full ${
                              n.type === "success"
                                ? "bg-success"
                                : n.type === "warning"
                                ? "bg-warning"
                                : n.type === "danger"
                                ? "bg-destructive"
                                : "bg-brand-500"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">
                              {n.title}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {n.body}
                            </div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1.5">
                              {formatRelative(n.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border bg-white pl-1 pr-3 py-1 hover:bg-secondary">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {(user?.name || "U")
                    .split(" ")
                    .map((s) => s[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <div className="text-sm font-medium leading-tight">
                  {user?.name || "Guest"}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {user?.role}
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My account</DropdownMenuLabel>
              <DropdownMenuItem>
                <User className="h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  signOut();
                  nav("/login");
                }}
              >
                <LogOut className="h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

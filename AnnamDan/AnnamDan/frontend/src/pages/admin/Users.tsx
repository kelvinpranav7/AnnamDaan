import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, MoreHorizontal } from "lucide-react";
import { userService } from "@/services/userService";

export default function AdminUsers() {
  const [q, setQ] = useState("");
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => userService.list(),
  });

  const filtered = users.filter((u) =>
    [u.name, u.email, u.role]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Users
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage donors, NGOs, volunteers, and the public.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full bg-secondary px-3 h-10 w-80">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search users…"
              className="bg-transparent text-sm outline-none flex-1"
            />
          </div>
          <Button>Invite user</Button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-sm text-muted-foreground text-center">
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-sm text-muted-foreground text-center">
            {users.length === 0
              ? "No users yet."
              : "No matches for your search."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-muted-foreground">
              <tr className="text-left">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.uid} className="border-t hover:bg-secondary/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {(u.name || u.email || "?")
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{u.name || "—"}</div>
                        <div className="text-xs text-muted-foreground">
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 capitalize">{u.role || "—"}</td>
                  <td className="px-5 py-3">
                    <Badge variant={u.verified ? "success" : "warning"}>
                      {u.verified ? "verified" : "pending"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="p-2 rounded-lg hover:bg-secondary">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

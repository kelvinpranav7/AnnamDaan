import { create } from "zustand";

export type NotificationType = "info" | "success" | "warning" | "danger";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  createdAt: string;
  read: boolean;
}

interface State {
  items: AppNotification[];
  push: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  setItems: (items: AppNotification[]) => void;
  markAll: () => void;
  remove: (id: string) => void;
}

export const useNotificationStore = create<State>((set) => ({
  items: [],
  push: (n) =>
    set((s) => ({
      items: [
        {
          ...n,
          id: Math.random().toString(36).slice(2),
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...s.items,
      ],
    })),
  setItems: (items) => set({ items }),
  markAll: () =>
    set((s) => ({ items: s.items.map((i) => ({ ...i, read: true })) })),
  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
}));

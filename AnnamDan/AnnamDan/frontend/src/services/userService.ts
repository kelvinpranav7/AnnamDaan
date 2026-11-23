import { api } from "@/api/client";

export interface AdminUser {
  uid: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  verified?: boolean;
  createdAt?: string;
}

export const userService = {
  async list(): Promise<AdminUser[]> {
    const { data } = await api.get<AdminUser[]>("/users");
    return data;
  },
};

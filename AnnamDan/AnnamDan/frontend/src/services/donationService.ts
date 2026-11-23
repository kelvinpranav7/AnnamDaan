import type { Donation } from "@/types";
import { api } from "@/api/client";

export const donationService = {
  async get(id: string): Promise<Donation> {
    const { data } = await api.get<Donation>(`/donations/${id}`);
    return data;
  },
  async list(): Promise<Donation[]> {
    const { data } = await api.get<Donation[]>("/donations");
    return data;
  },
  async listPublic(): Promise<Donation[]> {
    const { data } = await api.get<Donation[]>("/donations/public");
    return data;
  },
  async create(
    d: Omit<Donation, "id" | "createdAt" | "status" | "donorId" | "donorName">
  ): Promise<Donation> {
    const { data } = await api.post<Donation>("/donations", d);
    return data;
  },
  async updateStatus(id: string, status: Donation["status"]): Promise<Donation> {
    const { data } = await api.patch<Donation>(`/donations/${id}/status`, {
      status,
    });
    return data;
  },
  async update(
    id: string,
    d: Partial<Omit<Donation, "id" | "createdAt" | "status" | "donorId" | "donorName">>
  ): Promise<Donation> {
    const { data } = await api.patch<Donation>(`/donations/${id}`, d);
    return data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/donations/${id}`);
  },
};

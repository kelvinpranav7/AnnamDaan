import { api } from "@/api/client";
import type { NgoOrg } from "@/types";

export const ngoService = {
  async list(): Promise<NgoOrg[]> {
    const { data } = await api.get<NgoOrg[]>("/ngos");
    return data;
  },
};

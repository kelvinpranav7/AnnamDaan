import { api } from "@/api/client";

export interface QrIssueParams {
  donationId: string;
  ngoId: string;
  lat: number;
  lng: number;
}

export interface QrVerifyResult {
  ok: boolean;
  reason?: string;
  payload?: {
    donationId: string;
    ngoId: string;
    lat: number;
    lng: number;
    issuedAt: number;
    expiresAt: number;
  };
}

export const qrService = {
  async issue(params: QrIssueParams): Promise<{ token: string }> {
    const { data } = await api.post<{ token: string }>("/qr/issue", params);
    return data;
  },
  async verify(
    token: string,
    gps?: { lat: number; lng: number }
  ): Promise<QrVerifyResult> {
    try {
      const { data } = await api.post<QrVerifyResult>("/qr/verify", {
        token,
        gps,
      });
      return data;
    } catch (err: any) {
      return {
        ok: false,
        reason: err?.response?.data?.reason || "Verification failed",
      };
    }
  },
};

import type { Response } from "express";
import { z } from "zod";
import { issueQr, verifyQr } from "../services/qrService.js";
import type { AuthRequest } from "../middleware/auth.js";
import { firestore } from "../config/firebase.js";
import { sendCompletionEmails } from "../services/emailService.js";

const issueSchema = z.object({
  donationId: z.string(),
  ngoId: z.string(),
  lat: z.number(),
  lng: z.number(),
});

export async function issue(req: AuthRequest, res: Response) {
  const d = issueSchema.parse(req.body);
  const token = issueQr(d);
  res.json({ token });
}

const verifySchema = z.object({
  token: z.string(),
});

export async function verify(req: AuthRequest, res: Response) {
  const { token } = verifySchema.parse(req.body);
  const result = verifyQr(token);
  if (!result.ok) return res.status(400).json(result);

  const donationId = (result as any).payload?.donationId;
  if (donationId) {
    const f = firestore();
    if (f) {
      await f.collection("donations").doc(donationId).update({ status: "picked_up" });

      try {
        const donationDoc = await f.collection("donations").doc(donationId).get();
        if (donationDoc.exists) {
          const d = donationDoc.data();
          const donorDoc = await f.collection("users").doc(d?.donorId).get();
          const acceptorId = (result as any).payload?.ngoId || d?.assignedNgoId || d?.assignedVolunteerId;
          
          if (acceptorId) {
            const acceptorDoc = await f.collection("users").doc(acceptorId).get();

            if (donorDoc.exists && acceptorDoc.exists) {
              sendCompletionEmails(
                donorDoc.data(),
                acceptorDoc.data(),
                d
              ).catch(err => console.error("Failed to send completion emails:", err));

              // Create website notifications
              const batch = f.batch();
              const donorNotifRef = f.collection("notifications").doc();
              batch.set(donorNotifRef, {
                userId: d?.donorId,
                title: "Donation Picked Up",
                body: `Your donation of ${d?.foodType} was successfully picked up by ${acceptorDoc.data()?.name || "a volunteer"}.\nContact: ${acceptorDoc.data()?.email} ${acceptorDoc.data()?.phone ? " | " + acceptorDoc.data()?.phone : ""}`,
                type: "success",
                read: false,
                createdAt: new Date().toISOString()
              });

              const acceptorNotifRef = f.collection("notifications").doc();
              batch.set(acceptorNotifRef, {
                userId: acceptorId,
                title: "Pickup Completed",
                body: `You successfully picked up ${d?.foodType} from ${donorDoc.data()?.name || "the donor"}.\nContact: ${donorDoc.data()?.email} ${donorDoc.data()?.phone ? " | " + donorDoc.data()?.phone : ""}`,
                type: "success",
                read: false,
                createdAt: new Date().toISOString()
              });
              
              await batch.commit();
            }
          }
        }
      } catch (err) {
        console.error("Failed to send completion emails/notifications:", err);
      }
    }
  }

  res.json(result);
}

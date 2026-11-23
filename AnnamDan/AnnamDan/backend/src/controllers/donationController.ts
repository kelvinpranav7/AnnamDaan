import type { Response } from "express";
import { v4 as uuid } from "uuid";
import {
  createDonationSchema,
  updateStatusSchema,
} from "../validators/donation.js";
import type { AuthRequest } from "../middleware/auth.js";
import { firestore } from "../config/firebase.js";
import { sendPickupConfirmationEmails, sendCompletionEmails, sendCancellationEmails } from "../services/emailService.js";

const COLLECTION = "donations";

function db() {
  const f = firestore();
  if (!f) throw new Error("Firestore not initialized");
  return f.collection(COLLECTION);
}

async function enrichDonorNames(donations: any[]) {
  const f = firestore();
  if (!f || donations.length === 0) return donations;

  const donorIds = Array.from(new Set(donations.map((d) => d.donorId).filter(Boolean)));
  if (donorIds.length === 0) return donations;

  try {
    const userSnaps = await Promise.all(
      donorIds.map((id) => f.collection("users").doc(id as string).get())
    );
    const userMap: Record<string, string> = {};
    userSnaps.forEach((snap) => {
      if (snap.exists) {
        const u = snap.data();
        if (u?.name) {
          userMap[snap.id] = u.name;
        }
      }
    });

    return donations.map((d) => ({
      ...d,
      donorName: userMap[d.donorId] || d.donorName,
    }));
  } catch {
    return donations;
  }
}

export async function list(req: AuthRequest, res: Response) {
  const role = req.user?.role;
  const uid = req.user?.uid;
  const f = firestore();
  if (!f) return res.json([]);

  if (role === "donor") {
    const snap = await f.collection(COLLECTION).where("donorId", "==", uid).get();
    const items = snap.docs
      .map((d) => d.data())
      .filter((d: any) => d.source !== "community" && d.donorType !== "individual" && d.donorType !== "volunteer");
    return res.json(await enrichDonorNames(items));
  }
  else if (role === "ngo") {
    const snap = await f.collection(COLLECTION).get();
    const items = snap.docs
      .map((d) => d.data())
      .filter(
        (d: any) =>
          (d.status === "live" && d.source !== "community" && d.donorType !== "individual" && d.donorType !== "volunteer") ||
          d.assignedNgoId === uid ||
          d.status === "picked_up"
      );
    return res.json(await enrichDonorNames(items));
  } else if (role === "volunteer") {
    const [donorSnap, assignedSnap] = await Promise.all([
      f.collection(COLLECTION).where("donorId", "==", uid).get(),
      f.collection(COLLECTION).where("assignedVolunteerId", "==", uid).get(),
    ]);
    const itemsMap = new Map<string, any>();
    donorSnap.docs.forEach((doc) => itemsMap.set(doc.id, doc.data()));
    assignedSnap.docs.forEach((doc) => itemsMap.set(doc.id, doc.data()));
    const items = Array.from(itemsMap.values());
    return res.json(await enrichDonorNames(items));
  }

  const snap = await f.collection(COLLECTION).get();
  const items = snap.docs.map((d: any) => d.data());
  res.json(await enrichDonorNames(items));
}



export async function create(req: AuthRequest, res: Response) {
  const data = createDonationSchema.parse(req.body);
  const inferredSource =
    req.user?.role === "volunteer" ? "community" : "institutional";

  const f = firestore();
  let name = (req.user as any)?.name || (req.user?.email ?? "Anonymous");
  if (f && req.user?.uid) {
    const userDoc = await f.collection("users").doc(req.user.uid).get();
    if (userDoc.exists) {
      const u = userDoc.data();
      if (u?.name) {
        name = u.name;
      }
    }
  }

  const donation = {
    ...data,
    // Normalize: trim + lowercase district, trim pincode
    district: data.district.trim(),
    pincode: data.pincode.trim(),
    id: "D-" + uuid().slice(0, 6).toUpperCase(),
    donorId: req.user!.uid,
    donorName: name,
    donorType:
      (data as any).donorType ??
      (req.user?.role === "volunteer" ? "individual" : "hotel"),
    source: (data as any).source ?? inferredSource,
    status: "live" as const,
    createdAt: new Date().toISOString(),
  };
  await db().doc(donation.id).set(donation);
  res.status(201).json(donation);
}

export async function updateStatus(req: AuthRequest, res: Response) {
  const { status } = updateStatusSchema.parse(req.body);
  const ref = db().doc(req.params.id as string);
  const doc = await ref.get();
  if (!doc.exists) return res.status(404).json({ error: "Not found" });

  const d = doc.data() as any;
  const patch: Record<string, unknown> = { status };
  if (status === "accepted") {
    if (d.source === "community" && req.user?.role !== "volunteer") {
      return res.status(403).json({ error: "Only volunteers can claim community food" });
    }
    if (d.source !== "community" && req.user?.role !== "ngo") {
      return res.status(403).json({ error: "Only NGOs can claim donor food listings" });
    }

    if (req.user?.role === "ngo") {
      patch.assignedNgoId = req.user.uid;
    } else if (req.user?.role === "volunteer") {
      patch.assignedVolunteerId = req.user.uid;
    }
  } else if (status === "live") {
    patch.assignedNgoId = null;
    patch.assignedVolunteerId = null;
  }
  await ref.update(patch);
  const updated = await ref.get();
  
  if (status === "accepted") {
    const f = firestore();
    if (f) {
      const donorDoc = await f.collection("users").doc(d.donorId).get();
      const acceptorDoc = await f.collection("users").doc(req.user!.uid).get();
      
      console.log("updateStatus [accepted] Debug Info:", {
        donationId: req.params.id,
        donorId: d.donorId,
        donorDocExists: donorDoc.exists,
        donorEmail: donorDoc.data()?.email,
        donorName: donorDoc.data()?.name,
        acceptorId: req.user!.uid,
        acceptorDocExists: acceptorDoc.exists,
        acceptorEmail: acceptorDoc.data()?.email,
        acceptorName: acceptorDoc.data()?.name,
      });

      if (donorDoc.exists && acceptorDoc.exists) {
        sendPickupConfirmationEmails(
          donorDoc.data(),
          acceptorDoc.data(),
          updated.data()
        ).catch(err => {
          console.error("Failed to send pickup confirmation emails:", err);
        });

        // Create website notifications
        try {
          const batch = f.batch();
          const donorNotifRef = f.collection("notifications").doc();
          batch.set(donorNotifRef, {
            userId: d.donorId,
            title: "Donation Accepted",
            body: `${acceptorDoc.data()?.name || "Someone"} has accepted your donation of ${d.foodType}.\nContact: ${acceptorDoc.data()?.email} ${acceptorDoc.data()?.phone ? " | " + acceptorDoc.data()?.phone : ""}`,
            type: "success",
            read: false,
            createdAt: new Date().toISOString()
          });

          const acceptorNotifRef = f.collection("notifications").doc();
          batch.set(acceptorNotifRef, {
            userId: req.user!.uid,
            title: "Pickup Confirmed",
            body: `You accepted ${d.foodType} from ${donorDoc.data()?.name || "the donor"}.\nContact: ${donorDoc.data()?.email} ${donorDoc.data()?.phone ? " | " + donorDoc.data()?.phone : ""}`,
            type: "success",
            read: false,
            createdAt: new Date().toISOString()
          });
          
          await batch.commit();
        } catch (err) {
          console.error("Failed to save notifications:", err);
        }
      }
    }
  }

  if (status === "live" && d.status === "accepted") {
    const f = firestore();
    if (f) {
      const donorDoc = await f.collection("users").doc(d.donorId).get();
      const previousAssigneeId = d.assignedNgoId || d.assignedVolunteerId;
      if (previousAssigneeId) {
        const acceptorDoc = await f.collection("users").doc(previousAssigneeId).get();
        if (donorDoc.exists && acceptorDoc.exists) {
          sendCancellationEmails(
            donorDoc.data(),
            acceptorDoc.data(),
            d
          ).catch(err => {
            console.error("Failed to send cancellation emails:", err);
          });

          // Create website notifications
          try {
            const batch = f.batch();
            const donorNotifRef = f.collection("notifications").doc();
            batch.set(donorNotifRef, {
              userId: d.donorId,
              title: "Pickup Cancelled",
              body: `The pickup for your donation of ${d.foodType} was cancelled by ${acceptorDoc.data()?.name || "the acceptor"}. It is now back on the feed.`,
              type: "warning",
              read: false,
              createdAt: new Date().toISOString()
            });

            const acceptorNotifRef = f.collection("notifications").doc();
            batch.set(acceptorNotifRef, {
              userId: previousAssigneeId,
              title: "Pickup Cancelled",
              body: `You cancelled the pickup of ${d.foodType} from ${donorDoc.data()?.name || "the donor"}.`,
              type: "warning",
              read: false,
              createdAt: new Date().toISOString()
            });
            
            await batch.commit();
          } catch (err) {
            console.error("Failed to save cancellation notifications:", err);
          }
        }
      }
    }
  }

  if (status === "picked_up") {
    const f = firestore();
    if (f) {
      const donorDoc = await f.collection("users").doc(d.donorId).get();
      const acceptorId = d.assignedNgoId || d.assignedVolunteerId || req.user!.uid;
      const acceptorDoc = await f.collection("users").doc(acceptorId).get();
      if (donorDoc.exists && acceptorDoc.exists) {
        sendCompletionEmails(
          donorDoc.data(),
          acceptorDoc.data(),
          updated.data()
        ).catch(err => {
          console.error("Failed to send completion emails:", err);
        });

        // Create website notifications
        try {
          const batch = f.batch();
          const donorNotifRef = f.collection("notifications").doc();
          batch.set(donorNotifRef, {
            userId: d.donorId,
            title: "Donation Completed",
            body: `Your donation of ${d.foodType} has been successfully completed by ${acceptorDoc.data()?.name || "the acceptor"}.`,
            type: "success",
            read: false,
            createdAt: new Date().toISOString()
          });

          const acceptorNotifRef = f.collection("notifications").doc();
          batch.set(acceptorNotifRef, {
            userId: acceptorId,
            title: "Donation Completed",
            body: `You successfully completed the donation of ${d.foodType} from ${donorDoc.data()?.name || "the donor"}.`,
            type: "success",
            read: false,
            createdAt: new Date().toISOString()
          });
          
          await batch.commit();
        } catch (err) {
          console.error("Failed to save completion notifications:", err);
        }
      }
    }
  }

  res.json(updated.data());
}

export async function remove(req: AuthRequest, res: Response) {
  const f = firestore();
  if (!f) return res.status(404).json({ error: "Not found" });
  const ref = f.collection(COLLECTION).doc(req.params.id as string);
  const doc = await ref.get();
  if (!doc.exists) return res.status(404).json({ error: "Not found" });

  const data = doc.data() as any;
  const role = req.user?.role;
  const uid = req.user?.uid;
  // Only the donor who owns it, or an admin, can delete.
  if (role !== "admin" && data.donorId !== uid) {
    return res.status(403).json({ error: "Forbidden" });
  }
  // Don't allow deletion once a pickup is in progress / completed.
  if (data.status === "picked_up") {
    return res.status(400).json({
      error: "Cannot delete a completed donation",
    });
  }

  await ref.delete();
  res.status(204).end();
}

export async function get(req: AuthRequest, res: Response) {
  const f = firestore();
  if (!f) return res.status(404).json({ error: "Not found" });
  const doc = await f.collection(COLLECTION).doc(req.params.id as string).get();
  if (!doc.exists) return res.status(404).json({ error: "Not found" });
  
  const d = doc.data() as any;
  const enriched = await enrichDonorNames([d]);
  res.json(enriched[0]);
}

export async function listPublic(_req: AuthRequest, res: Response) {
  const f = firestore();
  if (!f) return res.json([]);
  const snap = await f
    .collection(COLLECTION)
    .get();
  const items = snap.docs
    .map((d) => d.data() as any)
    .filter((d: any) => d.status === "live" || d.status === "accepted")
    .map((v) => {
    return {
      id: v.id,
      donorName: v.donorName,
      donorType: v.donorType,
      source: v.source,
      donorId: v.donorId,
      foodType: v.foodType,
      quantityMeals: v.quantityMeals,
      pickupBy: v.pickupBy,
      images: v.images,
      location: v.location,
      status: v.status,
      createdAt: v.createdAt,
      aiSafety: v.aiSafety,
      preparedAt: v.preparedAt,
      district: v.district,
      pincode: v.pincode,
      notes: v.notes,
    };
  });
  res.json(await enrichDonorNames(items));
}

export async function update(req: AuthRequest, res: Response) {
  const f = firestore();
  if (!f) return res.status(404).json({ error: "Not found" });
  
  const ref = f.collection(COLLECTION).doc(req.params.id as string);
  const doc = await ref.get();
  if (!doc.exists) return res.status(404).json({ error: "Not found" });

  const data = doc.data() as any;
  const role = req.user?.role;
  const uid = req.user?.uid;

  // Only the donor who owns it, or an admin, can edit.
  if (role !== "admin" && data.donorId !== uid) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Parse using partial schema
  const patch = createDonationSchema.partial().parse(req.body);
  if (patch.district) patch.district = patch.district.trim();
  if (patch.pincode) patch.pincode = patch.pincode.trim();

  await ref.update(patch);
  const updated = await ref.get();
  res.json(updated.data());
}

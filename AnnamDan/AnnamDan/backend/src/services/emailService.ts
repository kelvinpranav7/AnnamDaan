import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

interface DetailItem {
  label: string;
  value: string;
}

interface TemplateParams {
  title: string;
  subtitle?: string;
  heading: string;
  description: string;
  detailsTitle: string;
  details: DetailItem[];
  contactTitle?: string;
  contactDetails?: DetailItem[];
  closingMessage?: string;
}

function generateEmailHtml({
  title,
  subtitle,
  heading,
  description,
  detailsTitle,
  details,
  contactTitle,
  contactDetails,
  closingMessage,
}: TemplateParams): string {
  const detailsHtml = details
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #eaeaea;">
        <td style="padding: 12px 0; font-weight: 700; color: #5c534c; font-size: 14px; width: 35%; text-align: left; vertical-align: top;">${item.label}</td>
        <td style="padding: 12px 0; color: #2e2a27; font-size: 14px; text-align: left; vertical-align: top;">${item.value}</td>
      </tr>
    `
    )
    .join("");

  const contactHtml = contactDetails && contactDetails.length > 0
    ? `
      <div style="margin-top: 25px; padding: 20px; background-color: #faf6f0; border-radius: 12px; border: 1px solid #eaddcf; text-align: left;">
        <h4 style="margin: 0 0 12px 0; color: #760009; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;">${contactTitle || "Contact Information"}</h4>
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          ${contactDetails
            .map(
              (item) => `
              <tr>
                <td style="padding: 6px 0; font-weight: 700; color: #5c534c; font-size: 13px; width: 30%; text-align: left; vertical-align: top;">${item.label}</td>
                <td style="padding: 6px 0; color: #2e2a27; font-size: 13px; text-align: left; vertical-align: top;">${item.value}</td>
              </tr>
            `
            )
            .join("")}
        </table>
      </div>
    `
    : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2e2a27; -webkit-font-smoothing: antialiased;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #faf8f5; padding: 30px 0;">
        <tr>
          <td align="center" style="padding: 30px 10px;">
            <!-- Poster Container -->
            <table role="presentation" style="width: 100%; max-width: 560px; border-collapse: collapse; background-color: #ffffff; border-radius: 24px; box-shadow: 0 10px 30px rgba(118, 0, 9, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02); overflow: hidden; border: 1px solid #ebdccb; text-align: center;">
              
              <!-- Brand Accent Line -->
              <tr>
                <td style="background-color: #760009; height: 10px;"></td>
              </tr>

              <!-- Poster Header -->
              <tr>
                <td align="center" style="padding: 35px 35px 25px 35px; background-color: #faf6f0; border-bottom: 2px dashed #ebdccb;">
                  <div style="font-size: 26px; font-weight: 900; color: #760009; letter-spacing: 0.1em; text-transform: uppercase; margin: 0; font-family: Georgia, serif;">Annam Daan</div>
                  <div style="font-size: 11px; font-weight: 700; color: #b45309; text-transform: uppercase; letter-spacing: 0.15em; margin-top: 6px;">${subtitle || "Nourishing Lives · Rescuing Surplus"}</div>
                </td>
              </tr>

              <!-- Poster Body / Content -->
              <tr>
                <td style="padding: 40px 35px 30px 35px;">
                  <h2 style="margin: 0 0 12px 0; color: #760009; font-size: 22px; font-weight: 800; line-height: 1.3; font-family: Georgia, serif;">${heading}</h2>
                  <p style="margin: 0 0 30px 0; color: #5c534c; font-size: 15px; line-height: 1.6; text-align: center;">${description}</p>

                  <!-- Details Card -->
                  <div style="padding: 24px; background-color: #ffffff; border-radius: 16px; border: 1px solid #eaddcf; border-left: 6px solid #760009; text-align: left;">
                    <h3 style="margin: 0 0 14px 0; color: #760009; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #ebdccb; padding-bottom: 8px;">${detailsTitle}</h3>
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                      ${detailsHtml}
                    </table>
                  </div>

                  <!-- Contact Card (If present) -->
                  ${contactHtml}
                </td>
              </tr>

              <!-- Footer Section -->
              <tr>
                <td align="center" style="padding: 0 35px 40px 35px;">
                  <div style="margin: 20px 0 20px 0; border-top: 2px dashed #ebdccb; width: 100%;"></div>
                  <div style="font-style: italic; font-size: 15px; color: #b45309; font-weight: 700; font-family: Georgia, serif;">"${closingMessage || "Your surplus, their sacred smile."}"</div>
                  <div style="font-size: 11px; color: #9ca3af; margin-top: 30px; letter-spacing: 0.03em;">This is an automated email notification from the Annam Daan platform.</div>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export async function sendPickupConfirmationEmails(
  donor: any,
  acceptor: any,
  donation: any
) {
  const donorSubject = "Your Food Donation has been accepted!";
  const donorText = `Hello ${donor.name || "Donor"},\n\nYour donation of ${donation.foodType} (${donation.quantityMeals} people) has been accepted by ${acceptor.name || "a volunteer"}.\n\nContact Info of Acceptor:\nName: ${acceptor.name}\nEmail: ${acceptor.email}\nPhone: ${acceptor.phone || "Not provided"}\n\nPlease coordinate the pickup with them.\n\nThank you for sharing!`;
  
  const donorHtml = generateEmailHtml({
    title: donorSubject,
    heading: "🎉 Donation Accepted!",
    description: `Wonderful news! Your generous surplus food listing has been claimed. A rescue volunteer/NGO is arranging to pick it up shortly.`,
    detailsTitle: "Rescued Food Details",
    details: [
      { label: "Food Type", value: donation.foodType },
      { label: "People", value: `${donation.quantityMeals} people` },
      { label: "Status", value: "Awaiting Pickup" }
    ],
    contactTitle: "Rescuer Profile & Details",
    contactDetails: [
      { label: "Name", value: acceptor.name || "Volunteer Partner" },
      { label: "Email", value: acceptor.email || "—" },
      { label: "Phone", value: acceptor.phone || "Not provided" },
      { label: "Role", value: acceptor.role === "ngo" ? "NGO Partner" : "Volunteer Rescuer" }
    ]
  });

  const acceptorSubject = "You accepted a Food Donation!";
  const acceptorText = `Hello ${acceptor.name || "Acceptor"},\n\nYou have accepted the pickup for ${donation.foodType} (${donation.quantityMeals} people) donated by ${donor.name || "a donor"}.\n\nContact Info of Donor:\nName: ${donor.name}\nEmail: ${donor.email}\nPhone: ${donor.phone || "Not provided"}\nLocation: ${donation.location?.address || donor.district || "Not provided"}\n\nPlease coordinate the pickup with them.\n\nThank you for helping!`;

  const acceptorHtml = generateEmailHtml({
    title: acceptorSubject,
    heading: "📦 Pickup Claim Confirmed",
    description: `Thank you for taking action! You have accepted the pickup for the following surplus food donation. Please coordinate with the donor below.`,
    detailsTitle: "Rescue Details",
    details: [
      { label: "Food Type", value: donation.foodType },
      { label: "People", value: `${donation.quantityMeals} people` },
      { label: "Address", value: donation.location?.address || "Provided on profile" }
    ],
    contactTitle: "Donor Profile & Details",
    contactDetails: [
      { label: "Name", value: donor.name || "Donor" },
      { label: "Email", value: donor.email || "—" },
      { label: "Phone", value: donor.phone || "Not provided" },
      { label: "District", value: donor.district || "—" }
    ]
  });

  try {
    await transporter.sendMail({
      from: env.EMAIL_USER,
      to: donor.email,
      subject: donorSubject,
      text: donorText,
      html: donorHtml,
    });
    console.log(`Sent email to donor: ${donor.email}`);
  } catch (err) {
    console.error("Failed to send email to donor:", err);
  }

  try {
    await transporter.sendMail({
      from: env.EMAIL_USER,
      to: acceptor.email,
      subject: acceptorSubject,
      text: acceptorText,
      html: acceptorHtml,
    });
    console.log(`Sent email to acceptor: ${acceptor.email}`);
  } catch (err) {
    console.error("Failed to send email to acceptor:", err);
  }
}

export async function sendCompletionEmails(
  donor: any,
  acceptor: any,
  donation: any
) {
  const donorSubject = "Donation Pickup Completed!";
  const donorText = `Hello ${donor.name || "Donor"},\n\nYour donation of ${donation.foodType} has been successfully picked up by ${acceptor.name || "the acceptor"}.\n\nContact Details of Acceptor:\nEmail: ${acceptor.email}\nPhone: ${acceptor.phone || "Not provided"}\n\nThank you for making a difference!`;

  const donorHtml = generateEmailHtml({
    title: donorSubject,
    heading: "✨ Surplus Safely Rescued!",
    description: `Heartfelt thanks! Your donation has been successfully picked up and is on its way to nourishing people in need.`,
    detailsTitle: "Rescued Food Summary",
    details: [
      { label: "Food Type", value: donation.foodType },
      { label: "People", value: `${donation.quantityMeals} people` },
      { label: "Completed At", value: new Date().toLocaleString() }
    ],
    contactTitle: "Rescuer Details",
    contactDetails: [
      { label: "Name", value: acceptor.name || "Volunteer Partner" },
      { label: "Email", value: acceptor.email || "—" },
      { label: "Phone", value: acceptor.phone || "Not provided" }
    ]
  });

  const acceptorSubject = "Pickup Completed!";
  const acceptorText = `Hello ${acceptor.name || "Acceptor"},\n\nYou have successfully picked up the donation of ${donation.foodType} from ${donor.name || "the donor"}.\n\nContact Details of Donor:\nEmail: ${donor.email}\nPhone: ${donor.phone || "Not provided"}\n\nThank you for your help in rescuing this food!`;

  const acceptorHtml = generateEmailHtml({
    title: acceptorSubject,
    heading: "✅ Thank You for Rescuing!",
    description: `Mission accomplished! You have successfully verified and picked up the donation. Thank you for being the bridge to feeding others.`,
    detailsTitle: "Rescue Summary",
    details: [
      { label: "Food Type", value: donation.foodType },
      { label: "People", value: `${donation.quantityMeals} people` },
      { label: "Donor Name", value: donor.name || "Donor" }
    ],
    contactTitle: "Donor Contact",
    contactDetails: [
      { label: "Email", value: donor.email || "—" },
      { label: "Phone", value: donor.phone || "Not provided" }
    ]
  });

  try {
    await transporter.sendMail({
      from: env.EMAIL_USER,
      to: donor.email,
      subject: donorSubject,
      text: donorText,
      html: donorHtml,
    });
    console.log(`Sent completion email to donor: ${donor.email}`);
  } catch (err) {
    console.error("Failed to send completion email to donor:", err);
  }

  try {
    await transporter.sendMail({
      from: env.EMAIL_USER,
      to: acceptor.email,
      subject: acceptorSubject,
      text: acceptorText,
      html: acceptorHtml,
    });
    console.log(`Sent completion email to acceptor: ${acceptor.email}`);
  } catch (err) {
    console.error("Failed to send completion email to acceptor:", err);
  }
}

export async function sendCancellationEmails(
  donor: any,
  acceptor: any,
  donation: any
) {
  const donorSubject = "Food Rescue Pickup Cancelled";
  const donorText = `Hello ${donor.name || "Donor"},\n\nThe pickup for your donation of ${donation.foodType} has been cancelled by ${acceptor.name || "the acceptor"}.\n\nThe listing is now active and available for other rescues again.\n\nThank you for your support!`;

  const donorHtml = generateEmailHtml({
    title: donorSubject,
    heading: "⚠️ Pickup Cancelled",
    description: `Please note that the current pickup arrangement for your surplus food listing has been cancelled. Your listing has been immediately placed back on the active feed for other volunteers or NGOs to claim.`,
    detailsTitle: "Listing Details",
    details: [
      { label: "Food Type", value: donation.foodType },
      { label: "People", value: `${donation.quantityMeals} people` },
      { label: "Status", value: "Relisted & Live" }
    ],
    contactTitle: "Previous Claimer Info",
    contactDetails: [
      { label: "Name", value: acceptor.name || "Volunteer Partner" },
      { label: "Email", value: acceptor.email || "—" },
      { label: "Phone", value: acceptor.phone || "Not provided" }
    ]
  });

  const acceptorSubject = "Pickup Cancelled";
  const acceptorText = `Hello ${acceptor.name || "Acceptor"},\n\nYou have cancelled the pickup for ${donation.foodType} donated by ${donor.name || "the donor"}.\n\nThe item has been relisted on the feed.\n\nThank you!`;

  const acceptorHtml = generateEmailHtml({
    title: acceptorSubject,
    heading: "❌ Pickup Cancelled",
    description: `You have cancelled the pickup for the donation listing. The item has been returned to the active feed and is available for other rescuers.`,
    detailsTitle: "Cancelled Item Details",
    details: [
      { label: "Food Type", value: donation.foodType },
      { label: "People", value: `${donation.quantityMeals} people` },
      { label: "Donor Name", value: donor.name || "Donor" }
    ],
    contactTitle: "Donor Contact",
    contactDetails: [
      { label: "Email", value: donor.email || "—" },
      { label: "Phone", value: donor.phone || "Not provided" }
    ]
  });

  try {
    await transporter.sendMail({
      from: env.EMAIL_USER,
      to: donor.email,
      subject: donorSubject,
      text: donorText,
      html: donorHtml,
    });
    console.log(`Sent cancellation email to donor: ${donor.email}`);
  } catch (err) {
    console.error("Failed to send cancellation email to donor:", err);
  }

  try {
    await transporter.sendMail({
      from: env.EMAIL_USER,
      to: acceptor.email,
      subject: acceptorSubject,
      text: acceptorText,
      html: acceptorHtml,
    });
    console.log(`Sent cancellation email to acceptor: ${acceptor.email}`);
  } catch (err) {
    console.error("Failed to send cancellation email to acceptor:", err);
  }
}

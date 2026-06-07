import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";

admin.initializeApp();

const resendApiKey = defineSecret("RESEND_API_KEY");
const adminEmail = defineSecret("ADMIN_EMAIL");

// Simple in-memory rate limiter (resets on cold start, which is fine)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // max requests per IP
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT) {
    return true;
  }

  entry.count++;
  return false;
}

async function sendEmail(apiKey: string, to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Sim Đệ Nhất <onboarding@resend.dev>",
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}

export const sendInquiryEmail = onRequest(
  {
    secrets: [resendApiKey, adminEmail],
    region: "asia-southeast1",
    cors: true,
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }

    // Rate limiting
    const clientIp = req.ip || req.headers["x-forwarded-for"] as string || "unknown";
    if (isRateLimited(clientIp)) {
      res.status(429).json({ success: false, error: "Too many requests. Try again later." });
      return;
    }

    const { inquiryId } = req.body;

    if (!inquiryId || typeof inquiryId !== "string") {
      res.status(400).json({ success: false, error: "Missing inquiryId" });
      return;
    }

    // Verify the inquiry document exists in Firestore
    const db = admin.firestore();
    const docRef = db.collection("inquiries").doc(inquiryId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      res.status(404).json({ success: false, error: "Inquiry not found" });
      return;
    }

    const data = docSnap.data()!;
    const customer = data.customer;
    const simCard = data.simCard;

    if (!customer?.name || !customer?.phone || !simCard?.number) {
      res.status(400).json({ success: false, error: "Invalid inquiry data" });
      return;
    }

    // Check if email was already sent (prevent replay)
    if (data.emailSent) {
      res.status(200).json({ success: true, message: "Email already sent" });
      return;
    }

    const apiKey = resendApiKey.value();
    const adminAddr = adminEmail.value();
    const formattedPrice = new Intl.NumberFormat("vi-VN").format(simCard.price) + " ₫";

    try {
      // Email to admin
      await sendEmail(
        apiKey,
        adminAddr,
        `[Yêu cầu tư vấn] ${simCard.number} - ${customer.name}`,
        `
          <h2>Yêu cầu tư vấn mới</h2>
          <h3>Thông tin SIM</h3>
          <ul>
            <li><strong>Số:</strong> ${simCard.number}</li>
            <li><strong>Nhà mạng:</strong> ${simCard.carrier}</li>
            <li><strong>Giá:</strong> ${formattedPrice}</li>
          </ul>
          <h3>Thông tin khách hàng</h3>
          <ul>
            <li><strong>Họ tên:</strong> ${customer.name}</li>
            <li><strong>SĐT:</strong> ${customer.phone}</li>
            <li><strong>Email:</strong> ${customer.email || "Không cung cấp"}</li>
            <li><strong>CCCD:</strong> ${customer.idNumber}</li>
            ${customer.message ? `<li><strong>Ghi chú:</strong> ${customer.message}</li>` : ""}
          </ul>
          <p><em>Gửi lúc: ${data.submittedAt}</em></p>
        `
      );

      // Email receipt to customer (only if they provided an email)
      if (customer.email) {
        try {
          await sendEmail(
            apiKey,
            customer.email,
            `Xác nhận yêu cầu tư vấn - Số ${simCard.number}`,
            `
              <h2>Xác nhận yêu cầu tư vấn</h2>
              <p>Chào ${customer.name},</p>
              <p>Chúng tôi đã nhận được yêu cầu tư vấn của bạn về số SIM sau:</p>
              <div style="background:#f8fafc;padding:1rem;border-radius:8px;margin:1rem 0;">
                <p style="margin:0;font-size:1.25rem;font-weight:bold;">${simCard.number}</p>
                <p style="margin:0.25rem 0 0;">Nhà mạng: ${simCard.carrier} | Giá: ${formattedPrice}</p>
              </div>
              <p>Đội ngũ của chúng tôi sẽ liên hệ bạn trong thời gian sớm nhất qua số điện thoại <strong>${customer.phone}</strong>.</p>
              <p>Cảm ơn bạn đã quan tâm đến Sim Đệ Nhất!</p>
              <hr>
              <p style="font-size:0.8rem;color:#6b7280;">Đây là email tự động, vui lòng không trả lời.</p>
            `
          );
        } catch (customerEmailError) {
          // Customer email may fail on free tier (can only send to verified emails)
          // Don't fail the whole request — admin was already notified
          console.warn("Customer email failed (expected on free tier):", customerEmailError);
        }
      }

      // Mark as sent to prevent replays
      await docRef.update({ emailSent: true });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Failed to send email:", error);
      res.status(500).json({ success: false, error: "Failed to send email" });
    }
  }
);

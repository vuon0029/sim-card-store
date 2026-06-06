import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

const resendApiKey = defineSecret("RESEND_API_KEY");
const adminEmail = defineSecret("ADMIN_EMAIL");

interface InquiryPayload {
  customer: {
    name: string;
    phone: string;
    email: string;
    idNumber: string;
    message?: string;
  };
  simCard: {
    number: string;
    carrier: string;
    price: number;
  };
  submittedAt: string;
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

    const data = req.body as InquiryPayload;

    if (!data?.customer?.name || !data?.customer?.phone || !data?.simCard?.number) {
      res.status(400).send("Missing required fields");
      return;
    }

    const apiKey = resendApiKey.value();
    const admin = adminEmail.value();
    const { customer, simCard } = data;

    const formattedPrice = new Intl.NumberFormat("vi-VN").format(simCard.price) + " ₫";

    try {
      // Email to admin
      await sendEmail(
        apiKey,
        admin,
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
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Failed to send email:", error);
      res.status(500).json({ success: false, error: "Failed to send email" });
    }
  }
);

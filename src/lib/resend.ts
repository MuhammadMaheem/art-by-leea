/**
 * Resend Email Client — Used in API routes for transactional emails.
 *
 * Resend free tier: 100 emails/day, 1 custom domain.
 * Used for: order confirmations, commission notifications, status updates.
 *
 * NEVER import this in client components.
 */
import { Resend } from "resend";

/** Lazy-initialised Resend client (avoids build-time errors when env vars are missing) */
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

/** The sender address — must be verified in Resend dashboard */
export const FROM_EMAIL = "Art Gallery <onboarding@resend.dev>";

/** Admin email (receives commission notifications) */
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";

/**
 * Send an order confirmation email to the customer.
 */
export async function sendOrderConfirmation(params: {
  to: string;
  orderId: string;
  items: Array<{ title: string; price: number; quantity: number }>;
  total: number;
}) {
  const { to, orderId, items, total } = params;
  const itemsHtml = items
    .map(
      (item) =>
        `<li>${item.title} × ${item.quantity} — Rs. ${item.price.toFixed(0)}</li>`
    )
    .join("");

  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Order Confirmed — #${orderId.slice(0, 8)}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #B57EDC;">Thank you for your order!</h1>
        <p>Your order <strong>#${orderId.slice(0, 8)}</strong> has been confirmed.</p>
        <ul>${itemsHtml}</ul>
        <p>Total: <strong>Rs. ${total.toFixed(0)}</strong></p>
        <p>We'll notify you when your artwork ships.</p>
        <hr style="border: 1px solid #E6E6FA; margin: 24px 0;" />
        <p style="color: #6B7280; font-size: 14px;">Art By Aleeha</p>
      </div>
    `,
  });
}

/**
 * Notify the admin about a new commission request.
 */
export async function sendCommissionNotification(params: {
  commissionId: string;
  name: string;
  email: string;
  description: string;
  category: string;
  budget: string;
}) {
  const { commissionId, name, email, description, category, budget } = params;
  await getResend().emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Commission Request from ${name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #B57EDC;">New Commission Request</h1>
        <p><strong>Commission ID:</strong> #${commissionId.slice(0, 8)}</p>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Budget:</strong> ${budget}</p>
        <p><strong>Description:</strong></p>
        <p style="background: #F3F4F6; padding: 16px; border-radius: 8px;">
          ${description}
        </p>
        <p>Log in to your admin dashboard to view the full request.</p>
        <hr style="border: 1px solid #E6E6FA; margin: 24px 0;" />
        <p style="color: #6B7280; font-size: 14px;">Art By Aleeha Admin</p>
      </div>
    `,
  });
}

/**
 * Notify the customer about a commission status update.
 */
export async function sendCommissionStatusUpdate(params: {
  to: string;
  commissionId: string;
  status: string;
  userName: string;
}) {
  const { to, commissionId, status, userName } = params;

  const statusLabel = status
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Commission Update — Status: ${statusLabel}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #B57EDC;">Commission Status Update</h1>
        <p>Hi ${userName},</p>
        <p>Your commission request <strong>#${commissionId.slice(0, 8)}</strong>
        has been updated to: <strong>${statusLabel}</strong></p>
        <p>Log in to your account to view details.</p>
        <hr style="border: 1px solid #E6E6FA; margin: 24px 0;" />
        <p style="color: #6B7280; font-size: 14px;">Art By Aleeha</p>
      </div>
    `,
  });
}

/**
 * Send the order receipt screenshot to the admin for manual verification.
 */
export async function sendOrderReceiptToAdmin(params: {
  orderId: string;
  userEmail: string;
  receiptImageUrl: string;
  items: Array<{ title: string; price: number; quantity: number }>;
  total: number;
}) {
  const { orderId, userEmail, receiptImageUrl, items, total } = params;
  const itemsHtml = items
    .map(
      (item) =>
        `<li>${item.title} × ${item.quantity} — Rs. ${item.price.toFixed(0)}</li>`
    )
    .join("");

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Order #${orderId.slice(0, 8)} — Payment Verification Needed`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #B57EDC;">New Order — Verify Payment</h1>
        <p><strong>Order ID:</strong> #${orderId.slice(0, 8)}</p>
        <p><strong>Customer:</strong> ${userEmail}</p>
        <h3>Items:</h3>
        <ul>${itemsHtml}</ul>
        <p><strong>Total: Rs. ${total.toFixed(0)}</strong></p>
        <h3>Payment Receipt:</h3>
        <p><a href="${receiptImageUrl}" style="color: #B57EDC;">View Receipt Screenshot</a></p>
        <img src="${receiptImageUrl}" alt="Payment receipt" style="max-width: 100%; border-radius: 8px; margin-top: 8px;" />
        <p style="margin-top: 16px;">Log in to the admin dashboard to approve or reject this order.</p>
        <hr style="border: 1px solid #E6E6FA; margin: 24px 0;" />
        <p style="color: #6B7280; font-size: 14px;">Art By Aleeha Admin</p>
      </div>
    `,
  });
}

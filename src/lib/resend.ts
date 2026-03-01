/**
 * Resend Email Client — Professional branded email templates.
 * NEVER import this in client components.
 */
import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export const FROM_EMAIL = "Art Gallery <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";

/**
 * Resend sandbox only allows sending to the verified account owner email.
 * Set RESEND_TEST_OVERRIDE_EMAIL to that address to redirect all outgoing
 * emails during development. Remove it once a custom domain is verified.
 */
const TEST_OVERRIDE = process.env.RESEND_TEST_OVERRIDE_EMAIL;
function resolveRecipient(email: string): string {
  if (TEST_OVERRIDE) {
    console.log(`[Resend] Sandbox override: ${email} → ${TEST_OVERRIDE}`);
    return TEST_OVERRIDE;
  }
  return email;
}

/* ── Shared layout wrapper ─────────────────────────────────────────────── */

function emailLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${title}</title></head>
<body style="margin:0;padding:0;background:#f4f1f9;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1f9;padding:32px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(181,126,220,0.10);">
<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#7c3aed,#a855f7,#c084fc);padding:32px 40px;text-align:center;">
<h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Art By Aleeha</h1>
<p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:1px;text-transform:uppercase;">Handcrafted Art &amp; Commissions</p>
</td></tr>
<!-- Body -->
<tr><td style="padding:36px 40px 28px;">${body}</td></tr>
<!-- Footer -->
<tr><td style="background:#faf5ff;padding:24px 40px;border-top:1px solid #e9d5ff;">
<p style="margin:0;color:#7c3aed;font-size:13px;text-align:center;font-weight:500;">Art By Aleeha</p>
<p style="margin:4px 0 0;color:#9ca3af;font-size:12px;text-align:center;">Turning imagination into art, one piece at a time.</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function statusBadge(label: string, color: string): string {
  return `<span style="display:inline-block;padding:6px 16px;border-radius:20px;background:${color};color:#ffffff;font-size:14px;font-weight:600;letter-spacing:0.3px;">${label}</span>`;
}

function sectionHeading(text: string): string {
  return `<h2 style="margin:28px 0 12px;color:#1f2937;font-size:18px;font-weight:600;border-bottom:2px solid #e9d5ff;padding-bottom:8px;">${text}</h2>`;
}

function formatLabel(label: string): string {
  return label
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  reviewing: "#3b82f6",
  quoted: "#8b5cf6",
  accepted: "#10b981",
  "in-progress": "#6366f1",
  revision: "#f97316",
  completed: "#059669",
  delivered: "#0d9488",
  rejected: "#ef4444",
  cancelled: "#6b7280",
  paid: "#10b981",
  shipped: "#3b82f6",
  pending_verification: "#f59e0b",
};

/* ── Order Confirmation (to customer) ─────────────────────────────────── */

export async function sendOrderConfirmation(params: {
  to: string;
  orderId: string;
  items: Array<{ title: string; price: number; quantity: number }>;
  total: number;
}) {
  const { to, orderId, items, total } = params;
  const shortId = orderId.slice(0, 8);

  const itemRows = items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f3e8ff;color:#374151;font-size:14px;">${item.title}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3e8ff;color:#6b7280;font-size:14px;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3e8ff;color:#374151;font-size:14px;text-align:right;font-weight:500;">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
    </tr>`
    )
    .join("");

  const body = `
    <p style="margin:0 0 4px;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Order Confirmed</p>
    <h2 style="margin:0 0 20px;color:#1f2937;font-size:22px;">Thank you for your purchase!</h2>
    <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Your order <strong style="color:#7c3aed;">#${shortId}</strong> has been received and is being processed. We&rsquo;ll notify you once it ships.
    </p>
    ${sectionHeading("Order Details")}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr style="background:#faf5ff;">
        <th style="padding:10px 12px;text-align:left;color:#7c3aed;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Item</th>
        <th style="padding:10px 12px;text-align:center;color:#7c3aed;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
        <th style="padding:10px 12px;text-align:right;color:#7c3aed;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Price</th>
      </tr>
      ${itemRows}
    </table>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:14px 12px;text-align:right;font-size:18px;font-weight:700;color:#7c3aed;">Total: Rs. ${total.toLocaleString()}</td>
      </tr>
    </table>
    <p style="color:#6b7280;font-size:14px;line-height:1.5;margin:20px 0 0;">If you have any questions, feel free to reach out through your account messages.</p>`;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: resolveRecipient(to),
    subject: `Order Confirmed — #${shortId}`,
    html: emailLayout(`Order #${shortId} Confirmed`, body),
  });
}

/* ── Commission Notification (to admin) ───────────────────────────────── */

export async function sendCommissionNotification(params: {
  commissionId: string;
  name: string;
  email: string;
  description: string;
  category: string;
  budget: string;
  adminEmail?: string;
}) {
  const { commissionId, name, email, description, category, budget, adminEmail } = params;
  const recipient = adminEmail || ADMIN_EMAIL;
  const shortId = commissionId.slice(0, 8);

  const body = `
    <p style="margin:0 0 4px;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:1px;">New Commission</p>
    <h2 style="margin:0 0 20px;color:#1f2937;font-size:22px;">A new request has arrived!</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf5ff;border-radius:12px;margin-bottom:24px;">
      <tr><td style="padding:20px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;color:#6b7280;font-size:13px;width:130px;">Commission ID</td>
            <td style="padding:6px 0;color:#1f2937;font-size:14px;font-weight:600;">#${shortId}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280;font-size:13px;">Customer</td>
            <td style="padding:6px 0;color:#1f2937;font-size:14px;font-weight:500;">${name} (${email})</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280;font-size:13px;">Category</td>
            <td style="padding:6px 0;color:#1f2937;font-size:14px;">${category}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280;font-size:13px;">Budget</td>
            <td style="padding:6px 0;color:#7c3aed;font-size:14px;font-weight:600;">${budget}</td>
          </tr>
        </table>
      </td></tr>
    </table>
    ${sectionHeading("Description")}
    <div style="background:#f9fafb;padding:16px 20px;border-radius:10px;border-left:4px solid #a855f7;color:#374151;font-size:14px;line-height:1.6;">
      ${description}
    </div>
    <div style="margin-top:28px;padding:16px 20px;background:#fef3c7;border-radius:10px;border-left:4px solid #f59e0b;">
      <p style="margin:0;color:#92400e;font-size:14px;font-weight:600;">Action Required</p>
      <p style="margin:4px 0 0;color:#92400e;font-size:13px;">Log in to your admin dashboard to review and respond to this commission request.</p>
    </div>`;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: resolveRecipient(recipient),
    subject: `New Commission Request from ${name}`,
    html: emailLayout("New Commission Request", body),
  });
}

/* ── Commission Status Update (to customer) ───────────────────────────── */

export async function sendCommissionStatusUpdate(params: {
  to: string;
  commissionId: string;
  status: string;
  userName: string;
  quotedPrice?: number;
  estimatedDelivery?: string;
  rejectionReason?: string;
}) {
  const { to, commissionId, status, userName, quotedPrice, estimatedDelivery, rejectionReason } = params;
  const shortId = commissionId.slice(0, 8);
  const statusLabel = formatLabel(status);
  const badgeColor = STATUS_COLORS[status] || "#6b7280";

  let detailsHtml = "";
  if (status === "quoted" && quotedPrice !== undefined) {
    detailsHtml = `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf5ff;border-radius:12px;margin:20px 0;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 8px;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Quote Details</p>
        <p style="margin:0;color:#7c3aed;font-size:28px;font-weight:700;">Rs. ${quotedPrice.toLocaleString()}</p>
        ${estimatedDelivery ? `<p style="margin:8px 0 0;color:#4b5563;font-size:14px;">Estimated delivery: <strong>${estimatedDelivery}</strong></p>` : ""}
      </td></tr>
    </table>
    <p style="color:#4b5563;font-size:14px;line-height:1.5;">Please log in to your account to review the quote and discuss any details with us.</p>`;
  } else if (status === "rejected" && rejectionReason) {
    detailsHtml = `
    <div style="margin:20px 0;padding:16px 20px;background:#fef2f2;border-radius:10px;border-left:4px solid #ef4444;">
      <p style="margin:0;color:#991b1b;font-size:14px;font-weight:600;">Reason</p>
      <p style="margin:4px 0 0;color:#991b1b;font-size:14px;line-height:1.5;">${rejectionReason}</p>
    </div>`;
  }

  const body = `
    <p style="margin:0 0 4px;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Commission Update</p>
    <h2 style="margin:0 0 20px;color:#1f2937;font-size:22px;">Hi ${userName},</h2>
    <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Your commission <strong style="color:#7c3aed;">#${shortId}</strong> has been updated:
    </p>
    <div style="text-align:center;margin:24px 0;">${statusBadge(statusLabel, badgeColor)}</div>
    ${detailsHtml}
    <p style="color:#6b7280;font-size:14px;line-height:1.5;margin:20px 0 0;">You can view full details and communicate with us through your account.</p>`;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: resolveRecipient(to),
    subject: `Commission Update — ${statusLabel} (#${shortId})`,
    html: emailLayout("Commission Status Update", body),
  });
}

/* ── Order Receipt to Admin (with receipt image) ──────────────────────── */

export async function sendOrderReceiptToAdmin(params: {
  orderId: string;
  userEmail: string;
  receiptImageUrl: string;
  items: Array<{ title: string; price: number; quantity: number }>;
  total: number;
  adminEmail?: string;
}) {
  const { orderId, userEmail, receiptImageUrl, items, total, adminEmail } = params;
  const recipient = adminEmail || ADMIN_EMAIL;
  const shortId = orderId.slice(0, 8);

  const itemRows = items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f3e8ff;color:#374151;font-size:14px;">${item.title}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3e8ff;color:#6b7280;font-size:14px;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f3e8ff;color:#374151;font-size:14px;text-align:right;font-weight:500;">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
    </tr>`
    )
    .join("");

  const body = `
    <p style="margin:0 0 4px;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Payment Verification</p>
    <h2 style="margin:0 0 20px;color:#1f2937;font-size:22px;">New Order Received</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf5ff;border-radius:12px;margin-bottom:24px;">
      <tr><td style="padding:20px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;color:#6b7280;font-size:13px;width:130px;">Order ID</td>
            <td style="padding:6px 0;color:#1f2937;font-size:14px;font-weight:600;">#${shortId}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280;font-size:13px;">Customer</td>
            <td style="padding:6px 0;color:#1f2937;font-size:14px;">${userEmail}</td>
          </tr>
        </table>
      </td></tr>
    </table>
    ${sectionHeading("Items Ordered")}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr style="background:#faf5ff;">
        <th style="padding:10px 12px;text-align:left;color:#7c3aed;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Item</th>
        <th style="padding:10px 12px;text-align:center;color:#7c3aed;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
        <th style="padding:10px 12px;text-align:right;color:#7c3aed;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Price</th>
      </tr>
      ${itemRows}
    </table>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:14px 12px;text-align:right;font-size:18px;font-weight:700;color:#7c3aed;">Total: Rs. ${total.toLocaleString()}</td>
      </tr>
    </table>
    ${sectionHeading("Payment Receipt")}
    <div style="text-align:center;margin:16px 0 8px;">
      <a href="${receiptImageUrl}" style="color:#7c3aed;font-size:14px;font-weight:500;text-decoration:underline;">View Full Size Image</a>
    </div>
    <div style="text-align:center;padding:12px;background:#f9fafb;border-radius:12px;border:2px dashed #d1d5db;">
      <img src="${receiptImageUrl}" alt="Payment receipt" style="max-width:100%;border-radius:8px;"/>
    </div>
    <div style="margin-top:28px;padding:16px 20px;background:#fef3c7;border-radius:10px;border-left:4px solid #f59e0b;">
      <p style="margin:0;color:#92400e;font-size:14px;font-weight:600;">Action Required</p>
      <p style="margin:4px 0 0;color:#92400e;font-size:13px;">Log in to the admin dashboard to verify this payment and approve or reject the order.</p>
    </div>`;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: resolveRecipient(recipient),
    subject: `New Order #${shortId} — Payment Verification Needed`,
    html: emailLayout("Payment Verification Required", body),
  });
}

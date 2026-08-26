const BRAND_GREEN = '#2D6A4F';
const BRAND_GREEN_DARK = '#245C43';

export function emailLayout(content: string, webAppUrl: string): string {
  const year = new Date().getFullYear();
  const logoUrl = `${webAppUrl}/horizontal/foodup-lockup-horizontal.png`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
</head>
<body style="margin:0;padding:0;background-color:#f0f2f0;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f2f0;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table role="presentation" width="560" cellpadding="0" cellspacing="0"
               style="max-width:560px;width:100%;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:${BRAND_GREEN};padding:24px 32px;">
              <img src="${logoUrl}" alt="FoodUp" height="34"
                   style="display:block;height:34px;border:0;outline:none;" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:36px 40px 32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f7f8f7;border-top:1px solid #e4e9e6;padding:20px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#888;line-height:1.5;">
                &copy; ${year} FoodUp &mdash; Meal management made simple
              </p>
              <p style="margin:0;font-size:12px;color:#aaa;line-height:1.5;">
                This email was sent automatically. Please do not reply to this message.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailButton(href: string, label: string): string {
  return `<a href="${href}"
   style="display:inline-block;background-color:${BRAND_GREEN};color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 28px;border-radius:6px;letter-spacing:0.01em;"
   onmouseover="this.style.backgroundColor='${BRAND_GREEN_DARK}'"
   onmouseout="this.style.backgroundColor='${BRAND_GREEN}'">${label}</a>`;
}

export function emailHeading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1a1a1a;line-height:1.3;">${text}</h1>`;
}

export function emailBody(text: string): string {
  return `<p style="margin:0 0 24px;font-size:15px;color:#4a4a4a;line-height:1.6;">${text}</p>`;
}

export function emailNote(text: string): string {
  return `<p style="margin:28px 0 0;font-size:13px;color:#999;line-height:1.5;">${text}</p>`;
}

export function emailStatusBadge(status: 'approved' | 'rejected'): string {
  const isApproved = status === 'approved';
  const bg = isApproved ? '#dcfce7' : '#fee2e2';
  const color = isApproved ? '#166534' : '#991b1b';
  const label = isApproved ? '&#10003; Approved' : '&#10007; Rejected';
  return `<div style="display:inline-block;background-color:${bg};color:${color};font-size:13px;font-weight:700;padding:5px 12px;border-radius:20px;margin-bottom:20px;letter-spacing:0.02em;">${label}</div>`;
}

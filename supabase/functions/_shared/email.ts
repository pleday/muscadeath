// Sends the order confirmation email via the Resend API (https://resend.com).
// Requires the RESEND_API_KEY secret. If it isn't set, sending is silently
// skipped (logged only) so orders can still be created/paid without email
// configured yet.
//
// Required secrets: RESEND_API_KEY, ORDER_FROM_EMAIL (see README.md).
// SITE_URL is reused (already set for create-checkout-session) to turn a
// relative logo path into an absolute URL email clients can load.
import { createClient } from 'npm:@supabase/supabase-js@2'

export interface OrderEmailItem {
  description: string | null
  quantity: number | null
  amount_total: number | null
}

interface SendOrderConfirmationInput {
  to: string
  items: OrderEmailItem[]
  amountTotalCents: number
  currency: string
}

interface Branding {
  siteName: string
  logoUrl: string | null
  primary: string
  primaryDark: string
  background: string
  surface: string
  text: string
  textMuted: string
  border: string
}

const FALLBACK_BRANDING: Branding = {
  siteName: 'Muscadeath',
  logoUrl: null,
  primary: '#b8101c',
  primaryDark: '#7a0a12',
  background: '#0a0a0b',
  surface: '#19181a',
  text: '#f2f1f0',
  textMuted: '#9c9a9d',
  border: '#2a292b',
}

/** Reads the currently published theme/logo from Supabase so the email always
 * matches whatever the admin has configured, with a safe fallback if the
 * fetch fails or nothing has been published yet. */
async function fetchBranding(): Promise<Branding> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) return FALLBACK_BRANDING

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { data, error } = await supabase.from('site_content').select('data').eq('id', 'main').single()
    if (error || !data?.data) return FALLBACK_BRANDING

    const config = data.data.config as Record<string, any> | undefined
    const theme = data.data.theme as Record<string, string> | undefined
    const siteUrl = Deno.env.get('SITE_URL') ?? ''
    let logoUrl: string | null = config?.hero?.logoImage ?? null
    if (logoUrl?.startsWith('/')) {
      // A relative path only resolves if we know the site's origin; without
      // it, skip the logo rather than send a broken image in the email.
      logoUrl = siteUrl ? `${siteUrl}${logoUrl}` : null
    }
    if (!logoUrl?.startsWith('http')) {
      // Reject data: URIs (uploaded logos): most inboxes (Gmail included)
      // strip inline base64 images, and they can bloat the email past
      // Gmail's ~102KB clipping threshold, breaking the whole layout.
      logoUrl = null
    }

    return {
      siteName: config?.meta?.siteName ?? FALLBACK_BRANDING.siteName,
      logoUrl,
      primary: theme?.primary ?? FALLBACK_BRANDING.primary,
      primaryDark: theme?.primaryDark ?? FALLBACK_BRANDING.primaryDark,
      background: theme?.background ?? FALLBACK_BRANDING.background,
      surface: theme?.surface ?? FALLBACK_BRANDING.surface,
      text: theme?.text ?? FALLBACK_BRANDING.text,
      textMuted: theme?.textMuted ?? FALLBACK_BRANDING.textMuted,
      border: theme?.border ?? FALLBACK_BRANDING.border,
    }
  } catch {
    return FALLBACK_BRANDING
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildHtml(input: SendOrderConfirmationInput, branding: Branding): string {
  const total = (input.amountTotalCents / 100).toFixed(2)
  const rows = input.items
    .map((item) => {
      const description = escapeHtml(item.description ?? 'Article')
      const quantity = item.quantity ?? 1
      const amount = ((item.amount_total ?? 0) / 100).toFixed(2)
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid ${branding.border};color:${branding.text};font-size:14px;">
            ${quantity} × ${description}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid ${branding.border};color:${branding.text};font-size:14px;text-align:right;white-space:nowrap;">
            ${amount} €
          </td>
        </tr>`
    })
    .join('')

  const logoBlock = branding.logoUrl
    ? `<img src="${branding.logoUrl}" alt="${escapeHtml(branding.siteName)}" height="48" style="height:48px;width:auto;display:block;margin:0 auto 16px;">`
    : ''

  return `
  <div style="background-color:#f4f4f5;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background-color:${branding.surface};border-radius:12px;overflow:hidden;">
      <tr>
        <td style="background-color:${branding.background};padding:32px 32px 24px;text-align:center;">
          ${logoBlock}
          <p style="margin:0;color:${branding.primary};font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
            Confirmation de précommande
          </p>
          <h1 style="margin:8px 0 0;color:${branding.text};font-size:22px;">${escapeHtml(branding.siteName)}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 32px;">
          <p style="margin:0 0 16px;color:${branding.text};font-size:15px;">
            Merci pour votre précommande ! Voici le récapitulatif :
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${rows}
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
            <tr>
              <td style="padding-top:12px;color:${branding.text};font-size:16px;font-weight:700;">Total</td>
              <td style="padding-top:12px;color:${branding.primary};font-size:16px;font-weight:700;text-align:right;">
                ${total} ${input.currency.toUpperCase()}
              </td>
            </tr>
          </table>
          <div style="margin-top:24px;padding:14px 16px;border-radius:8px;background-color:${branding.background};border:1px solid ${branding.border};">
            <p style="margin:0;color:${branding.textMuted};font-size:13px;line-height:1.5;">
              <strong style="color:${branding.text};">Retrait sur place uniquement :</strong> vos articles ne sont pas
              expédiés, ils sont à récupérer directement au stand merchandising pendant les jours du festival.
            </p>
          </div>
          <p style="margin:24px 0 0;color:${branding.textMuted};font-size:13px;">À très vite au festival !</p>
        </td>
      </tr>
    </table>
  </div>`
}

export async function sendOrderConfirmationEmail(input: SendOrderConfirmationInput): Promise<void> {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) {
    console.log('RESEND_API_KEY is not set, skipping order confirmation email.')
    return
  }
  const from = Deno.env.get('ORDER_FROM_EMAIL') ?? 'Muscadeath <onboarding@resend.dev>'
  const branding = await fetchBranding()
  const html = buildHtml(input, branding)

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: `Confirmation de votre précommande ${branding.siteName}`,
      html,
    }),
  })

  if (!response.ok) {
    console.error('Failed to send order confirmation email:', await response.text())
  }
}


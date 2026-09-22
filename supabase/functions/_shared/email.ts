// Sends the order confirmation email via the Resend API (https://resend.com).
// Requires the RESEND_API_KEY secret. If it isn't set, sending is silently
// skipped (logged only) so orders can still be created/paid without email
// configured yet.
//
// Required secrets: RESEND_API_KEY, ORDER_FROM_EMAIL (see README.md).

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

export async function sendOrderConfirmationEmail(input: SendOrderConfirmationInput): Promise<void> {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) {
    console.log('RESEND_API_KEY is not set, skipping order confirmation email.')
    return
  }
  const from = Deno.env.get('ORDER_FROM_EMAIL') ?? 'Muscadeath <onboarding@resend.dev>'

  const itemsHtml = input.items
    .map(
      (item) =>
        `<li>${item.quantity ?? 1} × ${item.description ?? 'Article'} — ${(
          (item.amount_total ?? 0) / 100
        ).toFixed(2)} €</li>`,
    )
    .join('')

  const total = (input.amountTotalCents / 100).toFixed(2)

  const html = `
    <h1>Merci pour votre précommande Muscadeath !</h1>
    <p>Voici le récapitulatif de votre commande :</p>
    <ul>${itemsHtml}</ul>
    <p><strong>Total payé : ${total} ${input.currency.toUpperCase()}</strong></p>
    <p>Vos articles sont à récupérer directement sur place, au stand merchandising,
    pendant les jours du festival. Aucune expédition n'est effectuée.</p>
    <p>À très vite au festival !</p>
  `

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: 'Confirmation de votre précommande Muscadeath',
      html,
    }),
  })

  if (!response.ok) {
    console.error('Failed to send order confirmation email:', await response.text())
  }
}

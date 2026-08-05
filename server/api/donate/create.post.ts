/**
 * AbacatePay Donation Endpoint (API v2)
 *
 * Creates a PIX checkout for a custom donation amount.
 * Uses a 1-cent product and quantity = amount in cents,
 * enabling truly arbitrary donation values.
 */

interface CreateDonationBody {
  amount: number // in cents (e.g. 500 = R$ 5,00)
  donorName?: string
  donorEmail?: string
}

// 1-cent product for variable-amount donations
const DONATION_PRODUCT_ID = 'prod_FfJLwwbByYUCnYHQQ0Z5bkBQ'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = config.abacatePayApiKey

  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'AbacatePay API key not configured',
    })
  }

  const body = await readBody<CreateDonationBody>(event)

  if (!body?.amount || body.amount < 100) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Minimum donation is R$ 1,00 (100 cents)',
    })
  }

  try {
    const response = await $fetch<{
      success: boolean
      data: { url: string; id: string; amount: number } | null
      error: string | null
    }>('https://api.abacatepay.com/v2/checkouts/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        items: [
          {
            id: DONATION_PRODUCT_ID,
            quantity: body.amount, // amount in cents = quantity of 1-cent product
          },
        ],
        methods: ['PIX', 'BOLETO'], // We only support PIX and BOLETO now, credit card was discontinued for new integrations by AbacatePay
        metadata: {
          donorName: body.donorName || 'Anonymous',
          donorEmail: body.donorEmail || '',
          source: 'piano-site',
        },
      },
    })

    if (!response.success || !response.data) {
      throw createError({
        statusCode: 502,
        statusMessage: response.error || 'AbacatePay request failed',
      })
    }

    return {
      checkoutUrl: response.data.url,
      billingId: response.data.id,
      amount: response.data.amount,
    }
  } catch (err: any) {
    // Pass through createError instances
    if (err.statusCode) throw err

    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to connect to AbacatePay',
    })
  }
})

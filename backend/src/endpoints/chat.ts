import type { Endpoint } from 'payload'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type ChatBody = {
  message?: unknown
  history?: unknown
}

type ProductSuggestion = {
  title: string
  slug: string
  price: number
  inStock: boolean
}

type RateLimitEntry = {
  count: number
  resetAt: number
}

const rateLimits = new Map<string, RateLimitEntry>()
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 10 * 60 * 1000
const MAX_MESSAGE_LENGTH = 500
const MAX_HISTORY_MESSAGES = 8

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const includesAny = (value: string, terms: string[]) => terms.some((term) => value.includes(term))

const formatPrice = (value: number) => `Rs ${Math.round(value).toLocaleString('en-PK')}`

const getClientIP = (req: { headers: Headers }) =>
  req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  req.headers.get('x-real-ip') ||
  'unknown'

function isRateLimited(identifier: string) {
  const now = Date.now()
  const current = rateLimits.get(identifier)

  if (!current || current.resetAt <= now) {
    rateLimits.set(identifier, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }

  current.count += 1
  if (rateLimits.size > 2_000) {
    for (const [key, entry] of rateLimits) {
      if (entry.resetAt <= now) rateLimits.delete(key)
    }
  }
  return current.count > RATE_LIMIT
}

function parseHistory(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return []
  return value.slice(-MAX_HISTORY_MESSAGES).flatMap<ChatMessage>((item) => {
    if (!item || typeof item !== 'object') return []
    const candidate = item as { role?: unknown; content?: unknown }
    if (
      (candidate.role !== 'user' && candidate.role !== 'assistant') ||
      typeof candidate.content !== 'string'
    ) return []
    const content = candidate.content.trim().slice(0, MAX_MESSAGE_LENGTH)
    return content ? [{ role: candidate.role, content }] : []
  })
}

async function getAIReply(input: {
  message: string
  history: ChatMessage[]
  catalogContext: string
}) {
  const apiURL = process.env.CHATBOT_API_URL
  const apiKey = process.env.CHATBOT_API_KEY
  const model = process.env.CHATBOT_MODEL
  if (!apiURL || !apiKey || !model) return null

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12_000)

  try {
    const response = await fetch(apiURL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 350,
        messages: [
          {
            role: 'system',
            content: `You are the NH EV Trader shopping assistant. Answer briefly and clearly in the same language as the customer. Use plain text only, without Markdown markers. Use only the supplied store facts and catalog. Never invent prices, stock, policies, order status, discounts, or warranties. Never request passwords, card details, OTPs, or private data. For a specific order, direct the customer to the signed-in account dashboard. If the answer is unavailable, direct them to Contact.\n\n${input.catalogContext}`,
          },
          ...input.history,
          { role: 'user', content: input.message },
        ],
      }),
    })

    if (!response.ok) return null
    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: unknown } }>
    }
    const reply = payload.choices?.[0]?.message?.content
    return typeof reply === 'string' && reply.trim() ? reply.trim().slice(0, 1_500) : null
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

export const chatEndpoint: Endpoint = {
  path: '/storefront/chat',
  method: 'post',
  handler: async (req) => {
    if (isRateLimited(getClientIP(req))) {
      return Response.json(
        { error: 'Too many messages. Please wait a few minutes and try again.' },
        { status: 429 },
      )
    }

    let body: ChatBody
    try {
      body = (await req.json?.()) as ChatBody
    } catch {
      return Response.json({ error: 'Invalid request.' }, { status: 400 })
    }

    if (typeof body?.message !== 'string') {
      return Response.json({ error: 'Please enter a message.' }, { status: 400 })
    }

    const message = body.message.trim()
    if (!message || message.length > MAX_MESSAGE_LENGTH) {
      return Response.json(
        { error: `Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters.` },
        { status: 400 },
      )
    }

    const [catalog, settings] = await Promise.all([
      req.payload.find({
        collection: 'products',
        depth: 1,
        limit: 60,
        sort: '-featured,title',
        overrideAccess: true,
        where: { status: { equals: 'active' } },
      }),
      req.payload.findGlobal({
        slug: 'site-settings',
        depth: 0,
        overrideAccess: true,
      }),
    ])

    const query = normalize(message)
    const isGreeting = ['hello', 'hlo', 'hllo', 'hi', 'hy', 'hey', 'salam', 'assalam', 'aoa'].some(
      (term) => query === term || query.startsWith(`${term} `),
    )
    const isPriceRequest = includesAny(query, [
      'price', 'prices', 'price list', 'rate', 'rates', 'cost', 'qeemat', 'kitne ka', 'kitni ki',
    ])
    const isCatalogRequest = includesAny(query, [
      'product', 'products', 'vehicle', 'vehicles', 'car', 'cars', 'charger', 'chargers',
      'accessory', 'accessories', 'recommend', 'suggest', 'available items', 'dikhao', 'batao',
    ])
    const queryTokens = query.split(' ').filter((token) => token.length > 2)
    const scored = catalog.docs
      .map((product) => {
        const category = typeof product.category === 'object' ? product.category?.name || '' : ''
        const searchable = normalize([
          product.title,
          product.shortDescription,
          category,
          ...(product.specifications || []).flatMap((item) => [item.label, item.value]),
        ].join(' '))
        const score = queryTokens.reduce(
          (total, token) => total + (searchable.includes(token) ? 1 : 0),
          0,
        ) + (query.includes(normalize(product.title)) ? 5 : 0)
        return { product, category, score }
      })
      .filter((entry) => entry.score > 0)
      .sort((first, second) => second.score - first.score)

    const suggestions: ProductSuggestion[] = scored.slice(0, 3).map(({ product }) => ({
      title: product.title,
      slug: product.slug,
      price: product.basePrice,
      inStock: (product.totalStock || 0) > 0,
    }))

    const phone = settings.supportPhone || settings.whatsappNumber
    const email = settings.supportEmail
    const contactText = [phone, email].filter(Boolean).join(' or ')
    const contactAnswer = contactText
      ? `You can contact our team at ${contactText}, or use the Contact page.`
      : 'Please use the Contact page and our team will get back to you.'

    const catalogContext = [
      `Store: ${settings.storeName}. Support: ${contactText || 'Contact page'}.`,
      `Delivery: free at ${formatPrice(settings.freeDeliveryThreshold || 500000)}; standard fee ${formatPrice(settings.standardDeliveryFee || 2500)}.`,
      process.env.PAYMENT_PROVIDER === 'manual'
        ? 'Payment: Cash on Delivery is available; online payment is not enabled yet.'
        : 'Payment: Cash on Delivery and online payment are available.',
      'Order privacy: specific order details are only available in the signed-in Account dashboard.',
      'Returns: eligibility depends on product condition and store policy; direct customers to the Returns page when details are unavailable.',
      'Warranty: coverage varies by product and supplier and must not be invented.',
      'Catalog:',
      ...catalog.docs.slice(0, 30).map((product) => {
        const category = typeof product.category === 'object' ? product.category?.name || '' : ''
        const stock = (product.totalStock || 0) > 0 ? 'in stock' : 'out of stock'
        const specifications = (product.specifications || [])
          .map((item) => `${item.label}: ${item.value}`)
          .join(', ')
        return `- ${product.title} | ${category} | ${formatPrice(product.basePrice)} | ${stock} | ${product.shortDescription} | ${specifications}`
      }),
    ].join('\n')

    const hasNamedProductMatch = catalog.docs.some((product) => {
      const titleTokens = normalize(product.title).split(' ').filter((token) => token.length >= 3)
      return titleTokens.some((token) => queryTokens.includes(token))
    })

    let reply: string | null = null
    let includeSuggestions = false
    let usedAI = false
    if (isGreeting) {
      reply = 'Hello! I can help with EV products, prices, stock, delivery, payments and store policies. What would you like to know?'
    } else if (includesAny(query, ['order status', 'track order', 'track my order', 'order track', 'mera order', 'order kahan', 'order kaha'])) {
      reply = 'For privacy, order details are only available in your signed-in Account dashboard. Open “Your orders” to view the latest status.'
    } else if (includesAny(query, ['password', 'otp', 'card number', 'cvv'])) {
      reply = 'Please do not share passwords, OTPs or card details in chat. Our team will never ask for them here.'
    } else {
      reply = await getAIReply({ message, history: parseHistory(body.history), catalogContext })
      usedAI = Boolean(reply)
    }

    if (!reply) {
      if (includesAny(query, ['return', 'refund', 'exchange', 'wapas'])) {
        reply = 'Return eligibility depends on the product condition and store policy. Please review the Returns page or contact support before sending an item back.'
      } else if (includesAny(query, ['delivery', 'shipping', 'deliver', 'courier'])) {
        reply = `Delivery is available across Pakistan where service is supported. Charges are calculated at checkout; orders of ${formatPrice(settings.freeDeliveryThreshold || 500000)} or more currently qualify for free standard delivery.`
      } else if (includesAny(query, ['payment', 'cod', 'cash on delivery', 'online pay'])) {
        reply = process.env.PAYMENT_PROVIDER === 'manual'
          ? 'Cash on Delivery is currently available. Online payment will be enabled after payment-gateway onboarding.'
          : 'Cash on Delivery and online payment are available. Final options are shown securely at checkout.'
      } else if (includesAny(query, ['warranty', 'guarantee'])) {
        reply = `Warranty coverage can vary by product and supplier. Please check the product details or contact support for written confirmation. ${contactAnswer}`
      } else if (includesAny(query, ['contact', 'support', 'phone', 'email', 'whatsapp'])) {
        reply = contactAnswer
      } else if (suggestions.length > 0) {
        const first = suggestions[0]
        reply = `${first.title} is ${formatPrice(first.price)} and is currently ${first.inStock ? 'in stock' : 'out of stock'}. I’ve added the closest matching products below.`
        includeSuggestions = true
      } else if (isCatalogRequest || isPriceRequest) {
        const categoryTerm = includesAny(query, ['charger', 'charging'])
          ? 'charger'
          : includesAny(query, ['vehicle', 'car'])
            ? 'vehicle'
            : includesAny(query, ['accessory', 'accessories'])
              ? 'access'
              : ''
        const matches = catalog.docs
          .filter((product) => {
            if (!categoryTerm) return true
            const category = typeof product.category === 'object' ? product.category?.name || '' : ''
            return normalize(category).includes(categoryTerm)
          })
          .slice(0, 3)
        suggestions.splice(0, suggestions.length, ...matches.map((product) => ({
          title: product.title,
          slug: product.slug,
          price: product.basePrice,
          inStock: (product.totalStock || 0) > 0,
        })))
        reply = suggestions.length
          ? isPriceRequest
            ? 'Here are some current prices from our catalog. Open a product to see its variants, stock and full specifications.'
            : 'Here are a few options from our current catalog. Open a product to see its variants and full specifications.'
          : 'No matching active products are available right now. Please check the Shop again soon.'
        includeSuggestions = suggestions.length > 0
      }
    }

    if (usedAI && suggestions.length > 0 && (isCatalogRequest || isPriceRequest || hasNamedProductMatch)) {
      includeSuggestions = true
    }

    return Response.json({
      reply: reply || `I don’t have a verified answer for that yet. ${contactAnswer}`,
      products: includeSuggestions ? suggestions : [],
    })
  },
}

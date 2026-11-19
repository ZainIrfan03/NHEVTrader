import { randomUUID } from 'node:crypto'
import type { Endpoint } from 'payload'

type CheckoutLine = {
  productId: string
  variantCode: string
  quantity: number
}

type CheckoutBody = {
  customerName: string
  customerEmail: string
  customerPhone: string
  addressLine1: string
  addressLine2?: string
  city: string
  province: string
  postalCode?: string
  paymentMethod: 'cod' | 'online'
  notes?: string
  items: CheckoutLine[]
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

export const checkoutEndpoint: Endpoint = {
  path: '/storefront/checkout',
  method: 'post',
  handler: async (req) => {
    if (req.user?.collection !== 'customers') {
      return Response.json({ error: 'Please sign in before checking out.' }, { status: 401 })
    }

    const body = (await req.json?.()) as Partial<CheckoutBody>

    if (
      !isNonEmptyString(body.customerName) ||
      !isNonEmptyString(body.customerEmail) ||
      !isNonEmptyString(body.customerPhone) ||
      !isNonEmptyString(body.addressLine1) ||
      !isNonEmptyString(body.city) ||
      !isNonEmptyString(body.province) ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return Response.json({ error: 'Required checkout information is missing.' }, { status: 400 })
    }

    if (body.paymentMethod !== 'cod' && body.paymentMethod !== 'online') {
      return Response.json({ error: 'Unsupported payment method.' }, { status: 400 })
    }

    if (body.paymentMethod === 'online' && process.env.PAYMENT_PROVIDER === 'manual') {
      return Response.json(
        { error: 'Online payments will be enabled after payment-gateway onboarding.' },
        { status: 503 },
      )
    }

    const validatedItems = []
    let subtotal = 0

    for (const requestedItem of body.items) {
      if (
        !isNonEmptyString(requestedItem.productId) ||
        !isNonEmptyString(requestedItem.variantCode) ||
        !Number.isInteger(requestedItem.quantity) ||
        requestedItem.quantity < 1 ||
        requestedItem.quantity > 20
      ) {
        return Response.json({ error: 'One or more cart items are invalid.' }, { status: 400 })
      }

      const product = await req.payload.findByID({
        collection: 'products',
        id: requestedItem.productId,
        depth: 0,
        overrideAccess: true,
      })

      if (product.status !== 'active') {
        return Response.json({ error: `${product.title} is not available.` }, { status: 409 })
      }

      const variant = product.variants?.find((item) => item.code === requestedItem.variantCode)
      if (!variant?.active || (variant.stock || 0) < requestedItem.quantity) {
        return Response.json(
          { error: `Requested stock is unavailable for ${product.title}.` },
          { status: 409 },
        )
      }

      const unitPrice = product.basePrice + (variant.priceAdjustment || 0)
      const lineTotal = unitPrice * requestedItem.quantity
      subtotal += lineTotal
      validatedItems.push({
        product,
        variant,
        quantity: requestedItem.quantity,
        unitPrice,
        lineTotal,
      })
    }

    const settings = await req.payload.findGlobal({
      slug: 'site-settings',
      depth: 0,
      overrideAccess: true,
    })
    const deliveryFee = subtotal >= (settings.freeDeliveryThreshold || 500000)
      ? 0
      : settings.standardDeliveryFee || 2500
    const grandTotal = subtotal + deliveryFee
    const customer = req.user?.collection === 'customers' ? req.user.id : undefined
    const orderNumber = `NH-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomUUID().slice(0, 8).toUpperCase()}`

    const order = await req.payload.create({
      collection: 'orders',
      overrideAccess: true,
      data: {
        orderNumber,
        customer,
        customerName: body.customerName.trim(),
        customerEmail: body.customerEmail.trim().toLowerCase(),
        customerPhone: body.customerPhone.trim(),
        items: validatedItems.map(({ product, variant, quantity, unitPrice, lineTotal }) => ({
          product: product.id,
          productName: product.title,
          variantCode: variant.code,
          variantLabel: `${variant.label}: ${variant.value}`,
          quantity,
          unitPrice,
          lineTotal,
        })),
        subtotal,
        deliveryFee,
        grandTotal,
        shippingAddress: {
          addressLine1: body.addressLine1.trim(),
          addressLine2: body.addressLine2?.trim(),
          city: body.city.trim(),
          province: body.province.trim(),
          postalCode: body.postalCode?.trim(),
        },
        paymentMethod: body.paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'pending',
        customerNotes: body.notes?.trim(),
      },
    })

    for (const { product, variant, quantity } of validatedItems) {
      const variants = (product.variants || []).map((item) =>
        item.code === variant.code ? { ...item, stock: Math.max(0, (item.stock || 0) - quantity) } : item,
      )
      await req.payload.update({
        collection: 'products',
        id: product.id,
        overrideAccess: true,
        data: { variants },
      })
      await req.payload.create({
        collection: 'inventory-logs',
        overrideAccess: true,
        data: {
          product: product.id,
          variantCode: variant.code,
          quantityChange: -quantity,
          reason: 'sale',
          order: order.id,
          note: `Reserved by ${orderNumber}`,
        },
      })
    }

    return Response.json(
      {
        order: {
          id: order.id,
          orderNumber,
          subtotal,
          deliveryFee,
          grandTotal,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
        },
      },
      { status: 201 },
    )
  },
}

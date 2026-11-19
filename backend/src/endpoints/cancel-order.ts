import type { Endpoint } from 'payload'

type CancelOrderBody = {
  orderId?: unknown
}

const relationshipID = (value: unknown): string | null => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    return typeof id === 'string' ? id : null
  }
  return null
}

export const cancelOrderEndpoint: Endpoint = {
  path: '/storefront/orders/cancel',
  method: 'post',
  handler: async (req) => {
    if (req.user?.collection !== 'customers') {
      return Response.json({ error: 'Please sign in to cancel an order.' }, { status: 401 })
    }

    const body = (await req.json?.()) as CancelOrderBody
    if (typeof body.orderId !== 'string' || !body.orderId.trim()) {
      return Response.json({ error: 'A valid order is required.' }, { status: 400 })
    }

    try {
      const order = await req.payload.findByID({
        collection: 'orders',
        id: body.orderId,
        depth: 0,
        overrideAccess: true,
      })

      if (relationshipID(order.customer) !== req.user.id) {
        return Response.json({ error: 'You cannot cancel this order.' }, { status: 403 })
      }

      if (order.orderStatus === 'cancelled') {
        return Response.json({ order })
      }

      if (!['pending', 'confirmed'].includes(order.orderStatus)) {
        return Response.json(
          { error: 'This order has already entered fulfilment and can no longer be cancelled online.' },
          { status: 409 },
        )
      }

      if (order.paymentStatus === 'paid') {
        return Response.json(
          { error: 'Please contact support to cancel and refund this paid order.' },
          { status: 409 },
        )
      }

      const cancelledOrder = await req.payload.update({
        collection: 'orders',
        id: order.id,
        overrideAccess: true,
        data: { orderStatus: 'cancelled' },
      })

      for (const item of order.items || []) {
        const productID = relationshipID(item.product)
        if (!productID) continue

        const product = await req.payload.findByID({
          collection: 'products',
          id: productID,
          depth: 0,
          overrideAccess: true,
        })
        const variants = (product.variants || []).map((variant) =>
          variant.code === item.variantCode
            ? { ...variant, stock: Math.max(0, variant.stock || 0) + item.quantity }
            : variant,
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
            variantCode: item.variantCode,
            quantityChange: item.quantity,
            reason: 'correction',
            order: order.id,
            note: `Stock restored after customer cancellation of ${order.orderNumber}`,
          },
        })
      }

      return Response.json({ order: cancelledOrder })
    } catch {
      return Response.json({ error: 'Order could not be cancelled.' }, { status: 404 })
    }
  },
}

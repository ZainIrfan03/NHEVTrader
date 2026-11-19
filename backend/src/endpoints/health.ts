import type { Endpoint } from 'payload'

export const healthEndpoint: Endpoint = {
  path: '/health',
  method: 'get',
  handler: async (req) => {
    await req.payload.count({ collection: 'products', overrideAccess: true })
    return Response.json({ status: 'ok', service: 'nh-ev-trader-backend' })
  },
}

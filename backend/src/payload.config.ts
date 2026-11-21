import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Admins } from '@/collections/Admins'
import { Banners } from '@/collections/Banners'
import { Categories } from '@/collections/Categories'
import { Customers } from '@/collections/Customers'
import { InventoryLogs } from '@/collections/InventoryLogs'
import { Inquiries } from '@/collections/Inquiries'
import { Media } from '@/collections/Media'
import { Orders } from '@/collections/Orders'
import { Pages } from '@/collections/Pages'
import { Products } from '@/collections/Products'
import { checkoutEndpoint } from '@/endpoints/checkout'
import { cancelOrderEndpoint } from '@/endpoints/cancel-order'
import { chatEndpoint } from '@/endpoints/chat'
import { healthEndpoint } from '@/endpoints/health'
import { Homepage } from '@/globals/Homepage'
import { SiteSettings } from '@/globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000'

export default buildConfig({
  serverURL,
  admin: {
    user: Admins.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: '— NH EV Trader',
    },
  },
  cors: [frontendURL, serverURL],
  csrf: [frontendURL, serverURL],
  collections: [
    Admins,
    Customers,
    Categories,
    Products,
    Media,
    Orders,
    InventoryLogs,
    Inquiries,
    Banners,
    Pages,
  ],
  globals: [Homepage, SiteSettings],
  endpoints: [healthEndpoint, checkoutEndpoint, cancelOrderEndpoint, chatEndpoint],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'development-only-change-this-secret',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/nh-ev-trader',
  }),
  sharp,
})

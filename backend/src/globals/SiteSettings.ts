import type { GlobalConfig } from 'payload'
import { publicRead, staffOnly } from '@/access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: { group: 'Content' },
  access: { read: publicRead, update: staffOnly },
  fields: [
    { name: 'storeName', type: 'text', required: true, defaultValue: 'NH EV Trader' },
    { name: 'supportPhone', type: 'text' },
    { name: 'supportEmail', type: 'email' },
    { name: 'whatsappNumber', type: 'text' },
    { name: 'address', type: 'textarea' },
    { name: 'freeDeliveryThreshold', type: 'number', min: 0, defaultValue: 500000 },
    { name: 'standardDeliveryFee', type: 'number', min: 0, defaultValue: 2500 },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        { name: 'platform', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
}

import type { GlobalConfig } from 'payload'
import { publicRead, staffOnly } from '@/access'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  admin: { group: 'Content' },
  access: { read: publicRead, update: staffOnly },
  fields: [
    {
      name: 'heroBanners',
      type: 'relationship',
      relationTo: 'banners',
      hasMany: true,
    },
    {
      name: 'featuredProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
    },
    { name: 'featuredHeading', type: 'text', defaultValue: 'Featured electric vehicles' },
    { name: 'featuredDescription', type: 'textarea' },
  ],
}

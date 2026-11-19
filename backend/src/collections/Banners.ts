import type { CollectionConfig } from 'payload'
import { publicRead, staffOnly } from '@/access'

export const Banners: CollectionConfig = {
  slug: 'banners',
  admin: { useAsTitle: 'title', group: 'Content' },
  access: { create: staffOnly, delete: staffOnly, read: publicRead, update: staffOnly },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'eyebrow', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'buttonLabel', type: 'text' },
    { name: 'buttonURL', type: 'text' },
    { name: 'active', type: 'checkbox', defaultValue: true, index: true },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
    { name: 'startsAt', type: 'date' },
    { name: 'endsAt', type: 'date' },
  ],
}

import type { CollectionConfig } from 'payload'
import { publicRead, staffOnly } from '@/access'
import { slugify } from '@/lib/slugify'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: { useAsTitle: 'name', group: 'Catalog', defaultColumns: ['name', 'slug', 'active'] },
  access: { create: staffOnly, delete: staffOnly, read: publicRead, update: staffOnly },
  hooks: {
    beforeValidate: [({ data }) => {
      if (data?.name && !data.slug) data.slug = slugify(data.name)
      return data
    }],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'description', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'active', type: 'checkbox', defaultValue: true, index: true },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
  ],
}

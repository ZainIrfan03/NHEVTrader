import type { CollectionConfig } from 'payload'
import { publicRead, staffOnly } from '@/access'
import { slugify } from '@/lib/slugify'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'title', group: 'Content' },
  access: { create: staffOnly, delete: staffOnly, read: publicRead, update: staffOnly },
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: {
    beforeValidate: [({ data }) => {
      if (data?.title && !data.slug) data.slug = slugify(data.title)
      return data
    }],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'heroTitle', type: 'text' },
    { name: 'heroDescription', type: 'textarea' },
    { name: 'content', type: 'richText', required: true },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', maxLength: 60 },
        { name: 'description', type: 'textarea', maxLength: 160 },
      ],
    },
  ],
}

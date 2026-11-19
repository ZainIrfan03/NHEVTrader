import type { CollectionConfig } from 'payload'
import { publicRead, staffOnly } from '@/access'
import { slugify } from '@/lib/slugify'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    group: 'Catalog',
    defaultColumns: ['title', 'category', 'basePrice', 'totalStock', 'status'],
  },
  access: { create: staffOnly, delete: staffOnly, read: publicRead, update: staffOnly },
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: {
    beforeValidate: [({ data }) => {
      if (data?.title && !data.slug) data.slug = slugify(data.title)
      if (data?.variants) {
        data.totalStock = data.variants.reduce(
          (total: number, variant: { stock?: number }) => total + Math.max(0, variant.stock || 0),
          0,
        )
      }
      return data
    }],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      required: true,
      index: true,
      options: ['active', 'archived'],
    },
    { name: 'category', type: 'relationship', relationTo: 'categories', required: true, index: true },
    { name: 'shortDescription', type: 'textarea', required: true },
    { name: 'description', type: 'richText', required: true },
    { name: 'basePrice', type: 'number', required: true, min: 0, index: true },
    { name: 'compareAtPrice', type: 'number', min: 0 },
    { name: 'sku', type: 'text', required: true, unique: true, index: true },
    { name: 'featured', type: 'checkbox', defaultValue: false, index: true },
    {
      name: 'images',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'alt', type: 'text' },
      ],
    },
    {
      name: 'variants',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'code', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
        { name: 'priceAdjustment', type: 'number', defaultValue: 0 },
        { name: 'stock', type: 'number', required: true, min: 0, defaultValue: 0 },
        { name: 'active', type: 'checkbox', defaultValue: true },
      ],
    },
    { name: 'totalStock', type: 'number', defaultValue: 0, min: 0, admin: { readOnly: true } },
    {
      name: 'specifications',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
      ],
    },
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

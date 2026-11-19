import type { CollectionConfig } from 'payload'
import { staffOnly } from '@/access'

export const InventoryLogs: CollectionConfig = {
  slug: 'inventory-logs',
  admin: { useAsTitle: 'variantCode', group: 'Catalog' },
  access: { create: staffOnly, delete: staffOnly, read: staffOnly, update: () => false },
  fields: [
    { name: 'product', type: 'relationship', relationTo: 'products', required: true, index: true },
    { name: 'variantCode', type: 'text', required: true },
    { name: 'quantityChange', type: 'number', required: true },
    {
      name: 'reason',
      type: 'select',
      required: true,
      options: ['sale', 'restock', 'return', 'correction'],
    },
    { name: 'order', type: 'relationship', relationTo: 'orders' },
    { name: 'note', type: 'textarea' },
  ],
}

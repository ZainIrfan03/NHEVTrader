import type { CollectionConfig } from 'payload'
import { staffOnly } from '@/access'

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  admin: {
    useAsTitle: 'email',
    group: 'Sales',
    defaultColumns: ['name', 'email', 'phone', 'status', 'createdAt'],
  },
  access: {
    create: () => true,
    delete: staffOnly,
    read: staffOnly,
    update: staffOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'phone', type: 'text', required: true },
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'message', type: 'textarea', required: true, minLength: 10, maxLength: 3000 },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: ['new', 'contacted', 'closed'],
      index: true,
    },
  ],
}

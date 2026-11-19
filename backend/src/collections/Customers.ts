import type { CollectionConfig } from 'payload'
import { ownCustomerRecord, staffOnly } from '@/access'

export const Customers: CollectionConfig = {
  slug: 'customers',
  auth: true,
  admin: {
    useAsTitle: 'name',
    group: 'Sales',
  },
  access: {
    admin: ({ req: { user } }) => user?.collection === 'admins',
    create: () => true,
    delete: staffOnly,
    read: ownCustomerRecord,
    update: ownCustomerRecord,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'phone', type: 'text', required: true },
    {
      name: 'addresses',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', defaultValue: 'Home' },
        { name: 'recipientName', type: 'text', required: true },
        { name: 'phone', type: 'text', required: true },
        { name: 'addressLine1', type: 'text', required: true },
        { name: 'addressLine2', type: 'text' },
        { name: 'city', type: 'text', required: true },
        { name: 'province', type: 'text', required: true },
        { name: 'postalCode', type: 'text' },
        { name: 'isDefault', type: 'checkbox', defaultValue: false },
      ],
    },
  ],
}

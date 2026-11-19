import type { CollectionConfig } from 'payload'
import { adminOnly, staffOnly } from '@/access'

export const Admins: CollectionConfig = {
  slug: 'admins',
  auth: true,
  admin: {
    useAsTitle: 'name',
    group: 'Administration',
  },
  access: {
    admin: ({ req: { user } }) => user?.collection === 'admins',
    create: ({ req: { user } }) => !user || (user.collection === 'admins' && user.role === 'admin'),
    delete: adminOnly,
    read: staffOnly,
    update: staffOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'manager',
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Store Manager', value: 'manager' },
      ],
      access: {
        update: ({ req: { user } }) => user?.collection === 'admins' && user.role === 'admin',
      },
    },
  ],
}

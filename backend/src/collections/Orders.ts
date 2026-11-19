import type { CollectionConfig } from 'payload'
import { ownOrders, staffOnly } from '@/access'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    group: 'Sales',
    defaultColumns: ['orderNumber', 'customerEmail', 'grandTotal', 'orderStatus', 'createdAt'],
  },
  access: {
    create: staffOnly,
    delete: staffOnly,
    read: ownOrders,
    update: staffOnly,
  },
  fields: [
    { name: 'orderNumber', type: 'text', required: true, unique: true, index: true },
    { name: 'customer', type: 'relationship', relationTo: 'customers', index: true },
    { name: 'customerName', type: 'text', required: true },
    { name: 'customerEmail', type: 'email', required: true, index: true },
    { name: 'customerPhone', type: 'text', required: true },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products', required: true },
        { name: 'productName', type: 'text', required: true },
        { name: 'variantCode', type: 'text', required: true },
        { name: 'variantLabel', type: 'text', required: true },
        { name: 'quantity', type: 'number', required: true, min: 1 },
        { name: 'unitPrice', type: 'number', required: true, min: 0 },
        { name: 'lineTotal', type: 'number', required: true, min: 0 },
      ],
    },
    { name: 'subtotal', type: 'number', required: true, min: 0 },
    { name: 'deliveryFee', type: 'number', required: true, min: 0, defaultValue: 0 },
    { name: 'grandTotal', type: 'number', required: true, min: 0 },
    {
      name: 'shippingAddress',
      type: 'group',
      fields: [
        { name: 'addressLine1', type: 'text', required: true },
        { name: 'addressLine2', type: 'text' },
        { name: 'city', type: 'text', required: true },
        { name: 'province', type: 'text', required: true },
        { name: 'postalCode', type: 'text' },
      ],
    },
    {
      name: 'paymentMethod',
      type: 'select',
      required: true,
      options: [
        { label: 'Cash on Delivery', value: 'cod' },
        { label: 'Online Payment', value: 'online' },
      ],
    },
    {
      name: 'paymentStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: ['pending', 'paid', 'failed', 'refunded'],
    },
    { name: 'paymentReference', type: 'text' },
    {
      name: 'orderStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    },
    { name: 'customerNotes', type: 'textarea' },
    {
      name: 'internalNotes',
      type: 'textarea',
      access: {
        read: ({ req: { user } }) => user?.collection === 'admins',
        update: ({ req: { user } }) => user?.collection === 'admins',
      },
    },
  ],
}

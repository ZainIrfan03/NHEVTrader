import type { Access } from 'payload'

export const publicRead: Access = () => true

export const authenticated: Access = ({ req: { user } }) => Boolean(user)

export const staffOnly: Access = ({ req: { user } }) => {
  return user?.collection === 'admins'
}

export const adminOnly: Access = ({ req: { user } }) => {
  return user?.collection === 'admins' && user.role === 'admin'
}

export const adminOrOwnStaffRecord: Access = ({ req: { user } }) => {
  if (!user || user.collection !== 'admins') return false
  if (user.role === 'admin') return true
  return { id: { equals: user.id } }
}

export const ownCustomerRecord: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.collection === 'admins') return true
  if (user.collection === 'customers') return { id: { equals: user.id } }
  return false
}

export const ownOrders: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.collection === 'admins') return true
  if (user.collection === 'customers') return { customer: { equals: user.id } }
  return false
}

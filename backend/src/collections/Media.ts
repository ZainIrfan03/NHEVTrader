import type { CollectionConfig } from 'payload'
import { publicRead, staffOnly } from '@/access'
import { deleteImage, isCloudinaryConfigured, uploadImage } from '@/lib/cloudinary'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
    useAsTitle: 'alt',
  },
  access: {
    create: staffOnly,
    delete: staffOnly,
    read: publicRead,
    update: staffOnly,
  },
  upload: {
    disableLocalStorage: isCloudinaryConfigured,
    mimeTypes: ['image/*'],
    adminThumbnail: ({ doc }) =>
      typeof doc.cloudinaryURL === 'string'
        ? doc.cloudinaryURL
        : typeof doc.url === 'string'
          ? doc.url
          : false,
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (!isCloudinaryConfigured || !req.file?.data) return data
        const uploaded = await uploadImage(req.file.data, req.file.name)
        return {
          ...data,
          cloudinaryPublicId: uploaded.public_id,
          cloudinaryURL: uploaded.secure_url,
          width: uploaded.width,
          height: uploaded.height,
        }
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        if (doc.cloudinaryPublicId) await deleteImage(doc.cloudinaryPublicId)
      },
    ],
  },
  fields: [
    { name: 'alt', type: 'text', required: true },
    { name: 'cloudinaryURL', type: 'text', admin: { readOnly: true } },
    { name: 'cloudinaryPublicId', type: 'text', admin: { readOnly: true } },
  ],
}

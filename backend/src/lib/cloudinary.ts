import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'

export const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
)

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

export const uploadImage = (buffer: Buffer, filename: string): Promise<UploadApiResponse> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || 'nh-ev-trader',
        public_id: filename.replace(/\.[^.]+$/, ''),
        overwrite: false,
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) reject(error || new Error('Cloudinary upload failed.'))
        else resolve(result)
      },
    )
    stream.end(buffer)
  })

export const deleteImage = async (publicId: string): Promise<void> => {
  if (!isCloudinaryConfigured) return
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
}

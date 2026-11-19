import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import config from './payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const imageDirectory = path.resolve(dirname, '../../frontend/public/images')

const richText = (text: string) => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text,
            version: 1,
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        textFormat: 0,
        version: 1,
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

const categorySeeds = [
  { name: 'Vehicles', slug: 'vehicles', description: 'Electric vehicles selected for modern Pakistan.', sortOrder: 1 },
  { name: 'Chargers', slug: 'chargers', description: 'Reliable home and travel charging equipment.', sortOrder: 2 },
  { name: 'Accessories', slug: 'accessories', description: 'Practical EV cables, safety and road essentials.', sortOrder: 3 },
]

const productSeeds = [
  {
    title: 'Nova E5 Crossover',
    slug: 'nova-e5-crossover',
    category: 'vehicles',
    image: 'hero-ev.png',
    sku: 'NH-NOVA-E5',
    basePrice: 8950000,
    shortDescription: 'A refined all-electric crossover configured for everyday city driving and comfortable motorway travel.',
    featured: true,
    specifications: [
      { label: 'Range', value: '430 km' },
      { label: 'Battery', value: '64 kWh' },
      { label: '0–100', value: '7.2 sec' },
    ],
    variants: [
      { code: 'pearl-white', label: 'Finish', value: 'Pearl White', priceAdjustment: 0, stock: 4, active: true },
      { code: 'midnight-blue', label: 'Finish', value: 'Midnight Blue', priceAdjustment: 125000, stock: 3, active: true },
      { code: 'graphite', label: 'Finish', value: 'Graphite', priceAdjustment: 0, stock: 0, active: true },
    ],
  },
  {
    title: 'Volt Home 7kW Charger',
    slug: 'volt-home-7kw-charger',
    category: 'chargers',
    image: 'product-home-charger.png',
    sku: 'NH-VOLT-7KW',
    basePrice: 245000,
    compareAtPrice: 275000,
    shortDescription: 'A compact wall-mounted AC charger with scheduled charging and essential safety protection.',
    featured: true,
    specifications: [
      { label: 'Output', value: '7 kW' },
      { label: 'Cable', value: '5 m' },
      { label: 'Protection', value: 'IP65' },
    ],
    variants: [
      { code: '5m-cable', label: 'Cable', value: '5 metre', priceAdjustment: 0, stock: 12, active: true },
      { code: '7m-cable', label: 'Cable', value: '7 metre', priceAdjustment: 18000, stock: 8, active: true },
    ],
  },
  {
    title: 'Type 2 Travel Cable',
    slug: 'type-2-travel-cable',
    category: 'accessories',
    image: 'product-type2-cable.png',
    sku: 'NH-TYPE2-32A',
    basePrice: 68500,
    shortDescription: 'A durable Type 2 charging cable supplied with a protective carry case for daily use.',
    featured: true,
    specifications: [
      { label: 'Length', value: '5 m' },
      { label: 'Current', value: '32 A' },
      { label: 'Phase', value: 'Single' },
    ],
    variants: [
      { code: '5m-32a', label: 'Length', value: '5 metre', priceAdjustment: 0, stock: 18, active: true },
      { code: '7m-32a', label: 'Length', value: '7 metre', priceAdjustment: 12000, stock: 9, active: true },
    ],
  },
  {
    title: 'EV Emergency Kit',
    slug: 'ev-emergency-kit',
    category: 'accessories',
    image: 'product-emergency-kit.png',
    sku: 'NH-EV-KIT-12',
    basePrice: 24900,
    shortDescription: 'A compact roadside essentials pack designed to live neatly in your vehicle boot.',
    featured: false,
    specifications: [
      { label: 'Pieces', value: '12' },
      { label: 'Case', value: 'Hard shell' },
      { label: 'Weight', value: '2.1 kg' },
    ],
    variants: [
      { code: 'standard-kit', label: 'Kit', value: 'Standard 12-piece', priceAdjustment: 0, stock: 0, active: true },
    ],
  },
]

async function seed() {
  const payload = await getPayload({ config })
  const categoryIds = new Map<string, string>()

  for (const category of categorySeeds) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: category.slug } },
      limit: 1,
      overrideAccess: true,
    })
    const document = existing.docs[0] || await payload.create({
      collection: 'categories',
      overrideAccess: true,
      data: { ...category, active: true },
    })
    categoryIds.set(category.slug, document.id)
  }

  for (const product of productSeeds) {
    const existing = await payload.find({
      collection: 'products',
      where: { slug: { equals: product.slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.docs.length) {
      payload.logger.info(`Skipped existing product: ${product.title}`)
      continue
    }

    const media = await payload.create({
      collection: 'media',
      overrideAccess: true,
      filePath: path.join(imageDirectory, product.image),
      data: { alt: product.title },
    })
    await payload.create({
      collection: 'products',
      overrideAccess: true,
      draft: false,
      data: {
        title: product.title,
        slug: product.slug,
        status: 'active',
        category: categoryIds.get(product.category)!,
        shortDescription: product.shortDescription,
        description: richText(product.shortDescription),
        basePrice: product.basePrice,
        compareAtPrice: product.compareAtPrice,
        sku: product.sku,
        featured: product.featured,
        images: [{ image: media.id, alt: product.title }],
        variants: product.variants,
        specifications: product.specifications,
        _status: 'published',
      },
    })
    payload.logger.info(`Created product: ${product.title}`)
  }

  payload.logger.info('NH EV Trader development catalog is ready.')
  process.exit(0)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})

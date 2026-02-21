const PRINTFUL_API_URL = "https://api.printful.com"

export interface PrintfulProduct {
  id: number
  name: string
  variants: PrintfulVariant[]
}

export interface PrintfulVariant {
  id: number
  name: string
  size: string
  color: string
  price: number
  inStock: boolean
}

export interface ShippingAddress {
  name: string
  address1: string
  address2?: string
  city: string
  state: string
  zip: string
  country: string
  email: string
  phone?: string
}

// Get all products
export async function getProducts(): Promise<PrintfulProduct[]> {
  const response = await fetch(`${PRINTFUL_API_URL}/store/products`, {
    headers: {
      Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch products")
  }

  const data = await response.json()
  return data.result
}

// Get product details with variants
export async function getProductVariants(productId: number): Promise<PrintfulVariant[]> {
  const response = await fetch(`${PRINTFUL_API_URL}/store/products/${productId}`, {
    headers: {
      Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch product variants")
  }

  const data = await response.json()
  return data.result.sync_variants.map((v: any) => ({
    id: v.id,
    name: v.name,
    size: v.size,
    color: v.color,
    price: parseFloat(v.retail_price),
    inStock: v.in_stock,
  }))
}

// Calculate shipping costs
export async function calculateShipping(
  items: { variantId: number; quantity: number }[],
  address: ShippingAddress
) {
  const response = await fetch(`${PRINTFUL_API_URL}/shipping/rates`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipient: {
        address1: address.address1,
        city: address.city,
        country_code: address.country,
        state_code: address.state,
        zip: address.zip,
      },
      items: items.map((item) => ({
        variant_id: item.variantId,
        quantity: item.quantity,
      })),
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to calculate shipping")
  }

  const data = await response.json()
  return data.result
}

// Create order
export async function createOrder(
  items: { variantId: number; quantity: number; imageUrl: string }[],
  address: ShippingAddress,
  options?: {
    externalId?: string
    retailCosts?: { subtotal: number; shipping: number; total: number }
  }
) {
  const response = await fetch(`${PRINTFUL_API_URL}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_id: options?.externalId,
      shipping: "STANDARD",
      recipient: {
        name: address.name,
        address1: address.address1,
        address2: address.address2,
        city: address.city,
        state_code: address.state,
        country_code: address.country,
        zip: address.zip,
        email: address.email,
        phone: address.phone,
      },
      items: items.map((item) => ({
        variant_id: item.variantId,
        quantity: item.quantity,
        files: [
          {
            url: item.imageUrl,
          },
        ],
      })),
      retail_costs: options?.retailCosts,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create order: ${error}`)
  }

  const data = await response.json()
  return data.result
}

// Get order status
export async function getOrderStatus(orderId: number) {
  const response = await fetch(`${PRINTFUL_API_URL}/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch order status")
  }

  const data = await response.json()
  return data.result
}

// Mock products for development (if no Printful API key)
export const MOCK_PRODUCTS: PrintfulProduct[] = [
  {
    id: 1,
    name: "Canvas Print",
    variants: [
      { id: 101, name: "8×10 inch", size: "8×10", color: "White", price: 29.99, inStock: true },
      { id: 102, name: "12×16 inch", size: "12×16", color: "White", price: 49.99, inStock: true },
      { id: 103, name: "16×20 inch", size: "16×20", color: "White", price: 69.99, inStock: true },
      { id: 104, name: "24×36 inch", size: "24×36", color: "White", price: 99.99, inStock: true },
    ],
  },
  {
    id: 2,
    name: "Framed Print",
    variants: [
      { id: 201, name: "8×10 Black Frame", size: "8×10", color: "Black", price: 49.99, inStock: true },
      { id: 202, name: "11×14 Black Frame", size: "11×14", color: "Black", price: 69.99, inStock: true },
      { id: 203, name: "16×20 Black Frame", size: "16×20", color: "Black", price: 99.99, inStock: true },
      { id: 204, name: "8×10 White Frame", size: "8×10", color: "White", price: 49.99, inStock: true },
      { id: 205, name: "11×14 White Frame", size: "11×14", color: "White", price: 69.99, inStock: true },
      { id: 206, name: "16×20 White Frame", size: "16×20", color: "White", price: 99.99, inStock: true },
    ],
  },
  {
    id: 3,
    name: "Poster",
    variants: [
      { id: 301, name: '12×18 inch', size: "12×18", color: "Matte", price: 19.99, inStock: true },
      { id: 302, name: '18×24 inch', size: "18×24", color: "Matte", price: 29.99, inStock: true },
      { id: 303, name: '24×36 inch', size: "24×36", color: "Matte", price: 39.99, inStock: true },
      { id: 304, name: '12×18 inch Glossy', size: "12×18", color: "Glossy", price: 22.99, inStock: true },
    ],
  },
  {
    id: 4,
    name: "Coffee Mug",
    variants: [
      { id: 401, name: "11oz White", size: "11oz", color: "White", price: 14.99, inStock: true },
      { id: 402, name: "15oz White", size: "15oz", color: "White", price: 18.99, inStock: true },
      { id: 403, name: "11oz Black", size: "11oz", color: "Black", price: 16.99, inStock: true },
    ],
  },
  {
    id: 5,
    name: "T-Shirt",
    variants: [
      { id: 501, name: "S Black", size: "S", color: "Black", price: 24.99, inStock: true },
      { id: 502, name: "M Black", size: "M", color: "Black", price: 24.99, inStock: true },
      { id: 503, name: "L Black", size: "L", color: "Black", price: 24.99, inStock: true },
      { id: 504, name: "XL Black", size: "XL", color: "Black", price: 26.99, inStock: true },
      { id: 505, name: "S White", size: "S", color: "White", price: 24.99, inStock: true },
      { id: 506, name: "M White", size: "M", color: "White", price: 24.99, inStock: true },
      { id: 507, name: "L White", size: "L", color: "White", price: 24.99, inStock: true },
    ],
  },
  {
    id: 6,
    name: "Phone Case",
    variants: [
      { id: 601, name: "iPhone 14", size: "iPhone 14", color: "Clear", price: 19.99, inStock: true },
      { id: 602, name: "iPhone 14 Pro", size: "iPhone 14 Pro", color: "Clear", price: 19.99, inStock: true },
      { id: 603, name: "iPhone 14 Pro Max", size: "iPhone 14 Pro Max", color: "Clear", price: 21.99, inStock: true },
      { id: 604, name: "Samsung S23", size: "Samsung S23", color: "Clear", price: 19.99, inStock: true },
    ],
  },
]

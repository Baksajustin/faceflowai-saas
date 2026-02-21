import { NextResponse } from "next/server"
import { getProducts, MOCK_PRODUCTS } from "@/lib/printful"

export async function GET() {
  try {
    // Use mock products if no API key (development)
    if (!process.env.PRINTFUL_API_KEY) {
      return NextResponse.json({ products: MOCK_PRODUCTS })
    }

    const products = await getProducts()
    return NextResponse.json({ products })
  } catch (error: any) {
    console.error("Printful products error:", error)
    // Fallback to mock products on error
    return NextResponse.json({ products: MOCK_PRODUCTS })
  }
}

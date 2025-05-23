import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const response = await fetch(`${API_URL}/api/products?${searchParams.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 
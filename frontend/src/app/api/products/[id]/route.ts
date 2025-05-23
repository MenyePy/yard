import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_URL}/api/products/${params.id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { message: 'Product not found' },
          { status: 404 }
        );
      }
      throw new Error('Failed to fetch product');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { message: 'Failed to fetch product' },
      { status: 500 }
    );
  }
} 
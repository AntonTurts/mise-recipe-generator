import { NextResponse } from 'next/server';
import { categories, allIngredients } from '../../../data/ingredients';

export async function GET() {
  try {
    return NextResponse.json({
      categories,
      ingredients: allIngredients
    });
  } catch (error) {
    console.error('Error in ingredients API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
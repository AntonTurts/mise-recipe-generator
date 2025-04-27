import { NextResponse } from 'next/server';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Recipe } from '../../../lib/types';

export async function GET() {
  try {
    console.log('API: Fetching recent recipes');
    // Get recent recipes from Firestore
    const recipesQuery = query(
      collection(db, 'recipes'), 
      orderBy('createdAt', 'desc'), 
      limit(10)
    );
    
    const querySnapshot = await getDocs(recipesQuery);
    const recipes: Recipe[] = [];
    
    querySnapshot.forEach((doc) => {
      recipes.push({ id: doc.id, ...doc.data() } as Recipe);
    });
    
    console.log(`API: Found ${recipes.length} recent recipes`);
    return NextResponse.json(recipes);
  } catch (error) {
    console.error('API: Error in recipes API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
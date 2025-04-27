import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { Recipe } from '../../../../lib/types';

// Get recipe by ID from Firestore
async function fetchRecipeById(id: string): Promise<Recipe | null> {
  try {
    console.log(`API: Fetching recipe with ID ${id} from Firestore`);
    const recipeDoc = await getDoc(doc(db, 'recipes', id));
    
    if (recipeDoc.exists()) {
      console.log(`API: Recipe found in Firestore: ${id}`);
      return { 
        id: recipeDoc.id, 
        ...recipeDoc.data() 
      } as Recipe;
    }
    
    console.log(`API: Recipe not found in Firestore: ${id}`);
    return null;
  } catch (error) {
    console.error(`API: Error fetching recipe ${id} from Firestore:`, error);
    return null;
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`API: Recipe details endpoint called for ID: ${params.id}`);
    
    // Try to fetch from Firestore
    const recipe = await fetchRecipeById(params.id);
    
    if (!recipe) {
      console.log(`API: Recipe not found: ${params.id}`);
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    
    console.log(`API: Returning recipe: ${recipe.title}`);
    return NextResponse.json(recipe);
  } catch (error) {
    console.error(`API: Error fetching recipe ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
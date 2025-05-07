// app/api/recipes/[id]/route.ts
import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { Recipe } from '../../../../lib/types';

// Get recipe by ID from Firestore
async function fetchRecipeById(id: string): Promise<Recipe | null> {
  try {
    console.log("Trying to fetch recipe from Firestore:", id);
    // Get from Firestore
    const recipeDoc = await getDoc(doc(db, 'recipes', id));
    
    if (recipeDoc.exists()) {
      console.log("Recipe found in Firestore");
      return { 
        id: recipeDoc.id, 
        ...recipeDoc.data() 
      } as Recipe;
    }
     
    console.log("Recipe not found in Firestore");
    return null;
  } catch (error) {
    console.error(`Error fetching recipe ${id} from Firestore:`, error);
    return null;
  }
}

// Updated function signature to match Next.js 15 requirements
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    console.log(`API: Fetching recipe with ID: ${id}`);
    
    // Handle special case for generated IDs
    if (id.startsWith('generated-')) {
      // Try to get recipe from sessionStorage via client-side handling
      console.log("Generated ID detected - client should handle this");
      return NextResponse.json({ 
        message: "This is a generated recipe ID. It should be retrieved from sessionStorage on the client." 
      }, { status: 404 });
    }
    
    // For non-generated IDs, try to fetch from Firestore
    const recipe = await fetchRecipeById(id);
    
    if (!recipe) {
      // If not found, return 404
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    
    return NextResponse.json(recipe);
  } catch (error) {
    console.error(`Error fetching recipe:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
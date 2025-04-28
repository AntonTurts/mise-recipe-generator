// lib/api.ts
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Recipe } from './types';

// Fetch a single recipe by ID
export const getRecipeById = async (id: string): Promise<Recipe | null> => {
  try {
    // Don't attempt to fetch generated IDs from Firestore
    if (id.startsWith('generated-') || id.startsWith('fallback-')) {
      console.log(`Recipe ID ${id} is a temporary ID, should be retrieved from session storage`);
      return null;
    }
    
    console.log(`API util: Fetching recipe ${id} from Firestore`);
    const recipeDoc = await getDoc(doc(db, 'recipes', id));
    
    if (recipeDoc.exists()) {
      console.log(`API util: Recipe ${id} found in Firestore`);
      return { 
        id: recipeDoc.id, 
        ...recipeDoc.data() 
      } as Recipe;
    }
    
    console.log(`API util: Recipe ${id} not found in Firestore`);
    return null;
  } catch (error) {
    console.error(`Error fetching recipe ${id}:`, error);
    throw error;
  }
};

// Fetch recipes by IDs (for user's saved recipes)
export const getRecipesByIds = async (ids: string[]): Promise<Recipe[]> => {
  if (ids.length === 0) return [];
  
  try {
    const recipes: Recipe[] = [];
    
    // Process IDs one by one
    for (const id of ids) {
      if (id.startsWith('generated-') || id.startsWith('fallback-')) {
        // These should be handled by the client from sessionStorage
        continue;
      }
      
      try {
        const recipe = await getRecipeById(id);
        if (recipe) {
          recipes.push(recipe);
        }
      } catch (error) {
        console.error(`Error fetching recipe ${id}:`, error);
        // Continue with other recipes
      }
    }
    return recipes;
  } catch (error) {
    console.error('Error fetching recipes by IDs:', error);
    throw error;
  }
}; 
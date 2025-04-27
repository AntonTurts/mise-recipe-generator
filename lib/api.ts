// lib/api.ts
import { db } from './firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Recipe } from './types';

// Fetch a single recipe by ID
export const getRecipeById = async (id: string): Promise<Recipe | null> => {
  try {
    console.log(`Fetching recipe with ID: ${id}`);
    
    // Check if it's a generated ID (not a Firestore ID)
    if (id.startsWith('generated-') || id.startsWith('fallback-')) {
      console.log(`This is a generated/fallback ID: ${id}`);
      return null;
    }
    
    // Try to fetch from Firestore
    const recipeDoc = await getDoc(doc(db, 'recipes', id));
    
    if (recipeDoc.exists()) {
      console.log(`Recipe found in Firestore: ${id}`);
      const data = recipeDoc.data();
      return { 
        ...data,
        id: recipeDoc.id,
        // Ensure required properties exist
        ingredients: data.ingredients || [],
        instructions: data.instructions || [],
        allergyInfo: data.allergyInfo || { safe: [], warnings: [] },
        safetyNotes: data.safetyNotes || [],
      } as Recipe;
    }
    
    console.log(`Recipe not found in Firestore: ${id}`);
    return null;
  } catch (error) {
    console.error(`Error fetching recipe ${id}:`, error);
    throw error;
  }
};

// Fetch recipes by IDs (for user's saved recipes)
export const getRecipesByIds = async (ids: string[]): Promise<Recipe[]> => {
  if (!ids || ids.length === 0) return [];
  
  try {
    console.log(`Fetching recipes for IDs: ${ids.join(', ')}`);
    const recipes: Recipe[] = [];
    
    // Process regular Firestore IDs
    const firestoreIds = ids.filter(id => !id.startsWith('generated-') && !id.startsWith('fallback-'));
    
    // Process in batches of 10 (Firestore limitation)
    const batchSize = 10;
    for (let i = 0; i < firestoreIds.length; i += batchSize) {
      const batchIds = firestoreIds.slice(i, i + batchSize);
      if (batchIds.length === 0) continue;
      
      // We can't use "in" query with more than 10 items
      for (const recipeId of batchIds) {
        try {
          const recipeDoc = await getDoc(doc(db, 'recipes', recipeId));
          if (recipeDoc.exists()) {
            const data = recipeDoc.data();
            recipes.push({
              ...data,
              id: recipeDoc.id,
              // Ensure required properties exist
              ingredients: data.ingredients || [],
              instructions: data.instructions || [],
              allergyInfo: data.allergyInfo || { safe: [], warnings: [] },
              safetyNotes: data.safetyNotes || [],
            } as Recipe);
          }
        } catch (docError) {
          console.error(`Error fetching recipe ${recipeId}:`, docError);
        }
      }
    }
    
    console.log(`Retrieved ${recipes.length} recipes from Firestore`);
    return recipes;
  } catch (error) {
    console.error('Error fetching recipes by IDs:', error);
    throw error;
  }
};
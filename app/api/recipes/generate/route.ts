import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Recipe } from '../../../../lib/types';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { validateRecipeSafety } from '../../../../lib/safety';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    console.log("Recipe generation API called");
    const { ingredients, preferences } = await request.json();
    console.log("Received data:", { ingredients, preferences });
    
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json({ error: 'No ingredients provided' }, { status: 400 });
    }

    // Create prompt for OpenAI
    const prompt = `
      Generate 3 recipes based on these ingredients: ${ingredients.join(', ')}.
      
      The user has the following preferences:
      ${preferences.allergies && preferences.allergies.length > 0 ? `- Allergies: ${preferences.allergies.join(', ')}` : '- No allergies specified'}
      ${preferences.dietaryPreferences && preferences.dietaryPreferences.length > 0 ? `- Dietary Preferences: ${preferences.dietaryPreferences.join(', ')}` : '- No dietary preferences specified'}
      - Cooking Skill Level: ${preferences.skillLevel}/3 (1=beginner, 2=intermediate, 3=advanced)
      - Maximum Cooking Time: ${preferences.cookingTime} minutes
      ${preferences.equipment && preferences.equipment.length > 0 ? `- Available Equipment: ${preferences.equipment.join(', ')}` : '- No equipment specified'}
      
      For each recipe, provide:
      1. A descriptive title
      2. A brief description
      3. Preparation time and cooking time
      4. Number of servings
      5. Ingredients list with quantities, and mark which ones are essential vs. optional
      6. Step-by-step instructions with any safety notes where needed
      7. Allergy information
      8. Safety notes (especially for raw meat handling, if applicable)
      
      IMPORTANT: Generate exactly 3 recipes, no more and no less.
      
      Format your response as a JSON array with the following structure for each recipe:
      {
        "title": "Recipe Title",
        "description": "Brief description of the recipe",
        "prepTime": number (in minutes),
        "cookTime": number (in minutes),
        "servings": number,
        "skillLevel": "beginner", "intermediate", or "advanced",
        "ingredients": [
          {
            "id": "1",
            "name": "Ingredient with quantity",
            "amount": "quantity value",
            "unit": "measurement unit",
            "available": true,
            "essential": true or false
          }
        ],
        "instructions": [
          {
            "id": 1,
            "text": "Step instruction",
            "safetyNote": "Optional safety note for this step"
          }
        ],
        "allergyInfo": {
          "safe": ["list of safe-for diets"],
          "warnings": ["list of allergens present"]
        },
        "safetyNotes": ["List of safety precautions"]
      }
    `;

    console.log("Calling OpenAI API...");
    
    try {
      // Call OpenAI API with GPT-4o
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",  // Changed to GPT-4o
        messages: [
          {"role": "system", "content": "You are a professional chef specialized in creating safe, delicious recipes from available ingredients. Safety is your top priority. Always generate exactly 3 recipes."},
          {"role": "user", "content": prompt}
        ],
        temperature: 0.7,
      });
      
      // Parse the response
      const responseText = completion.choices[0].message?.content || '';
      console.log("OpenAI Response:", responseText);
      
      try {
        // Extract JSON from the response
        const parsedRecipes = JSON.parse(responseText);
        
        // Ensure we're working with an array
        const recipesArray = Array.isArray(parsedRecipes) ? parsedRecipes : [parsedRecipes];
        
        // Process recipes to add IDs and other metadata
        const processedRecipes = await Promise.all(recipesArray.map(async (parsedRecipe, recipeIndex) => {
          const recipe = {
            ...parsedRecipe,
            id: `generated-${Date.now()}-${recipeIndex}`,
            // Mark all ingredients as available since they were provided by the user
            ingredients: parsedRecipe.ingredients.map((ing: any, index: number) => ({
              ...ing,
              id: ing.id || `${index + 1}`,
              available: ingredients.some((item: string) => 
                item.toLowerCase().includes(ing.name.toLowerCase().split(' ')[0]) || 
                ing.name.toLowerCase().includes(item.toLowerCase())
              )
            }))
          };
          
          // Calculate missing ingredients
          const missingIngredients = recipe.ingredients
            .filter((ing: any) => ing.essential && !ing.available)
            .map((ing: any) => ing.name.split(',')[0].trim());
          
          // Calculate match percentage
          const requiredIngredientsCount = recipe.ingredients.filter((ing: any) => ing.essential).length;
          const availableRequiredCount = recipe.ingredients.filter((ing: any) => ing.essential && ing.available).length;
          const match = Math.round((availableRequiredCount / requiredIngredientsCount) * 100) || 100;
          
          // Add missing ingredients and match to recipe
          const enhancedRecipe = {
            ...recipe,
            missingIngredients,
            match
          };
          
          // Apply safety validation
          const safetyCheck = validateRecipeSafety ? 
            validateRecipeSafety(enhancedRecipe, preferences.allergies || []) : 
            { isValid: true };
            
          const validatedRecipe = {
            ...enhancedRecipe,
            safetyCheck
          };
          
          // Store recipe in Firestore
          try {
            const recipeRef = await addDoc(collection(db, 'recipes'), {
              ...validatedRecipe,
              createdAt: serverTimestamp(),
            });
            
            // Update recipe with Firestore ID
            validatedRecipe.id = recipeRef.id;
            console.log(`Recipe ${recipeIndex + 1} saved to Firestore with ID:`, recipeRef.id);
          } catch (error) {
            console.error(`Error saving recipe ${recipeIndex + 1} to Firestore:`, error);
          }
          
          return validatedRecipe;
        }));
        
        console.log(`Returning ${processedRecipes.length} recipes`);
        return NextResponse.json(processedRecipes);
        
      } catch (error) {
        console.error('Error parsing OpenAI response:', error);
        throw error;  // Throw to be caught by the outer catch
      }
    } catch (error) {
      console.error('Error calling OpenAI API or parsing response:', error);
      
      // Return a more user-friendly fallback
      const fallbackRecipes = ingredients.slice(0, 3).map((ingredient, index) => ({
        id: `creative-${Date.now()}-${index}`,
        title: `Creative ${ingredient.charAt(0).toUpperCase() + ingredient.slice(1)} Dish`,
        description: 'We\'re having trouble with our recipe generation at the moment. Here\'s a creative starting point based on your ingredients.',
        prepTime: 10,
        cookTime: 15,
        servings: 2,
        skillLevel: 'beginner',
        ingredients: ingredients.map((ing, i) => ({
          id: `${i + 1}`,
          name: ing,
          amount: '1',
          unit: 'portion',
          available: true,
          essential: true
        })),
        instructions: [
          { id: 1, text: 'Prepare all ingredients according to your preference.' },
          { id: 2, text: 'Combine ingredients in a way that suits your taste.' },
          { id: 3, text: 'Cook thoroughly for safety and enjoy your creative dish!' }
        ],
        allergyInfo: {
          safe: [],
          warnings: []
        },
        safetyNotes: [
          'Always cook ingredients thoroughly',
          'Follow proper food safety guidelines'
        ],
        missingIngredients: [],
        match: 100,
        safetyCheck: { isValid: true }
      }));
      
      // Only return one fallback recipe
      return NextResponse.json([fallbackRecipes[0]]);
    }
  } catch (error) {
    console.error('Error in recipe generation:', error);
    return NextResponse.json({ error: 'We encountered an issue while creating your recipes. Please try again later.' }, { status: 500 });
  }
}
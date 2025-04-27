// app/api/recipes/generate/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Recipe } from '../../../lib/types';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { validateRecipeSafety } from '../../../lib/safety';

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
      Generate exactly 2 recipes based on these ingredients: ${ingredients.join(', ')}.
      
      The user has the following preferences:
      ${preferences.allergies && preferences.allergies.length > 0 ? `- Allergies: ${preferences.allergies.join(', ')}` : '- No allergies specified'}
      ${preferences.dietaryPreferences && preferences.dietaryPreferences.length > 0 ? `- Dietary Preferences: ${preferences.dietaryPreferences.join(', ')}` : '- No dietary preferences specified'}
      - Cooking Skill Level: ${preferences.skillLevel}/3 (1=beginner, 2=intermediate, 3=advanced)
      - Maximum Cooking Time: ${preferences.cookingTime} minutes
      ${preferences.equipment && preferences.equipment.length > 0 ? `- Available Equipment: ${preferences.equipment.join(', ')}` : '- No equipment specified'}
      
      The recipes should be diverse - different types of dishes that use the ingredients in different ways.
      
      For each recipe, provide:
      1. A descriptive title
      2. A brief description
      3. Preparation time and cooking time
      4. Number of servings
      5. Ingredients list with quantities, and mark which ones are essential vs. optional
      6. Step-by-step instructions with any safety notes where needed
      7. Allergy information
      8. Safety notes (especially for raw meat handling, if applicable)
      
      IMPORTANT: Format your response as a JSON array with EXACTLY 2 recipes, with each recipe having the following structure:
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
      
      Response must be valid JSON with no markdown formatting.
    `;

    console.log("Calling OpenAI API...");
    
    try {
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {"role": "system", "content": "You are a professional chef specialized in creating safe, delicious recipes from available ingredients. Safety is your top priority. You ALWAYS generate exactly 2 recipes when asked. You only provide valid JSON with no markdown formatting."},
          {"role": "user", "content": prompt}
        ],
        temperature: 0.7,
        response_format: { type: "json_object" } // Enforce JSON response format
      });
      
      // Parse the response
      const responseText = completion.choices[0].message?.content || '';
      console.log("OpenAI Response Received");
      
      try {
        // Clean the response text to remove any markdown code blocks
        const cleanedResponse = responseText.replace(/```json|```/g, '').trim();
        
        // Extract JSON from the response
        const parsedResponse = JSON.parse(cleanedResponse);
        let recipes = parsedResponse.recipes || [];
        
        // If not an array or not in expected format, try to extract from the response
        if (!Array.isArray(recipes) || recipes.length === 0) {
          if (Array.isArray(parsedResponse)) {
            recipes = parsedResponse;
          } else {
            // Check if it's a single recipe and convert to array
            if (parsedResponse.title && parsedResponse.ingredients) {
              recipes = [parsedResponse];
            }
          }
        }
        
        // Ensure we have exactly 2 recipes
        if (recipes.length < 2) {
          // If we have fewer than 2, add fallback recipes
          while (recipes.length < 2) {
            recipes.push(createFallbackRecipe(ingredients, recipes.length));
          }
        } else if (recipes.length > 2) {
          // If we have more than 2, take only the first 2
          recipes = recipes.slice(0, 2);
        }
        
        // Process each recipe
        const enhancedRecipes = [];
        
        for (let i = 0; i < recipes.length; i++) {
          const recipe = recipes[i];
          
          // Process recipe to add ID and other metadata
          const processedRecipe = {
            ...recipe,
            id: `generated-${Date.now()}-${i}`,
            // Mark ingredients as available based on user's input
            ingredients: recipe.ingredients.map((ing: any, index: number) => ({
              ...ing,
              id: ing.id || `${index + 1}`,
              available: ingredients.some((item: string) => 
                item.toLowerCase().includes(ing.name.toLowerCase().split(' ')[0]) || 
                ing.name.toLowerCase().includes(item.toLowerCase())
              )
            }))
          };
          
          // Calculate missing ingredients
          const missingIngredients = processedRecipe.ingredients
            .filter((ing: any) => ing.essential && !ing.available)
            .map((ing: any) => ing.name.split(',')[0].trim());
          
          // Calculate match percentage
          const requiredIngredientsCount = processedRecipe.ingredients.filter((ing: any) => ing.essential).length;
          const availableRequiredCount = processedRecipe.ingredients.filter((ing: any) => ing.essential && ing.available).length;
          const match = requiredIngredientsCount > 0 
            ? Math.round((availableRequiredCount / requiredIngredientsCount) * 100) 
            : 100;
          
          // Add missing ingredients and match to recipe
          const enhancedRecipe = {
            ...processedRecipe,
            missingIngredients,
            match
          };
          
          // Apply safety validation
          const safetyCheck = validateRecipeSafety ? validateRecipeSafety(enhancedRecipe, preferences.allergies || []) : { isValid: true };
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
            console.log(`Recipe ${i+1} saved to Firestore with ID:`, recipeRef.id);
          } catch (error) {
            console.error(`Error saving recipe ${i+1} to Firestore:`, error);
            // Continue even if Firestore save fails
          }
          
          enhancedRecipes.push(validatedRecipe);
        }
        
        console.log(`Returning ${enhancedRecipes.length} recipes`);
        return NextResponse.json(enhancedRecipes);
        
      } catch (error) {
        console.error('Error parsing OpenAI response:', error);
        // Create fallback recipes
        const fallbackRecipes = [
          createFallbackRecipe(ingredients, 0),
          createFallbackRecipe(ingredients, 1)
        ];
        return NextResponse.json(fallbackRecipes);
      }
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      // Create fallback recipes
      const fallbackRecipes = [
        createFallbackRecipe(ingredients, 0),
        createFallbackRecipe(ingredients, 1)
      ];
      return NextResponse.json(fallbackRecipes);
    }
  } catch (error) {
    console.error('Error generating recipes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Function to create a fallback recipe
function createFallbackRecipe(ingredients: string[], index: number) {
  const titles = [
    'Simple Sauté with Your Ingredients',
    'Quick Stir Fry with Available Ingredients'
  ];
  
  const descriptions = [
    'A quick sauté combining your ingredients for a simple meal.',
    'A fast stir fry using your available ingredients.'
  ];
  
  return {
    id: `fallback-${Date.now()}-${index}`,
    title: titles[index % titles.length],
    description: descriptions[index % descriptions.length],
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    skillLevel: 'beginner',
    ingredients: ingredients.map((ing, idx) => ({
      id: `${idx + 1}`,
      name: ing,
      amount: '1',
      unit: 'portion',
      available: true,
      essential: true
    })),
    instructions: [
      { id: 1, text: 'Prepare all ingredients by washing and cutting as needed.' },
      { id: 2, text: 'Heat a pan over medium heat with a little oil.' },
      { id: 3, text: 'Add all ingredients and cook until done, stirring occasionally.' },
      { id: 4, text: 'Season with salt and pepper to taste and serve immediately.' }
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
  };
}
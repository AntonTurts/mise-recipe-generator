import { Recipe } from './types';
import { allIngredients } from '../data/ingredients';

// Function to check if a recipe contains any allergens
export const detectAllergens = (
  recipe: Recipe, 
  userAllergies: string[]
): { 
  isSafe: boolean;
  allergensPresent: string[];
  safeFor: string[];
} => {
  const allergensPresent: string[] = [];
  const safeFor: string[] = [];
  
  // Check each recipe ingredient against allergen database
  recipe.ingredients.forEach(ingredient => {
    // Find the ingredient in the database to get its allergen info
    const ingredientInfo = allIngredients.find(i => 
      i.name?.toLowerCase() === ingredient.name?.toLowerCase() ||
      ingredient.name?.toLowerCase().includes(i.name?.toLowerCase())
    );
    
    // If it has allergens, check against user allergies
    if (ingredientInfo?.allergies && ingredientInfo.allergies.length > 0) {
      for (const allergen of ingredientInfo.allergies) {
        if (userAllergies.includes(allergen) && !allergensPresent.includes(allergen)) {
          allergensPresent.push(allergen);
        }
      }
    }
  });
  
  // Determine what the recipe is safe for
  const commonAllergens = ['dairy', 'eggs', 'nuts', 'peanuts', 'shellfish', 'fish', 'soy', 'wheat', 'gluten'];
  
  for (const allergen of commonAllergens) {
    const hasAllergen = recipe.ingredients.some(ingredient => {
      const ingredientInfo = allIngredients.find(i => 
        i.name?.toLowerCase() === ingredient.name?.toLowerCase() ||
        ingredient.name?.toLowerCase().includes(i.name?.toLowerCase())
      );
      return ingredientInfo?.allergies?.includes(allergen);
    });
    
    if (!hasAllergen) {
      safeFor.push(`${allergen}-free`);
    }
  }
  
  return {
    isSafe: allergensPresent.length === 0,
    allergensPresent,
    safeFor
  };
};

// Function to validate recipe safety for user with allergies
export const validateRecipeSafety = (recipe: Recipe, userAllergies: string[]): { 
  isValid: boolean;
  message?: string;
} => {
  // Check if the recipe has cooking instructions for raw meat
  const hasRawMeat = recipe.ingredients.some(ing => {
    const name = ing.name?.toLowerCase() || '';
    return name.includes('chicken') || name.includes('beef') || name.includes('pork') || 
           name.includes('turkey') || name.includes('lamb') || (name.includes('meat') && !name.includes('cooked'));
  });
  
  if (hasRawMeat) {
    const hasCookingStep = recipe.instructions.some(step => {
      const text = step.text?.toLowerCase() || '';
      return (text.includes('cook') || text.includes('heat') || text.includes('bake') || 
              text.includes('roast') || text.includes('grill') || text.includes('fry')) &&
              !text.includes('pre-cooked');
    });
    
    if (!hasCookingStep) {
      return {
        isValid: false,
        message: 'Recipe appears to contain raw meat without proper cooking instructions.'
      };
    }
  }
  
  // Check if recipe contains any user allergies
  if (userAllergies.length > 0 && recipe.allergyInfo?.warnings) {
    const containsUserAllergy = userAllergies.some(allergy => 
      recipe.allergyInfo.warnings.includes(allergy)
    );
    
    if (containsUserAllergy) {
      return {
        isValid: false,
        message: 'Recipe contains ingredients you are allergic to.'
      };
    }
  }
  
  // Perform deeper allergen analysis
  const allergenCheck = detectAllergens(recipe, userAllergies);
  if (!allergenCheck.isSafe) {
    return {
      isValid: false,
      message: `Recipe contains allergens: ${allergenCheck.allergensPresent.join(', ')}`
    };
  }
  
  return { isValid: true };
};

// Check for safety concerns in recipe and add warnings
export const analyzeSafetyConcerns = (recipe: Recipe): {
  concerns: string[];
  severity: 'high' | 'medium' | 'low';
} => {
  const concerns: string[] = [];
  
  // Check for high-risk ingredients
  const hasHighRiskIngredients = recipe.ingredients.some(ing => {
    const name = ing.name?.toLowerCase() || '';
    return name.includes('raw') && 
           (name.includes('egg') || name.includes('meat') || name.includes('chicken') || 
            name.includes('fish') || name.includes('beef') || name.includes('pork'));
  });
  
  if (hasHighRiskIngredients) {
    concerns.push('Recipe contains high-risk raw ingredients that require proper handling and cooking');
  }
  
  // Check for proper cooking instructions
  if (hasHighRiskIngredients) {
    const hasProperCookingInstructions = recipe.instructions.some(step => {
      const text = step.text?.toLowerCase() || '';
      return (text.includes('internal temperature') || text.includes('165') || text.includes('75c') || text.includes('75°c'));
    });
    
    if (!hasProperCookingInstructions) {
      concerns.push('No specific instructions for cooking to safe internal temperature');
    }
  }
  
  // Check for hand washing instructions
  const hasMeatHandling = recipe.ingredients.some(ing => {
    const name = ing.name?.toLowerCase() || '';
    return name.includes('meat') || name.includes('chicken') || name.includes('beef') || 
           name.includes('pork') || name.includes('fish');
  });
  
  if (hasMeatHandling) {
    const hasHandWashingInstruction = recipe.instructions.some(step => {
      const text = step.text?.toLowerCase() || '';
      return text.includes('wash') && text.includes('hand');
    }) || recipe.safetyNotes?.some(note => note.toLowerCase().includes('wash') && note.toLowerCase().includes('hand'));
    
    if (!hasHandWashingInstruction) {
      concerns.push('No reminder to wash hands after handling raw meat');
    }
  }
  
  // Determine overall severity
  let severity: 'high' | 'medium' | 'low' = 'low';
  if (concerns.length > 0) {
    severity = hasHighRiskIngredients ? 'high' : 'medium';
  }
  
  return {
    concerns,
    severity
  };
};
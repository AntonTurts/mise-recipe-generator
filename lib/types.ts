// Ingredient Types
export interface Ingredient {
    id: string;
    name: string;
    category: string;
    allergies?: string[];
  }
  
  export interface IngredientCategory {
    id: string;
    name: string;
  }
  
  // User Preference Types
  export interface UserPreferences {
    allergies: string[];
    dietaryPreferences: string[];
    skillLevel: number;
    cookingTime: number;
    equipment: string[];
  }
  
  export interface User {
    id: string;
    email: string;
    name?: string;
    savedRecipes: string[]; // Array of recipe IDs
  }

  export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  }
  
  // Recipe Types
  export interface RecipeIngredient {
    id: string;
    name: string;
    amount: string;
    unit?: string;
    available: boolean;
    essential: boolean;
  }
  
  export interface RecipeInstruction {
    id: number;
    text: string;
    safetyNote?: string;
  }
  
  export interface AllergyInfo {
    safe: string[];
    warnings: string[];
  }
  
  export interface Recipe {
    id: string;
    title: string;
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    prepTime: number;
    cookTime: number;
    servings: number;
    rating?: number;
    ingredients: RecipeIngredient[];
    instructions: RecipeInstruction[];
    allergyInfo: AllergyInfo;
    safetyNotes: string[];
    description: string;
    missingIngredients?: string[];
    match?: number; // Percentage match with user's available ingredients
    safetyCheck?: {
      isValid: boolean;
      message?: string;
    };
  }
import { Ingredient, IngredientCategory } from '../lib/types';

export const categories: IngredientCategory[] = [
  { id: 'all', name: 'All' },
  { id: 'proteins', name: 'Proteins' },
  { id: 'vegetables', name: 'Vegetables' },
  { id: 'dairy', name: 'Dairy' },
  { id: 'grains', name: 'Grains' },
  { id: 'fruits', name: 'Fruits' },
  { id: 'spices', name: 'Spices' },
  { id: 'condiments', name: 'Condiments' }
];

export const allIngredients: Ingredient[] = [
  // Proteins
  { id: 'chicken', name: 'Chicken', category: 'proteins' },
  { id: 'beef', name: 'Beef', category: 'proteins' },
  { id: 'pork', name: 'Pork', category: 'proteins' },
  { id: 'shrimp', name: 'Shrimp', category: 'proteins', allergies: ['shellfish'] },
  { id: 'tofu', name: 'Tofu', category: 'proteins', allergies: ['soy'] },
  { id: 'eggs', name: 'Eggs', category: 'proteins', allergies: ['eggs'] },
  { id: 'salmon', name: 'Salmon', category: 'proteins', allergies: ['fish'] },
  { id: 'tuna', name: 'Tuna', category: 'proteins', allergies: ['fish'] },
  
  // Vegetables
  { id: 'onion', name: 'Onion', category: 'vegetables' },
  { id: 'garlic', name: 'Garlic', category: 'vegetables' },
  { id: 'tomato', name: 'Tomato', category: 'vegetables' },
  { id: 'potato', name: 'Potato', category: 'vegetables' },
  { id: 'carrot', name: 'Carrot', category: 'vegetables' },
  { id: 'bell-pepper', name: 'Bell Pepper', category: 'vegetables' },
  { id: 'broccoli', name: 'Broccoli', category: 'vegetables' },
  { id: 'spinach', name: 'Spinach', category: 'vegetables' },
  { id: 'cucumber', name: 'Cucumber', category: 'vegetables' },
  { id: 'zucchini', name: 'Zucchini', category: 'vegetables' },
  
  // Dairy
  { id: 'cheese', name: 'Cheese', category: 'dairy', allergies: ['dairy'] },
  { id: 'milk', name: 'Milk', category: 'dairy', allergies: ['dairy'] },
  { id: 'butter', name: 'Butter', category: 'dairy', allergies: ['dairy'] },
  { id: 'yogurt', name: 'Yogurt', category: 'dairy', allergies: ['dairy'] },
  { id: 'cream', name: 'Cream', category: 'dairy', allergies: ['dairy'] },
  
  // Grains
  { id: 'rice', name: 'Rice', category: 'grains' },
  { id: 'pasta', name: 'Pasta', category: 'grains', allergies: ['gluten'] },
  { id: 'bread', name: 'Bread', category: 'grains', allergies: ['gluten'] },
  { id: 'flour', name: 'Flour', category: 'grains', allergies: ['gluten'] },
  { id: 'oats', name: 'Oats', category: 'grains' },
  { id: 'quinoa', name: 'Quinoa', category: 'grains' },
  
  // Fruits
  { id: 'apple', name: 'Apple', category: 'fruits' },
  { id: 'banana', name: 'Banana', category: 'fruits' },
  { id: 'orange', name: 'Orange', category: 'fruits' },
  { id: 'lemon', name: 'Lemon', category: 'fruits' },
  { id: 'lime', name: 'Lime', category: 'fruits' },
  { id: 'avocado', name: 'Avocado', category: 'fruits' },
  
  // Spices
  { id: 'salt', name: 'Salt', category: 'spices' },
  { id: 'pepper', name: 'Pepper', category: 'spices' },
  { id: 'cumin', name: 'Cumin', category: 'spices' },
  { id: 'paprika', name: 'Paprika', category: 'spices' },
  { id: 'oregano', name: 'Oregano', category: 'spices' },
  { id: 'basil', name: 'Basil', category: 'spices' },
  { id: 'thyme', name: 'Thyme', category: 'spices' },
  
  // Condiments
  { id: 'olive-oil', name: 'Olive Oil', category: 'condiments' },
  { id: 'vegetable-oil', name: 'Vegetable Oil', category: 'condiments' },
  { id: 'soy-sauce', name: 'Soy Sauce', category: 'condiments', allergies: ['soy', 'gluten'] },
  { id: 'vinegar', name: 'Vinegar', category: 'condiments' },
  { id: 'mayo', name: 'Mayonnaise', category: 'condiments', allergies: ['eggs'] },
  { id: 'ketchup', name: 'Ketchup', category: 'condiments' },
  { id: 'mustard', name: 'Mustard', category: 'condiments' }
];
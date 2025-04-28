// app/ingredients/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, X, Plus } from 'lucide-react';
import Header from '../../components/layout/Header';

export default function IngredientsPage() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [commonIngredients, setCommonIngredients] = useState([
    'Chicken', 'Beef', 'Pasta', 'Rice', 'Eggs', 'Tomatoes', 'Onions', 
    'Potatoes', 'Garlic', 'Cheese', 'Milk', 'Butter', 'Bread', 'Sausages',
    'Carrots', 'Bell Peppers', 'Mushrooms', 'Spinach', 'Broccoli'
  ]);

  // Load saved ingredients on initial render but only if the user hasn't generated recipes yet
  useEffect(() => {
    // Check if we have recipes in session storage - if so, user has already generated recipes
    const hasGeneratedRecipes = !!sessionStorage.getItem('generatedRecipes');
    
    // Only load previously selected ingredients if recipes haven't been generated yet
    if (!hasGeneratedRecipes) {
      const savedIngredients = localStorage.getItem('selectedIngredients');
      if (savedIngredients) {
        try {
          setIngredients(JSON.parse(savedIngredients));
        } catch (e) {
          console.error('Failed to parse saved ingredients', e);
          // Clear invalid data
          localStorage.removeItem('selectedIngredients');
        }
      }
    } else {
      // If recipes were generated, clear ingredients to start fresh
      localStorage.removeItem('selectedIngredients');
    }
  }, []); 
 
  const handleAddIngredient = (ingredient: string) => {
    if (ingredient && !ingredients.includes(ingredient)) {
      const newIngredients = [...ingredients, ingredient];
      setIngredients(newIngredients);
      localStorage.setItem('selectedIngredients', JSON.stringify(newIngredients));
      setCurrentInput('');
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    const newIngredients = ingredients.filter(item => item !== ingredient);
    setIngredients(newIngredients);
    localStorage.setItem('selectedIngredients', JSON.stringify(newIngredients));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentInput) {
      e.preventDefault();
      handleAddIngredient(currentInput);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentInput(value);
    
    // Filter suggestions
    if (value.trim()) {
      const filtered = commonIngredients.filter(
        item => item.toLowerCase().includes(value.toLowerCase()) && 
               !ingredients.includes(item)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleNext = () => {
    if (ingredients.length > 0) {
      // Clear any existing generated recipes
      sessionStorage.removeItem('generatedRecipes');
      
      // Save ingredients for the current session
      localStorage.setItem('selectedIngredients', JSON.stringify(ingredients));
      router.push('/preferences');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="What's in Your Kitchen?" />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Tell us what ingredients you have</h1>
          <p className="text-gray-600 mb-8">
            Enter your ingredients in a conversational way - just like you would describe them to a friend.
          </p>
          
          {/* Input area */}
          <div className="relative mb-8">
            <input
              type="text"
              value={currentInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type ingredients (e.g., chicken, pasta, eggs...)"
              className="w-full p-4 pr-12 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-mise-500 focus:border-transparent"
            />
            <button 
              onClick={() => handleAddIngredient(currentInput)}
              disabled={!currentInput}
              className={`absolute right-2 top-2 p-2 rounded-full ${
                currentInput ? 'bg-mise-500 text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              <Plus className="w-5 h-5" />
            </button>
            
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                <ul className="py-1">
                  {suggestions.map((suggestion) => (
                    <li 
                      key={suggestion} 
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleAddIngredient(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Tag Example */}
          <div className="mb-3">
            <p className="text-sm text-gray-500 mb-2">Common ingredients you can add:</p>
            <div className="flex flex-wrap gap-2">
              {commonIngredients.slice(0, 8).map(ingredient => (
                !ingredients.includes(ingredient) && (
                  <button
                    key={ingredient}
                    onClick={() => handleAddIngredient(ingredient)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700"
                  >
                    {ingredient}
                  </button>
                )
              ))}
            </div>
          </div>
          
          {/* Selected Ingredients */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Your ingredients:</h2>
            {ingredients.length === 0 ? (
              <p className="text-gray-500 italic">No ingredients added yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {ingredients.map(ingredient => (
                  <div 
                    key={ingredient} 
                    className="flex items-center bg-mise-50 border border-mise-200 text-mise-700 px-3 py-1.5 rounded-full"
                  >
                    <span>{ingredient}</span>
                    <button 
                      onClick={() => handleRemoveIngredient(ingredient)}
                      className="ml-1.5 w-5 h-5 rounded-full flex items-center justify-center hover:bg-mise-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Example prompt */}
          <div className="bg-gray-100 rounded-lg p-4 mb-8">
            <h3 className="font-medium text-gray-800 mb-2">Example:</h3>
            <p className="text-gray-600 mb-2">
              "I have some German sausages, sweet potato fries, and need some vegetables to complete the meal."
            </p>
            <p className="text-sm text-gray-500">
              The more specific you are, the better your recipe suggestions will be!
            </p>
          </div>
          
          {/* Next Button */}
          <div className="flex justify-end">
            <button 
              onClick={handleNext}
              disabled={ingredients.length === 0}
              className={`px-4 py-2 rounded-full flex items-center ${
                ingredients.length > 0 
                  ? 'bg-mise-500 text-white hover:bg-mise-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next Step
              <ChevronRight className="ml-1 h-5 w-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
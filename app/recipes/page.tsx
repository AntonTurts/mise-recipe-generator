// app/recipes/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronDown, AlertCircle, X } from 'lucide-react';
import { Recipe } from '../../lib/types';
import Header from '../../components/layout/Header';
import RecipeCard from '../../components/recipe/RecipeCard';
import { useAuth } from '../../context/AuthContext';

export default function RecipesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState('best');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  useEffect(() => {
    fetchRecipes();
    
    // Cleanup function to abort any ongoing fetch when component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
   
  const fetchRecipes = async () => {
    try {
      // Abort any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create a new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      setLoading(true);
      setError(null);
      
      // Get data from localStorage
      const selectedIngredients = JSON.parse(localStorage.getItem('selectedIngredients') || '[]');
      const userPreferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
      
      if (selectedIngredients.length === 0) {
        console.error("No ingredients selected");
        // If no ingredients selected, redirect to ingredients page
        router.push('/ingredients');
        return;
      }
      
      // Log the data being sent to API
      console.log('Sending to API:', { 
        ingredients: selectedIngredients, 
        preferences: userPreferences 
      });
      
      // Fetch recipes from API with the abort signal
      const response = await fetch('/api/recipes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: selectedIngredients,
          preferences: userPreferences
        }),
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData);
        throw new Error(`Error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }
      
      const data = await response.json();
      console.log("Generated recipes:", data);
      
      // Save to session storage for later use in detail page
      sessionStorage.setItem('generatedRecipes', JSON.stringify(data));
      
      setRecipes(data);
    } catch (error: any) {
      // Don't show error if it was caused by an abort
      if (error.name === 'AbortError') {
        console.log('Recipe generation canceled');
        return;
      }
      
      console.error('Error fetching recipes:', error);
      setError('Failed to load recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    setError('Recipe generation was canceled.');
  };
  
  // Sort recipes based on selected mode
  const sortedRecipes = [...recipes].sort((a, b) => {
    if (sortMode === 'best') {
      return (b.match || 0) - (a.match || 0);
    } else if (sortMode === 'quick') {
      return ((a.prepTime + a.cookTime) || 0) - ((b.prepTime + b.cookTime) || 0);
    } else if (sortMode === 'missing') {
      return (a.missingIngredients?.length || 0) - (b.missingIngredients?.length || 0);
    } else {
      return 0;
    }
  });

  // Get sort option display text
  const getSortOptionText = () => {
    switch (sortMode) {
      case 'best': return 'Best match';
      case 'quick': return 'Quickest to prepare';
      case 'missing': return 'Fewest missing ingredients';
      default: return 'Sort by';
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header title="Finding Recipes" />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-mise-500 border-opacity-50 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 mb-4">Finding personalized recipes for you...</p>
            <p className="text-sm text-gray-500 mb-6">Mise is working on your request</p>
            
            {/* Cancel button */}
            <button 
              onClick={handleCancelGeneration}
              className="px-6 py-2 bg-white border border-red-500 text-red-500 rounded-full hover:bg-red-50 flex items-center mx-auto"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header title="Error" />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-4 max-w-md">
            <div className="text-red-500 text-5xl mb-4">❌</div>
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => router.push('/ingredients')}
                className="px-6 py-3 rounded-full border border-mise-500 text-mise-500 font-medium"
              >
                Change Ingredients
              </button>
              <button 
                onClick={() => fetchRecipes()}
                className="px-6 py-3 rounded-full bg-mise-500 text-white font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Recipe Results" />
      
      {/* Results Info Banner */}
      <div className="container mx-auto px-4 mt-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col md:flex-row md:justify-between md:items-center">
          <p className="text-green-800 mb-2 md:mb-0">
            <span className="font-medium">Found {recipes.length} recipes</span> matching your ingredients
          </p>
          {recipes.length > 0 && (
            <p className="text-green-800">
              Cooking time: ~{Math.min(...recipes.map(r => (r.prepTime || 0) + (r.cookTime || 0)))} - 
              {Math.max(...recipes.map(r => (r.prepTime || 0) + (r.cookTime || 0)))} min
            </p>
          )}
        </div>
      </div>
      
      {/* Sort Dropdown */}
      <div className="container mx-auto px-4 mt-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center">
          <div className="relative flex items-center">
            <span className="text-gray-700 mr-3">Sort by:</span>
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-between w-48 px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-mise-500"
              >
                {getSortOptionText()}
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
              
              {dropdownOpen && (
                <div className="absolute z-10 w-48 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                  <ul>
                    <li 
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${sortMode === 'best' ? 'bg-mise-50 text-mise-600' : ''}`}
                      onClick={() => {
                        setSortMode('best');
                        setDropdownOpen(false);
                      }}
                    >
                      Best match
                    </li>
                    <li 
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${sortMode === 'quick' ? 'bg-mise-50 text-mise-600' : ''}`}
                      onClick={() => {
                        setSortMode('quick');
                        setDropdownOpen(false);
                      }}
                    >
                      Quickest to prepare
                    </li>
                    <li 
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${sortMode === 'missing' ? 'bg-mise-50 text-mise-600' : ''}`}
                      >
                      Fewest missing ingredients
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Recipe List */}
      <div className="container mx-auto px-4 py-6 flex-grow">
        {sortedRecipes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No recipes found. Try selecting different ingredients.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
      
      {/* Navigation Footer */}
      <div className="container mx-auto px-4 py-4 border-t border-gray-200 bg-white">
        <div className="flex justify-between">
          <button 
            className="px-6 py-3 rounded-full border border-mise-500 text-mise-500 font-medium flex items-center hover:bg-mise-50"
            onClick={() => router.back()}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
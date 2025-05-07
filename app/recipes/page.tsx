// app/recipes/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronDown, AlertCircle, X, RefreshCw } from 'lucide-react';
import { Recipe } from '../../lib/types';
import Header from '../../components/layout/Header';
import RecipeCard from '../../components/recipe/RecipeCard';
import { useAuth } from '../../context/AuthContext';

export default function RecipesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true); // Always start with loading true
  const [dataLoaded, setDataLoaded] = useState(false); // Flag to indicate if any data has been loaded
  const [error, setError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState('best');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPreferencesUpdated, setShowPreferencesUpdated] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  useEffect(() => {
    const checkAndLoadData = async () => {
      try {
        // Ensure we start with loading state
        setLoading(true);
        
        // Get the stored ingredients and preferences
        const storedIngredients = localStorage.getItem('selectedIngredients');
        const storedPreferences = localStorage.getItem('userPreferences');
        
        if (!storedIngredients || JSON.parse(storedIngredients).length === 0) {
          // If no ingredients selected, redirect to ingredients page
          router.push('/ingredients');
          return;
        }

        // Check if we already have generated recipes in session storage
        const storedRecipes = sessionStorage.getItem('generatedRecipes');
        const preferencesChanged = sessionStorage.getItem('preferencesChanged');
        
        if (storedRecipes && !preferencesChanged) {
          try {
            const parsedRecipes = JSON.parse(storedRecipes);
            setRecipes(parsedRecipes);
            setDataLoaded(true);
            setLoading(false);
          } catch (parseError) {
            console.error('Error parsing stored recipes:', parseError);
            // Continue to fetch recipes if parsing fails
            await fetchRecipes();
          }
        } else {
          if (preferencesChanged) {
            // Flag to show that preferences have been updated
            setShowPreferencesUpdated(true);
            sessionStorage.removeItem('preferencesChanged');
            setDataLoaded(true);
            setLoading(false);
          } else {
            // No stored recipes or failed to parse - fetch new ones
            await fetchRecipes();
          }
        }
      } catch (error) {
        console.error('Error in initial data loading:', error);
        setError('Error loading data. Please try again.');
        setLoading(false);
      }
    };
    
    checkAndLoadData();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [router]);
   
  const fetchRecipes = async () => {
    try {
      // Always set loading to true when fetching
      setLoading(true);
      
      // Abort any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create a new abort controller for this request
      abortControllerRef.current = new AbortController();
      
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
      
      // Add a slight delay to ensure loading state is visible
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
      
      // Clear the preferences changed flag
      sessionStorage.removeItem('preferencesChanged');
      setShowPreferencesUpdated(false);
      
      setRecipes(data);
      setDataLoaded(true);
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
  
  // Method to regenerate recipes
  const regenerateRecipes = () => {
    // Remove the stored recipes and preferences changed flag
    sessionStorage.removeItem('generatedRecipes');
    sessionStorage.removeItem('preferencesChanged');
    setShowPreferencesUpdated(false);
    
    // Fetch new recipes
    fetchRecipes();
  };
  
  // Method to go back to change preferences without losing recipes
  const goBackToPreferences = () => {
    router.push('/preferences');
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
  
  // Show loading state when first loading the page or generating recipes
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header title="Finding Recipes" />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-mise-500 border-opacity-50 mx-auto mb-6"></div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Recipes Being Generated</h2>
            <p className="text-gray-600 mb-4">We're crafting personalized recipes with your ingredients. This usually takes about 15 seconds.</p>
            <div className="h-2 bg-gray-200 rounded-full mb-4">
              <div className="h-full bg-mise-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-gray-500 mb-6">Our AI is finding the best combinations for delicious meals</p>
            
            {/* Cancel button */}
            <button 
              onClick={handleCancelGeneration}
              className="px-6 py-2 bg-white border border-red-500 text-red-500 rounded-full hover:bg-red-50 flex items-center mx-auto"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel Generation
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
      
      {/* Preferences Updated Notice */}
      {showPreferencesUpdated && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center mb-2 sm:mb-0">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
              <p className="text-blue-800">Your preferences have been updated but recipes haven't been regenerated.</p>
            </div>
            <button
              onClick={regenerateRecipes}
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 text-sm flex items-center whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New Recipes
            </button>
          </div>
        </div>
      )}
      
      {/* Results Info Banner */}
      <div className="container mx-auto px-4 mt-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">
            <span className="font-medium">Found {recipes.length} recipes</span> matching your ingredients
            {recipes.length > 0 && (
              <span className="ml-1 md:ml-4">
                Cooking time: ~{Math.min(...recipes.map(r => (r.prepTime || 0) + (r.cookTime || 0)))} - 
                {Math.max(...recipes.map(r => (r.prepTime || 0) + (r.cookTime || 0)))} min
              </span>
            )}
          </p>
        </div>
      </div>
      
      {/* Sort Dropdown and Action Buttons */}
      <div className="container mx-auto px-4 mt-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
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
                      onClick={() => {
                        setSortMode('missing');
                        setDropdownOpen(false);
                      }}
                    >
                      Fewest missing ingredients
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={goBackToPreferences}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Update Preferences
            </button>
            
            <button
              onClick={regenerateRecipes}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-md font-medium hover:bg-green-200 transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Regenerate Recipes
            </button>
          </div>
        </div>
      </div>
      
      {/* Recipe List */}
      <div className="container mx-auto px-4 py-6 flex-grow">
        {recipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No recipes found. Try selecting different ingredients.</p>
            <button
              onClick={() => router.push('/ingredients')}
              className="px-6 py-3 rounded-full bg-mise-500 text-white font-medium inline-flex items-center"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Change Ingredients
            </button>
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
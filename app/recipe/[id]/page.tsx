'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Clock, User, AlertTriangle, Star, Info, ShoppingBag, Check, ChevronRight, Bookmark } from 'lucide-react';
import { Recipe } from '../../../lib/types';
import Header from '../../../components/layout/Header';
import { useAuth } from '../../../context/AuthContext';

export default function RecipeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isAuthenticated, saveRecipe, removeRecipe } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ingredients');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [servings, setServings] = useState(2);
  const [isSaved, setIsSaved] = useState(false);
  
  // Use the param directly instead of a ref to avoid the warning for now
  // We can refactor this in the future when React.use() is required
  
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        
        // Try to get from sessionStorage first (for recently generated recipes)
        const storedRecipes = sessionStorage.getItem('generatedRecipes');
        if (storedRecipes) {
          try {
            const allRecipes = JSON.parse(storedRecipes);
            const foundRecipe = allRecipes.find((r: Recipe) => r.id === params.id);
             
            if (foundRecipe) {
              console.log("Found recipe in session storage:", foundRecipe.title);
              setRecipe(foundRecipe);
              setServings(foundRecipe.servings || 2);
              setLoading(false);
              return;
            }
          } catch (parseError) {
            console.error("Error parsing stored recipes:", parseError);
          }
        }
        
        // If not in sessionStorage, fetch from Firestore
        try {
          const { getRecipeById } = await import('../../../lib/api');
          const fetchedRecipe = await getRecipeById(params.id);
          
          if (fetchedRecipe) {
            console.log("Found recipe in Firestore:", fetchedRecipe.title);
            setRecipe(fetchedRecipe);
            setServings(fetchedRecipe.servings || 2);
            setLoading(false);
            return;
          }
        } catch (firestoreError) {
          console.error("Error fetching from Firestore:", firestoreError);
        }
        
        // Try direct API call as a last resort
        try {
          console.log("Fetching recipe from API:", params.id);
          const response = await fetch(`/api/recipes/${params.id}`);
          if (response.ok) {
            const apiRecipe = await response.json();
            setRecipe(apiRecipe);
            setServings(apiRecipe.servings || 2);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.error("API fetch error:", apiError);
        }
        
        console.error("Recipe not found:", params.id);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recipe:', error);
        setLoading(false);
      }
    };
    
    fetchRecipe();
  }, [params.id]);
  
  // Check if recipe is saved in user's collection
  useEffect(() => {
    if (isAuthenticated && user && recipe) {
      setIsSaved(user.savedRecipes.includes(recipe.id));
    }
  }, [isAuthenticated, user, recipe]);
  
  // Handle saving recipe to collection
  const handleSaveRecipe = () => {
    if (!isAuthenticated) {
      // If not authenticated, prompt user to login with a message
      const confirmLogin = window.confirm(
        "You need to be logged in to save recipes to your collection. Would you like to log in now?"
      );
      
      if (confirmLogin) {
        // Store the current recipe ID in sessionStorage so we can offer to save it after login
        sessionStorage.setItem('pendingSaveRecipe', recipe!.id);
        router.push('/login');
      }
      return;
    }
    
    if (isSaved) {
      removeRecipe(recipe!.id);
      setIsSaved(false);
    } else {
      saveRecipe(recipe!.id);
      setIsSaved(true);
    }
  };
  
  // Toggle ingredient selected state (for checklist functionality)
  const toggleIngredient = (id: string) => {
    if (selectedIngredients.includes(id)) {
      setSelectedIngredients(selectedIngredients.filter(ing => ing !== id));
    } else {
      setSelectedIngredients([...selectedIngredients, id]);
    }
  };
  
  // Function to adjust servings
  const adjustServings = (amount: number) => {
    const newServings = Math.max(1, servings + amount);
    setServings(newServings);
  };
  
  // Function to determine tab styles
  const getTabStyle = (tab: string) => {
    return activeTab === tab
      ? 'bg-mise-500 text-white'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
  };
  
  // Function to render ingredient availability badge
  const getIngredientBadge = (ingredient: any) => {
    if (ingredient.available) {
      return (
        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">Available</span>
      );
    } else if (!ingredient.essential) {
      return (
        <span className="px-2 py-1 rounded text-xs bg-amber-100 text-amber-800">Optional</span>
      );
    } else {
      return (
        <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">Not listed</span>
      );
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header title="Recipe Details" />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-mise-500 border-opacity-50 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading recipe details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!recipe) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header title="Recipe Not Found" />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
            <div className="text-red-500 text-5xl mb-4">😕</div>
            <h2 className="text-xl font-bold mb-2">Recipe Not Found</h2>
            <p className="text-gray-600 mb-6">We couldn't find the recipe you're looking for. It may have been removed or is no longer available.</p>
            <button 
              onClick={() => router.push('/ingredients')}
              className="px-6 py-3 rounded-full bg-mise-500 text-white font-medium"
            >
              Create a New Recipe
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Recipe Details" />
      
      {/* Recipe Hero Section */}
      <div className="bg-gray-100">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{recipe.title}</h1>
          
          {/* Recipe Metadata */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-mise-500 text-white text-sm flex items-center">
              <User className="w-4 h-4 mr-1" />
              {recipe.skillLevel}
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-sm flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {recipe.prepTime + recipe.cookTime} min
            </span>
            {recipe.rating && (
              <span className="px-3 py-1 rounded-full bg-blue-500 text-white text-sm flex items-center">
                <Star className="w-4 h-4 mr-1" />
                {recipe.rating}
              </span>
            )}
          </div>
          
          {/* Description */}
          {recipe.description && (
            <p className="text-gray-700 mb-4">{recipe.description}</p>
          )}
          
          {/* Save to Collection Button */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleSaveRecipe}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                isSaved 
                  ? 'bg-mise-100 text-mise-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              {isSaved ? 'Saved to Collection' : 'Save to Collection'}
            </button>
          </div>
          
          {/* Allergy Alert Banner - Safety Feature */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start mt-4">
            <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-blue-800">Allergy Information:</p>
              <p className="text-blue-800">
                {recipe.allergyInfo && recipe.allergyInfo.safe && recipe.allergyInfo.safe.length > 0 && recipe.allergyInfo.safe[0] !== "none specified" ? (
                  <>
                    <span>This recipe is </span>
                    {recipe.allergyInfo.safe.map((item, index) => (
                      <span key={item}>
                        {index > 0 && index < recipe.allergyInfo.safe.length - 1 && ', '}
                        {index > 0 && index === recipe.allergyInfo.safe.length - 1 && ' and '}
                        <span className="font-medium">{item}</span>
                      </span>
                    ))}
                    <span>.</span>
                  </>
                ) : (
                  <span>No specific allergy information available.</span>
                )}
              </p>
              {recipe.allergyInfo && recipe.allergyInfo.warnings && recipe.allergyInfo.warnings.length > 0 && recipe.allergyInfo.warnings[0] !== "none" && (
                <div className="mt-1 flex items-center">
                  <AlertTriangle className="w-4 h-4 text-red-600 mr-1" />
                  <p className="text-red-600 font-medium">
                    Warning: {recipe.allergyInfo.warnings.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content with Tabs */}
      <div className="container mx-auto px-4 flex-grow">
        {/* Tab Navigation */}
        <div className="flex border-b overflow-x-auto">
          <button 
            onClick={() => setActiveTab('ingredients')}
            className={`px-4 py-3 font-medium text-sm ${getTabStyle('ingredients')}`}
          >
            Ingredients
          </button>
          <button 
            onClick={() => setActiveTab('instructions')}
            className={`px-4 py-3 font-medium text-sm ${getTabStyle('instructions')}`}
          >
            Instructions
          </button>
          <button 
            onClick={() => setActiveTab('safety')}
            className={`px-4 py-3 font-medium text-sm ${getTabStyle('safety')}`}
          >
            Safety Info
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="py-4">
          {/* Ingredients Tab */}
          {activeTab === 'ingredients' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Ingredients ({servings} servings)</h3>
                <div className="flex items-center">
                  <button 
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-l-md"
                    onClick={() => adjustServings(-1)}
                    disabled={servings <= 1}
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-sm bg-white border-t border-b border-gray-300">{servings}</span>
                  <button 
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-r-md"
                    onClick={() => adjustServings(1)}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                {recipe.ingredients && recipe.ingredients.map((ingredient) => (
                  <div 
                    key={ingredient.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                  >
                    <div className="flex items-center">
                      <div 
                        onClick={() => toggleIngredient(ingredient.id)}
                        className={`w-5 h-5 border rounded mr-3 flex items-center justify-center cursor-pointer ${
                          selectedIngredients.includes(ingredient.id) 
                            ? 'border-mise-500 bg-mise-500' 
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedIngredients.includes(ingredient.id) && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className={selectedIngredients.includes(ingredient.id) ? 'line-through text-gray-500' : ''}>
                        {ingredient.name}
                      </span>
                    </div>
                    {getIngredientBadge(ingredient)}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Instructions Tab */}
          {activeTab === 'instructions' && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Step-by-Step Instructions</h3>
              <div className="space-y-6">
                {recipe.instructions && recipe.instructions.map((step, index) => (
                  <div key={step.id} className="flex">
                    <div className="w-8 h-8 rounded-full bg-mise-500 text-white flex items-center justify-center flex-shrink-0 mt-1">
                      {index + 1}
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-800">{step.text}</p>
                      
                      {step.safetyNote && (
                        <div className="mt-2 bg-amber-50 border border-amber-200 rounded p-2 flex items-start">
                          <AlertTriangle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-amber-800">{step.safetyNote}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Safety Info Tab */}
          {activeTab === 'safety' && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Safety Information</h3>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <h4 className="font-bold text-amber-800 mb-2 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Important Safety Notes
                </h4>
                {recipe.safetyNotes && recipe.safetyNotes.length > 0 ? (
                  <ul className="space-y-2">
                    {recipe.safetyNotes.map((note, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs mr-2 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-amber-800">{note}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-amber-800">No specific safety notes have been provided for this recipe.</p>
                )}
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-2">Allergy Information</h4>
                
                {recipe.allergyInfo && recipe.allergyInfo.safe && recipe.allergyInfo.safe.length > 0 && recipe.allergyInfo.safe[0] !== "none specified" && (
                  <div className="mb-3">
                    <p className="font-medium text-gray-700 mb-1">Safe for:</p>
                    <div className="flex flex-wrap gap-2">
                      {recipe.allergyInfo.safe.map(item => (
                        <span key={item} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {recipe.allergyInfo && recipe.allergyInfo.warnings && recipe.allergyInfo.warnings.length > 0 && recipe.allergyInfo.warnings[0] !== "none" && (
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Contains:</p>
                    <div className="flex flex-wrap gap-2">
                      {recipe.allergyInfo.warnings.map(item => (
                        <span key={item} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {(!recipe.allergyInfo || 
                  !recipe.allergyInfo.warnings || 
                  recipe.allergyInfo.warnings.length === 0 || 
                  recipe.allergyInfo.warnings[0] === "none") && 
                 (!recipe.allergyInfo || 
                  !recipe.allergyInfo.safe || 
                  recipe.allergyInfo.safe.length === 0 || 
                  recipe.allergyInfo.safe[0] === "none specified") && (
                  <p className="text-gray-600">No specific allergy information available.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation Footer */}
      <div className="container mx-auto px-4 py-4 border-t border-gray-200 bg-white">
        <div className="flex justify-between">
          <button 
            className="px-6 py-3 rounded-full border border-mise-500 text-mise-500 font-medium flex items-center hover:bg-mise-50"
            onClick={() => router.back()}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Results
          </button>
        </div>
      </div>
    </div>
  );
}
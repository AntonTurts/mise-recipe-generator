// components/recipe/RecipeCard.tsx
'use client';

import Link from 'next/link';
import { Clock, Check, AlertCircle, ThumbsUp } from 'lucide-react';
import { Recipe } from '../../lib/types';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  // Function to render skill level badge
  const getSkillBadge = (level: string) => {
    const styles: Record<string, { bg: string, text: string }> = {
      beginner: { bg: 'bg-mise-500', text: 'B' },
      intermediate: { bg: 'bg-amber-500', text: 'I' },
      advanced: { bg: 'bg-red-500', text: 'A' }
    };
    
    return (
      <div className="flex items-center">
        <div className={`${styles[level]?.bg || 'bg-mise-500'} w-6 h-6 rounded-full flex items-center justify-center text-white mr-2`}>
          {styles[level]?.text || 'B'}
        </div>
        <span className="capitalize">{level}</span>
      </div>
    );
  };
  
  // Function to render ingredient status
  const getIngredientStatus = (recipe: Recipe) => {
    if (!recipe.missingIngredients || recipe.missingIngredients.length === 0) {
      return (
        <div className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm flex items-center">
          <Check className="w-4 h-4 mr-1" />
          All ingredients available
        </div>
      );
    } else {
      return (
        <div className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          Missing: {recipe.missingIngredients.join(', ')}
        </div>
      );
    }
  };
  
  // Function to render allergy information
  const getAllergyInfo = (recipe: Recipe) => {
    if (recipe.allergyInfo?.warnings && recipe.allergyInfo.warnings.length > 0) {
      return (
        <div className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {recipe.allergyInfo.warnings[0]}
        </div>
      );
    } else if (recipe.allergyInfo?.safe && recipe.allergyInfo.safe.length > 0) {
      return (
        <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm flex items-center">
          <Check className="w-4 h-4 mr-1" />
          {recipe.allergyInfo.safe[0]}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{recipe.title || 'Untitled Recipe'}</h3>
        
        {/* Recipe Metadata */}
        <div className="flex flex-wrap gap-4 mb-3">
          <div className="flex items-center">
            {getSkillBadge(recipe.skillLevel || 'beginner')}
          </div>
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-amber-500 mr-1" />
            <span>{((recipe.prepTime || 0) + (recipe.cookTime || 0))} min</span>
          </div>
          {typeof recipe.match === 'number' && (
            <div className="flex items-center">
              <ThumbsUp className="w-5 h-5 text-blue-500 mr-1" />
              <span>{recipe.match}% match</span>
            </div>
          )}
        </div>
        
        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {getIngredientStatus(recipe)}
          {getAllergyInfo(recipe)}
        </div>
        
        {/* Description */}
        {recipe.description && (
          <p className="text-gray-700 mb-4">{recipe.description}</p>
        )}
        
        {/* Safety warning if applicable */}
        {recipe.safetyCheck && !recipe.safetyCheck.isValid && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded p-2 flex items-start">
            <AlertCircle className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{recipe.safetyCheck.message}</p>
          </div>
        )}
        
        {/* View Button */}
        <div className="flex justify-end">
          <Link 
            href={`/recipe/${recipe.id}`}
            className="px-4 py-2 bg-mise-500 text-white rounded-full text-sm hover:bg-mise-600"
          >
            View Recipe
          </Link>
        </div>
      </div>
    </div>
  );
}
// app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import { Recipe } from '../../lib/types';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  useEffect(() => {
    // Load saved recipes
    const fetchSavedRecipes = async () => {
      if (!user || user.savedRecipes.length === 0) {
        setSavedRecipes([]);
        setLoadingRecipes(false);
        return;
      }
      
      try {
        setLoadingRecipes(true);
        
        // Try to get recipes from sessionStorage first
        const storedRecipes = sessionStorage.getItem('generatedRecipes');
        if (storedRecipes) {
          const allRecipes = JSON.parse(storedRecipes);
          const userSavedRecipes = allRecipes.filter((recipe: Recipe) => 
            user.savedRecipes.includes(recipe.id)
          );
          
          if (userSavedRecipes.length > 0) {
            setSavedRecipes(userSavedRecipes);
            setLoadingRecipes(false);
            return;
          }
        }
        
        // If no recipes in sessionStorage, try to fetch from Firestore
        // Note: In a production app, you would store recipes in Firestore
        // This is placeholder logic for now
        const mockRecipe: Recipe = {
          id: 'sample-1',
          title: 'Saved Recipe Example',
          skillLevel: 'beginner',
          prepTime: 10,
          cookTime: 15,
          servings: 2,
          ingredients: [],
          instructions: [],
          allergyInfo: {
            safe: [],
            warnings: []
          },
          safetyNotes: [],
          description: 'This is a placeholder for your saved recipes.'
        };
        
        setSavedRecipes(user.savedRecipes.map(() => mockRecipe));
      } catch (error) {
        console.error('Failed to load saved recipes:', error);
      } finally {
        setLoadingRecipes(false);
      }
    };
    
    if (user) {
      fetchSavedRecipes();
    }
  }, [user]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header title="Profile" />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-mise-500 border-opacity-50 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // Will redirect to login due to useEffect
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Profile" />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              My Profile
            </h1>
            <button 
              onClick={logout} 
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
          
          <div className="py-2">
            <p className="text-gray-600">Email: <span className="font-medium text-gray-900">{user?.email}</span></p>
            {user?.name && (
              <p className="text-gray-600">Name: <span className="font-medium text-gray-900">{user.name}</span></p>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Recipe Collection</h2>
          
          {loadingRecipes ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-mise-500 border-opacity-50 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your recipe collection...</p>
            </div>
          ) : savedRecipes.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">You haven't saved any recipes yet.</p>
              <Link href="/ingredients" className="px-4 py-2 bg-mise-500 text-white rounded-md hover:bg-mise-600">
                Start creating recipes
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {savedRecipes.map(recipe => (
                <Link 
                  key={recipe.id} 
                  href={`/recipe/${recipe.id}`}
                  className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 text-gray-900">{recipe.title}</h3>
                    <div className="flex gap-2 mb-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{recipe.skillLevel}</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{recipe.prepTime + recipe.cookTime} min</span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">{recipe.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
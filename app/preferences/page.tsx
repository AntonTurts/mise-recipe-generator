'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserPreferences } from '../../lib/types';
import { allergies, dietaryOptions } from '../../data/allergies';
import { equipmentList } from '../../data/equipment';
import Header from '../../components/layout/Header';

export default function PreferencesPage() {
  const router = useRouter();
  
  // Default user preferences
  const defaultPreferences: UserPreferences = {
    allergies: [],
    dietaryPreferences: [],
    skillLevel: 1,
    cookingTime: 30,
    equipment: ['oven', 'microwave']
  };

  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [originalPreferences, setOriginalPreferences] = useState<string>('');

  // Try to load from localStorage on initial render
  useEffect(() => {
    // Check if ingredients are selected
    const savedIngredients = localStorage.getItem('selectedIngredients');
    if (!savedIngredients || JSON.parse(savedIngredients).length === 0) {
      router.push('/ingredients');
      return;
    }
 
    // Load saved preferences
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userPreferences');
      if (saved) {
        try {
          const parsedPreferences = JSON.parse(saved);
          setPreferences(parsedPreferences);
          // Store original preferences for comparison later
          setOriginalPreferences(saved);
        } catch (e) {
          console.error('Failed to parse saved preferences', e);
        }
      }
    }
  }, [router]);
  
  // Toggle allergy selection
  const toggleAllergy = (allergyId: string) => {
    setPreferences(prev => {
      const newAllergies = prev.allergies.includes(allergyId)
        ? prev.allergies.filter(a => a !== allergyId)
        : [...prev.allergies, allergyId];
      
      return { ...prev, allergies: newAllergies };
    });
  };
  
  // Toggle dietary preference
  const toggleDietaryPreference = (preferenceId: string) => {
    setPreferences(prev => {
      const newPreferences = prev.dietaryPreferences.includes(preferenceId)
        ? prev.dietaryPreferences.filter(p => p !== preferenceId)
        : [...prev.dietaryPreferences, preferenceId];
      
      return { ...prev, dietaryPreferences: newPreferences };
    });
  };
  
  // Toggle equipment
  const toggleEquipment = (equipmentId: string) => {
    setPreferences(prev => {
      const newEquipment = prev.equipment.includes(equipmentId)
        ? prev.equipment.filter(e => e !== equipmentId)
        : [...prev.equipment, equipmentId];
      
      return { ...prev, equipment: newEquipment };
    });
  };
  
  // Set skill level
  const setSkillLevel = (level: number) => {
    setPreferences(prev => ({ ...prev, skillLevel: level }));
  };
  
  // Set cooking time
  const setCookingTime = (time: number) => {
    setPreferences(prev => ({ ...prev, cookingTime: time }));
  };
  
  // Handle navigation
  const handleBack = () => {
    router.push('/ingredients');
  };
  
  const handleFindRecipes = () => {
    // Save preferences
    const preferencesJson = JSON.stringify(preferences);
    localStorage.setItem('userPreferences', preferencesJson);
    
    // Check if preferences have changed
    if (preferencesJson !== originalPreferences) {
      // Set a flag to indicate preferences have been updated
      sessionStorage.setItem('preferencesChanged', 'true');
    }
    
    router.push('/recipes');
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Preferences & Constraints" />
      
      {/* Progress Bar */}
      <div className="container mx-auto px-4 mt-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-mise-500 h-2 rounded-full" style={{ width: '66%' }}></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">Step 2 of 3: Set your preferences</p>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 flex-grow">
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          {/* Allergies and Diet Restrictions - Critical for safety */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start mb-2">
              <AlertTriangle className="text-amber-600 h-5 w-5 mt-1 mr-2" />
              <div>
                <h3 className="text-lg font-bold text-amber-800">Dietary Restrictions & Allergies</h3>
                <p className="text-sm text-amber-700">Select any allergies or dietary restrictions that apply to you</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {allergies.map(allergy => (
                <div 
                  key={allergy.id}
                  onClick={() => toggleAllergy(allergy.id)}
                  className={`flex items-center p-2 border rounded-md cursor-pointer ${
                    preferences.allergies.includes(allergy.id) 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-amber-200'
                  }`}
                >
                  <div className={`w-5 h-5 border rounded mr-2 flex items-center justify-center ${
                    preferences.allergies.includes(allergy.id) 
                      ? 'border-amber-500 bg-amber-500' 
                      : 'border-amber-300'
                  }`}>
                    {preferences.allergies.includes(allergy.id) && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span>{allergy.name}</span>
                </div>
              ))}
            </div>
            
            <h3 className="text-lg font-bold text-amber-800 mt-6 mb-2">Dietary Preferences</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {dietaryOptions.map(option => (
                <div 
                  key={option.id}
                  onClick={() => toggleDietaryPreference(option.id)}
                  className={`flex items-center p-2 border rounded-md cursor-pointer ${
                    preferences.dietaryPreferences.includes(option.id) 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-amber-200'
                  }`}
                >
                  <div className={`w-5 h-5 border rounded mr-2 flex items-center justify-center ${
                    preferences.dietaryPreferences.includes(option.id) 
                      ? 'border-amber-500 bg-amber-500' 
                      : 'border-amber-300'
                  }`}>
                    {preferences.dietaryPreferences.includes(option.id) && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span>{option.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Cooking Skill Level */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Cooking Skill Level</h3>
            <div className="flex justify-center space-x-8 items-center w-full max-w-md mx-auto">
              {[
                { level: 1, name: 'Beginner' },
                { level: 2, name: 'Intermediate' },
                { level: 3, name: 'Advanced' }
              ].map((item) => (
                <div key={item.level} className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setSkillLevel(item.level)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 text-lg ${
                      preferences.skillLevel === item.level 
                        ? 'bg-mise-500 text-white' 
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.level}
                  </button>
                  <span className="text-sm text-center text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Time Constraints */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Time Available</h3>
            
            <div className="max-w-md mx-auto">
                <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">How much time do you have?</span>
                    <span className="text-sm font-medium text-mise-600">{preferences.cookingTime} minutes</span>
            </div>
              
            <div className="relative">
                <div className="absolute top-1/2 left-0 right-0 h-1 -mt-0.5 bg-gray-200 rounded"></div>
                <input
                    type="range"
                    min={5}
                    max={180}
                    step={5}
                    value={preferences.cookingTime}
                    onChange={(e) => setCookingTime(parseInt(e.target.value))}
                    className="relative z-10 w-full accent-mise-500 h-2 rounded-lg appearance-none cursor-pointer bg-transparent"
                />
            </div>
              
            <div className="flex justify-between mt-1 mb-5">
                <span className="text-xs text-gray-500">5 min</span>
                <span className="text-xs text-gray-500">30 min</span>
                <span className="text-xs text-gray-500">60 min</span>
                <span className="text-xs text-gray-500">180 min</span>
            </div>
              
            <div className="flex justify-between text-sm text-gray-600">
                <div className="text-center">
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs mb-1">Fast</div>
                    <div>Quick meals</div>
                </div>
                <div className="text-center">
                    <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs mb-1">Medium</div>
                    <div>Standard cooking</div>
                </div>
                <div className="text-center">
                    <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs mb-1">Slow</div>
                    <div>Slow cooking</div>
                </div>
                </div>
            </div>
            </div>
          
          {/* Equipment Available */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Kitchen Equipment (Optional)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {equipmentList.map(item => (
                <div 
                  key={item.id}
                  onClick={() => toggleEquipment(item.id)}
                  className={`flex items-center p-2 border rounded-md cursor-pointer ${
                    preferences.equipment.includes(item.id) 
                      ? 'border-mise-500 bg-mise-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className={`w-5 h-5 border rounded mr-2 flex items-center justify-center ${
                    preferences.equipment.includes(item.id) 
                      ? 'border-mise-500 bg-mise-500' 
                      : 'border-gray-300'
                  }`}>
                    {preferences.equipment.includes(item.id) && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
      
      {/* Navigation Buttons */}
      <div className="container mx-auto px-4 py-4 border-t border-gray-200 bg-white">
        <div className="flex justify-between">
          <button 
            className="px-6 py-3 rounded-full border border-mise-500 text-mise-500 font-medium flex items-center hover:bg-mise-50"
            onClick={handleBack}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </button>
          <button 
            className="px-6 py-3 rounded-full bg-mise-500 text-white font-medium flex items-center hover:bg-mise-600"
            onClick={handleFindRecipes}
          >
            Find Recipes
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
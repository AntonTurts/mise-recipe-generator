// context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../lib/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;
  saveRecipe: (recipeId: string) => void;
  removeRecipe: (recipeId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        // Get additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            // Get user data from Firestore
            const userData = userDoc.data();
            
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || userData.name || '',
              savedRecipes: userData.savedRecipes || []
            });
            
            setIsAuthenticated(true);
          } else {
            // Create new user document if it doesn't exist
            const newUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || '',
              savedRecipes: [],
              createdAt: serverTimestamp()
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || '',
              savedRecipes: []
            });
            
            setIsAuthenticated(true);
          }
          
          // Update last login
          await updateDoc(doc(db, 'users', firebaseUser.uid), {
            lastLogin: serverTimestamp()
          });
        } catch (error) {
          console.error('Error getting user data:', error);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (name && userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
        
        // Update user document with name
        await updateDoc(doc(db, 'users', userCredential.user.uid), {
          name: name
        });
      }
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const saveRecipe = async (recipeId: string) => {
    if (!user) return;
    
    try {
      // Update Firestore
      await updateDoc(doc(db, 'users', user.id), {
        savedRecipes: arrayUnion(recipeId)
      });
      
      // Update local state
      setUser({
        ...user,
        savedRecipes: [...user.savedRecipes, recipeId]
      });
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  const removeRecipe = async (recipeId: string) => {
    if (!user) return;
    
    try {
      // Update Firestore
      await updateDoc(doc(db, 'users', user.id), {
        savedRecipes: arrayRemove(recipeId)
      });
      
      // Update local state
      setUser({
        ...user,
        savedRecipes: user.savedRecipes.filter(id => id !== recipeId)
      });
    } catch (error) {
      console.error('Error removing recipe:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      saveRecipe,
      removeRecipe
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
import Link from 'next/link';
import Header from '../components/layout/Header';
import { AlertTriangle } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Find recipes based on what's in your kitchen
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Let Mise help you discover delicious recipes using the ingredients you already have
            </p>
            
            <div className="space-y-4 flex flex-col sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
              <Link 
                href="/ingredients" 
                className="bg-mise-500 hover:bg-mise-600 text-white text-lg py-3 px-6 rounded-full inline-block w-full sm:w-auto text-center"
              >
                Start with ingredients
              </Link>
              
              <Link 
                href="/collections" 
                className="border border-mise-500 text-mise-500 hover:bg-mise-50 text-lg py-3 px-6 rounded-full inline-block w-full sm:w-auto text-center"
              >
                Browse recipe collections
              </Link>
            </div>
            
            <div className="mt-12 flex items-start justify-center bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
              <AlertTriangle className="text-amber-600 h-5 w-5 mt-1 mr-2 flex-shrink-0" />
              <p className="text-amber-800">
                <span className="font-bold">Safety First:</span> Always review recipes for your dietary needs and allergies. 
                Our app provides allergen information, but please verify ingredients before consuming any dish.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="py-6 bg-white border-t">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} Mise - Recipe Generator - University Project by Anton Turtsevych</p>
        </div>
      </footer>
    </div>
  );
}
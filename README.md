# Mise - Recipe Generator

![Mise Logo](https://placeholder.co/200x100)

## About

Mise is an AI-powered recipe generator application designed to help reduce food waste by creating personalized recipes from ingredients you already have on hand. The application uses OpenAI's GPT-4 to generate safe, appropriate recipes tailored to your cooking skill level, dietary preferences, and available equipment.

## Key Features

- **Ingredient-First Approach**: Start with what you have, not what you need to buy
- **Personalized Recipes**: Filter by skill level, dietary restrictions, and time constraints
- **Safety-Focused**: Clear safety information and allergen warnings
- **User Accounts**: Save favorite recipes and preferences
- **Mobile Responsive**: Easy to use while cooking

## Technology Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Next.js API Routes
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **AI**: OpenAI GPT-4 API
- **Deployment**: Vercel



## Project Structure

```
mise-recipe-generator/
├── app/                    # Next.js application pages
│   ├── api/                # API routes
│   ├── ingredients/        # Ingredient selection page
│   ├── preferences/        # User preferences page
│   ├── recipes/            # Recipe results page
│   ├── recipe/[id]/        # Recipe detail page
│   ├── profile/            # User profile page
│   └── ...
├── components/             # React components
│   ├── layout/             # Layout components
│   ├── recipe/             # Recipe-related components
│   ├── ui/                 # UI components
│   └── ...
├── context/                # React context providers
│   └── AuthContext.tsx     # Authentication context
├── data/                   # Static data
│   ├── ingredients.ts      # Ingredient data
│   ├── allergies.ts        # Allergy data
│   └── equipment.ts        # Equipment data
├── lib/                    # Utility functions
│   ├── firebase.ts         # Firebase configuration
│   ├── types.ts            # TypeScript types
│   ├── safety.ts           # Recipe safety validation
│   └── ...
├── styles/                 # CSS styles
└── ...
```

## Features in Detail

### Ingredient Selection

Users can input ingredients they have available, with suggestions for common items. The application stores this list to generate appropriate recipes.

### Preferences & Constraints

Users can specify:
- Dietary restrictions and allergies
- Cooking skill level
- Maximum cooking time
- Available kitchen equipment

### Recipe Generation

The application uses OpenAI's GPT-4 API to create personalized recipes based on:
- Available ingredients
- User preferences
- Safety considerations
- Cooking skill level

### Recipe Presentation

Recipes include:
- Detailed ingredients list with quantities
- Step-by-step instructions
- Safety notes and allergen information
- Cooking and preparation times
- Skill level indicator

### User Accounts

- Create and manage user profiles
- Save favorite recipes
- Track recipe history
- Store preferences for future use

## Safety Focus

Safety is a core priority in Mise:

- All recipes undergo safety validation
- Clear allergen warnings provided
- Proper cooking instructions for raw ingredients
- Safety notes for high-risk preparation steps

## Project Roadmap

### Upcoming Features

- Recipe images via AI generation
- Nutritional information
- Shopping list integration
- Meal planning functionality
- Community recipe sharing

### Long-term Goals

- Mobile applications (iOS/Android)
- Integration with smart kitchen devices
- Expanded international cuisine options
- Recipe rating and feedback system


## Contact

Anton Turtsevych - [anton2.turtsevych@uwe.ac.uk](mailto:anton2.turtsevych@uwe.ac.uk)

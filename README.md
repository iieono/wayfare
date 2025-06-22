# Wayfare - AI-Powered Travel Planning Platform

_A comprehensive travel planning application built with Next.js, Supabase, and AI integration_

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Project Architecture](#project-architecture)
5. [Feature Documentation](#feature-documentation)
6. [Database Schema](#database-schema)
7. [API Integration](#api-integration)
8. [File Organization](#file-organization)
9. [Development Workflow](#development-workflow)
10. [Deployment](#deployment)

---

## 🌟 Project Overview

Wayfare is a full-stack travel planning application I built as my capstone project. It combines AI-powered travel assistance with community-driven content and real-time safety information. The app helps travelers plan routes, get personalized checklists, discover places, and stay safe while traveling.

### Key Features

- **AI Travel Assistant**: Chat with Gemini AI for personalized travel advice
- **Route Planning**: Interactive route selection with risk assessment
- **Personalized Checklists**: Dynamic checklists based on destination and traveler type
- **Community Stories**: Share and discover travel experiences
- **Safety Mapping**: Real-time safety reports with interactive maps
- **Places Discovery**: Community-driven place database with reviews

### Why I Built This

After struggling with planning my own international trips and realizing how scattered travel information can be, I wanted to create something that combines AI assistance with real community insights to make travel planning less stressful and more comprehensive.

---

## 🛠 Tech Stack

### Frontend

- **Next.js 14** (App Router) - React framework for full-stack development
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Pre-built, customizable UI components
- **Leaflet** - Interactive maps for safety visualization
- **Lucide React** - Beautiful, consistent icons

### Backend & Database

- **Supabase** - Backend as a Service providing:
  - PostgreSQL database with real-time capabilities
  - Authentication system
  - File storage for images
  - Row Level Security (RLS)
- **SQL** - Complex queries and database functions

### AI & External APIs

- **Google Gemini AI** - Free tier AI model for travel assistance
- **Vercel AI SDK** - Streaming AI responses and chat interface
- **Mapbox** - Geocoding, place search, and mapping services

### Development & Deployment

- **Vercel** - Hosting and deployment platform
- **Git** - Version control
- **ESLint & Prettier** - Code quality and formatting

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier)
- Mapbox account (free tier)
- Google AI Studio account (for Gemini API)

### Installation

1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/yourusername/wayfare-app.git
   cd wayfare-app
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_access_token
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
   \`\`\`

4. **Set up Supabase database:**

   - Create a new Supabase project
   - Run the SQL scripts in order from the `scripts/` folder:
     \`\`\`bash

   # Connect to your Supabase database and run these files in order:

   scripts/database-functions.sql
   scripts/update-checklists-schema.sql
   scripts/seed-countries-and-checklists.sql
   scripts/seed-safety-reports.sql
   scripts/upgrade-places-schema.sql
   scripts/fix-places-relationships.sql
   scripts/fix-country-constraint.sql
   scripts/create-profiles-and-fix-relationships.sql
   scripts/fix-user-relationships.sql
   scripts/add-more-countries.sql
   scripts/fix-place-reviews-profiles-relationship.sql
   scripts/add-story-comments-table.sql
   scripts/fix-stories-tips-relationships.sql
   \`\`\`

5. **Run the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open your browser:**
   Navigate to `http://localhost:3000`

---

## 🏗 Project Architecture

### Directory Structure

\`\`\`
wayfare-app/
├── app/ # Next.js App Router
│ ├── api/ # API routes
│ │ └── chat/ # AI chat endpoint
│ ├── auth/ # Authentication pages
│ │ ├── signin/
│ │ └── signup/
│ ├── my-stories/ # User content management
│ ├── places/ # Community places
│ ├── profile/ # User profile
│ ├── report-safety/ # Safety reporting
│ ├── route-planner/ # Main planning interface
│ ├── safety-map/ # Interactive safety map
│ ├── stories/ # Community stories
│ ├── layout.tsx # Root layout
│ ├── page.tsx # Home page
│ └── globals.css # Global styles
├── components/ # React components
│ ├── ui/ # Shadcn/ui components
│ ├── ai-travel-assistant.tsx # AI chat interface
│ ├── auth-provider.tsx # Authentication context
│ ├── enhanced-places-search.tsx # Place search
│ ├── leaflet-map.tsx # Map component
│ ├── navigation.tsx # Main navigation
│ └── personalized-checklist.tsx # Dynamic checklists
├── lib/ # Utilities and services
│ ├── supabase/ # Database clients
│ ├── mapbox-places.ts # Mapbox integration
│ └── utils.ts # Helper functions
├── hooks/ # Custom React hooks
├── types/ # TypeScript definitions
├── scripts/ # Database setup scripts
└── public/ # Static assets
\`\`\`

---

## 📚 Feature Documentation

### 🔐 Authentication System

#### Files:

- `components/auth-provider.tsx` - Authentication context
- `app/auth/signin/page.tsx` - Sign in interface
- `app/auth/signup/page.tsx` - User registration
- `lib/supabase/client.ts` - Client configuration

#### Authentication Provider (`components/auth-provider.tsx`)

\`\`\`typescript
// Provides global authentication state
const AuthProvider = ({ children }) => {
const [user, setUser] = useState(null)
const [loading, setLoading] = useState(true)

// Features:
// - Session management
// - Auto sign-out on token expiry
// - Loading states
// - Error handling

const signOut = async () => {
await supabase.auth.signOut()
router.push('/auth/signin')
}
}

// Usage in components:
const { user, loading, signOut } = useAuth()
\`\`\`

#### User Registration (`app/auth/signup/page.tsx`)

\`\`\`typescript
// Features:
// - Email/password registration
// - User type selection (student, tourist, other)
// - Username creation
// - Automatic profile creation
// - Form validation

const handleSignUp = async (e: React.FormEvent) => {
// 1. Create auth user
const { data, error } = await supabase.auth.signUp({
email, password
})

// 2. Create user profile
await supabase.from('users').insert({
id: data.user?.id,
username,
user_type,
email
})
}
\`\`\`

### 🤖 AI Travel Assistant & Route Planning

#### Files:

- `app/route-planner/page.tsx` - Main planning interface
- `components/ai-travel-assistant.tsx` - AI chat component
- `components/personalized-checklist.tsx` - Dynamic checklists
- `app/api/chat/route.ts` - AI API endpoint

#### Route Planner (`app/route-planner/page.tsx`)

\`\`\`typescript
// Multi-tab interface with:
// 1. AI Assistant - Contextual travel chat
// 2. My Checklist - Personalized, trackable items
// 3. Documents - Required items and restrictions
// 4. Safety - Risk assessment and reports

const RoutePlanner = () => {
const [activeTab, setActiveTab] = useState('ai')
const [routeData, setRouteData] = useState(null)

// Load route from localStorage (set on home page)
useEffect(() => {
const savedRoute = localStorage.getItem('selectedRoute')
if (savedRoute) {
const route = JSON.parse(savedRoute)
fetchRouteData(route.from, route.to)
}
}, [])

// Fetch comprehensive route data
const fetchRouteData = async (from: string, to: string) => {
// Get destination country info
// Load checklist templates
// Fetch safety reports
// Calculate risk scores
}
}
\`\`\`

#### AI Travel Assistant (`components/ai-travel-assistant.tsx`)

\`\`\`typescript
// Real-time chat with Google Gemini AI
const AITravelAssistant = ({ routeData }) => {
const [messages, setMessages] = useState([])
const [showQuickQuestions, setShowQuickQuestions] = useState(true)

// Generate contextual system prompt
const createSystemContext = () => {
return `You are a helpful travel assistant. The user is traveling from ${routeData.fromCountry} to ${routeData.toCountry}.

    Destination Info: ${JSON.stringify(routeData.destinationCountry)}
    Checklist Items: ${JSON.stringify(routeData.checklist)}
    Safety Reports: ${JSON.stringify(routeData.safetyReports)}

    Provide helpful, accurate travel advice. Keep responses concise and actionable.`

}

// Quick question buttons (disappear after first message)
const quickQuestions = [
"What documents do I need?",
"Current safety conditions?",
"What should I pack?",
"Local customs & culture?"
]

// Handle AI responses with streaming
const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
api: '/api/chat',
initialMessages: [{
role: 'assistant',
content: generateWelcomeMessage(routeData)
}],
body: { systemContext: createSystemContext() }
})
}
\`\`\`

#### Personalized Checklist (`components/personalized-checklist.tsx`)

\`\`\`typescript
// Dynamic checklist based on destination and user type
const PersonalizedChecklist = ({ routeData, userType }) => {
const [checklist, setChecklist] = useState([])
const [completedItems, setCompletedItems] = useState(new Set())

// Generate checklist from template
useEffect(() => {
if (routeData?.checklist) {
const items = [
...routeData.checklist.required_items,
...routeData.checklist.preparation_steps,
// Add user-type specific items
...(userType === 'student' ? studentSpecificItems : [])
]
setChecklist(items)
}
}, [routeData, userType])

// Toggle item completion
const toggleItem = (itemId: string) => {
const newCompleted = new Set(completedItems)
if (newCompleted.has(itemId)) {
newCompleted.delete(itemId)
} else {
newCompleted.add(itemId)
}
setCompletedItems(newCompleted)
}

// Calculate progress
const progress = (completedItems.size / checklist.length) \* 100
}
\`\`\`

### 👥 Community Features

#### Files:

- `app/stories/page.tsx` - Community stories and tips
- `app/my-stories/page.tsx` - Personal content management

#### Stories Platform (`app/stories/page.tsx`)

\`\`\`typescript
// Community-driven travel content
const StoriesPage = () => {
const [stories, setStories] = useState([])
const [tips, setTips] = useState([])
const [filters, setFilters] = useState({
country: '',
category: '',
userType: '',
season: ''
})

// Content types
interface Story {
id: number
title: string
content: string
category: 'experience' | 'tip' | 'warning' | 'culture' | 'food'
place_id: number
from_country_code: string
to_country_code: string
images: string[]
likes_count: number
author: User
created_at: string
}

interface Tip {
id: number
content: string
travel_season: 'spring' | 'summer' | 'autumn' | 'winter' | 'any'
place_id: number
images: string[]
likes_count: number
author: User
}

// Real-time like/unlike functionality
const handleLike = async (type: 'story' | 'tip', id: number) => {
if (type === 'story') {
await supabase.rpc('increment_story_likes', { story_id: id })
} else {
await supabase.rpc('increment_tip_likes', { tip_id: id })
}
// Update local state
}

// Advanced filtering
const applyFilters = () => {
let filtered = [...stories]
if (filters.country) {
filtered = filtered.filter(s =>
s.from_country_code === filters.country ||
s.to_country_code === filters.country
)
}
if (filters.category) {
filtered = filtered.filter(s => s.category === filters.category)
}
return filtered
}
}
\`\`\`

#### Personal Content Management (`app/my-stories/page.tsx`)

\`\`\`typescript
// User's personal stories and tips management
const MyStoriesPage = () => {
const [userContent, setUserContent] = useState([])
const [editingItem, setEditingItem] = useState(null)

// Content creation and editing
const handleEdit = (item: Story | Tip) => {
setEditingItem(item)
}

// Image upload handling
const uploadImages = async (files: File[]) => {
const uploadPromises = files.map(async (file) => {
const fileExt = file.name.split('.').pop()
const fileName = `${Math.random()}.${fileExt}`
const filePath = `story-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      return data.publicUrl
    })

    return Promise.all(uploadPromises)

}

// Bulk operations
const handleBulkDelete = async (selectedIds: number[]) => {
await supabase
.from('stories')
.delete()
.in('id', selectedIds)

    // Update local state
    setUserContent(prev => prev.filter(item => !selectedIds.includes(item.id)))

}
}
\`\`\`

### 🛡️ Safety & Security Features

#### Files:

- `app/safety-map/page.tsx` - Interactive safety map
- `app/report-safety/page.tsx` - Safety incident reporting
- `components/leaflet-map.tsx` - Map visualization

#### Safety Map (`app/safety-map/page.tsx`)

\`\`\`typescript
// Interactive map showing safety reports
const SafetyMapPage = () => {
const [safetyReports, setSafetyReports] = useState([])
const [selectedReport, setSelectedReport] = useState(null)
const [riskFilter, setRiskFilter] = useState('all')

// Risk level color coding
const getRiskColor = (rating: number) => {
if (rating <= 2) return '#ef4444' // High risk - Red
if (rating === 3) return '#f59e0b' // Medium risk - Yellow
return '#10b981' // Safe - Green
}

// Filter reports by risk level
const filteredReports = safetyReports.filter(report => {
if (riskFilter === 'all') return true
if (riskFilter === 'high') return report.rating <= 2
if (riskFilter === 'medium') return report.rating === 3
if (riskFilter === 'safe') return report.rating >= 4
return true
})

// Real-time updates
useEffect(() => {
const subscription = supabase
.channel('safety_reports')
.on('postgres_changes',
{ event: 'INSERT', schema: 'public', table: 'safety_reports' },
(payload) => {
setSafetyReports(prev => [...prev, payload.new])
}
)
.subscribe()

    return () => subscription.unsubscribe()

}, [])
}
\`\`\`

#### Safety Reporting (`app/report-safety/page.tsx`)

\`\`\`typescript
// Report safety incidents with location
const ReportSafetyPage = () => {
const [selectedLocation, setSelectedLocation] = useState(null)
const [reportData, setReportData] = useState({
rating: 5,
comment: '',
tags: [],
images: []
})

// Available safety tags
const safetyTags = [
'theft', 'scam', 'police', 'medical', 'transport',
'accommodation', 'food', 'natural-disaster', 'political',
'harassment', 'discrimination', 'language-barrier'
]

// Handle map click for location selection
const handleMapClick = async (lat: number, lng: number) => {
setSelectedLocation({ lat, lng })

    // Reverse geocode to get address
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
      )
      const data = await response.json()
      const address = data.features[0]?.place_name || 'Unknown location'
      setSelectedLocation(prev => ({ ...prev, address }))
    } catch (error) {
      console.error('Geocoding error:', error)
    }

}

// Submit safety report
const handleSubmit = async () => {
const { error } = await supabase
.from('safety_reports')
.insert({
latitude: selectedLocation.lat,
longitude: selectedLocation.lng,
rating: reportData.rating,
comment: reportData.comment,
tags: reportData.tags,
images: reportData.images,
country_code: extractCountryCode(selectedLocation.address),
user_id: user.id
})

    if (!error) {
      toast.success('Safety report submitted successfully!')
      router.push('/safety-map')
    }

}
}
\`\`\`

### 📍 Places & Discovery

#### Files:

- `app/places/page.tsx` - Community places platform
- `lib/mapbox-places.ts` - Mapbox API integration
- `components/enhanced-places-search.tsx` - Search functionality

#### Places Platform (`app/places/page.tsx`)

\`\`\`typescript
// Community-driven places database
const PlacesPage = () => {
const [places, setPlaces] = useState([])
const [selectedCategory, setSelectedCategory] = useState('all')

// Place categories
const categories = [
'restaurants', 'hotels', 'attractions', 'shopping',
'transportation', 'hospitals', 'banks', 'general'
]

// Place creation workflow
const handleCreatePlace = async (placeData: {
name: string,
category: string,
location: { lat: number, lng: number },
description: string,
images: string[]
}) => {
// 1. Upload images to Supabase storage
const imageUrls = await uploadImages(placeData.images)

    // 2. Create place record
    const { data, error } = await supabase
      .from('places')
      .insert({
        name: placeData.name,
        category: placeData.category,
        latitude: placeData.location.lat,
        longitude: placeData.location.lng,
        description: placeData.description,
        images: imageUrls,
        created_by: user.id
      })
      .select()
      .single()

    if (!error) {
      setPlaces(prev => [...prev, data])
      toast.success('Place added successfully!')
    }

}

// Review system
const submitReview = async (placeId: number, review: {
rating: number,
comment: string,
images?: string[]
}) => {
await supabase
.from('place_reviews')
.insert({
place_id: placeId,
user_id: user.id,
rating: review.rating,
comment: review.comment,
images: review.images || []
})
}
}
\`\`\`

#### Mapbox Integration (`lib/mapbox-places.ts`)

\`\`\`typescript
// Mapbox Places API wrapper
export class MapboxPlacesService {
private accessToken: string

constructor(accessToken: string) {
this.accessToken = accessToken
}

// Search places with proximity bias
async searchPlaces(
query: string,
proximity?: [number, number],
types?: string[]
): Promise<MapboxPlace[]> {
const params = new URLSearchParams({
q: query,
access_token: this.accessToken,
limit: '10',
...(proximity && { proximity: proximity.join(',') }),
...(types && { types: types.join(',') })
})

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`
    )

    const data = await response.json()
    return data.features || []

}

// Get detailed place information
async getPlaceDetails(placeId: string): Promise<MapboxPlace | null> {
const response = await fetch(
`https://api.mapbox.com/geocoding/v5/mapbox.places/${placeId}.json?access_token=${this.accessToken}`
)

    const data = await response.json()
    return data.features?.[0] || null

}

// Reverse geocoding
async reverseGeocode(longitude: number, latitude: number): Promise<string> {
const response = await fetch(
`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${this.accessToken}`
)

    const data = await response.json()
    return data.features?.[0]?.place_name || 'Unknown location'

}

// Extract country code from place data
extractCountryCode(place: MapboxPlace): string {
const countryContext = place.context?.find(c => c.id.startsWith('country'))
return countryContext?.short_code || 'unknown'
}
}
\`\`\`

---

## 🗄️ Database Schema

### Core Tables

#### Users Table

\`\`\`sql
CREATE TABLE users (
id UUID PRIMARY KEY REFERENCES auth.users(id),
email TEXT UNIQUE NOT NULL,
username TEXT UNIQUE NOT NULL,
avatar_url TEXT,
bio TEXT,
user_type TEXT CHECK (user_type IN ('student', 'tourist', 'other')) DEFAULT 'tourist',
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

#### Countries Table

\`\`\`sql
CREATE TABLE countries (
id SERIAL PRIMARY KEY,
code TEXT UNIQUE NOT NULL, -- ISO country code
name TEXT NOT NULL,
flag_url TEXT,
region TEXT,
official_languages TEXT[],
risk_score INTEGER CHECK (risk_score >= 1 AND risk_score <= 5) DEFAULT 3,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

#### Routes Table

\`\`\`sql
CREATE TABLE routes (
id SERIAL PRIMARY KEY,
from_country_code TEXT NOT NULL REFERENCES countries(code),
to_country_code TEXT NOT NULL REFERENCES countries(code),
description TEXT,
risk_score INTEGER CHECK (risk_score >= 1 AND risk_score <= 5),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
UNIQUE(from_country_code, to_country_code)
);
\`\`\`

#### Checklists Table

\`\`\`sql
CREATE TABLE checklists (
id SERIAL PRIMARY KEY,
country INTEGER REFERENCES countries(id),
user_type TEXT CHECK (user_type IN ('student', 'tourist', 'other')),
required_items JSONB DEFAULT '[]',
restricted_items JSONB DEFAULT '[]',
preparation_steps JSONB DEFAULT '[]',
official_links JSONB DEFAULT '{}',
is_template BOOLEAN DEFAULT true,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

#### Stories Table

\`\`\`sql
CREATE TABLE stories (
id SERIAL PRIMARY KEY,
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
title TEXT NOT NULL,
content TEXT NOT NULL,
category TEXT CHECK (category IN ('experience', 'tip', 'warning', 'culture', 'food')),
place_id INTEGER REFERENCES places(id),
from_country_code TEXT REFERENCES countries(code),
to_country_code TEXT REFERENCES countries(code),
images TEXT[] DEFAULT '{}',
likes_count INTEGER DEFAULT 0,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

#### Tips Table

\`\`\`sql
CREATE TABLE tips (
id SERIAL PRIMARY KEY,
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
content TEXT NOT NULL,
travel_season TEXT CHECK (travel_season IN ('spring', 'summer', 'autumn', 'winter', 'any')) DEFAULT 'any',
place_id INTEGER REFERENCES places(id),
images TEXT[] DEFAULT '{}',
likes_count INTEGER DEFAULT 0,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

#### Places Table

\`\`\`sql
CREATE TABLE places (
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
category TEXT NOT NULL,
latitude DECIMAL(10, 8) NOT NULL,
longitude DECIMAL(11, 8) NOT NULL,
description TEXT,
images TEXT[] DEFAULT '{}',
created_by UUID REFERENCES users(id),
average_rating DECIMAL(3, 2) DEFAULT 0,
review_count INTEGER DEFAULT 0,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

#### Safety Reports Table

\`\`\`sql
CREATE TABLE safety_reports (
id SERIAL PRIMARY KEY,
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
latitude DECIMAL(10, 8) NOT NULL,
longitude DECIMAL(11, 8) NOT NULL,
rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
comment TEXT,
tags TEXT[] DEFAULT '{}',
images TEXT[] DEFAULT '{}',
country_code TEXT REFERENCES countries(code),
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### Database Functions

#### Like/Unlike Functions

\`\`\`sql
-- Increment story likes
CREATE OR REPLACE FUNCTION increment_story_likes(story_id INTEGER)
RETURNS void AS $$
BEGIN
UPDATE stories
SET likes_count = likes_count + 1
WHERE id = story_id;
END;

$$
LANGUAGE plpgsql;

-- Decrement story likes
CREATE OR REPLACE FUNCTION decrement_story_likes(story_id INTEGER)
RETURNS void AS
$$

BEGIN
UPDATE stories
SET likes_count = GREATEST(likes_count - 1, 0)
WHERE id = story_id;
END;

$$
LANGUAGE plpgsql;

-- Similar functions for tips
CREATE OR REPLACE FUNCTION increment_tip_likes(tip_id INTEGER)
RETURNS void AS
$$

BEGIN
UPDATE tips
SET likes_count = likes_count + 1
WHERE id = tip_id;
END;

$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_tip_likes(tip_id INTEGER)
RETURNS void AS
$$

BEGIN
UPDATE tips
SET likes_count = GREATEST(likes_count - 1, 0)
WHERE id = tip_id;
END;

$$
LANGUAGE plpgsql;
\`\`\`

#### Update Place Ratings
\`\`\`sql
CREATE OR REPLACE FUNCTION update_place_rating()
RETURNS TRIGGER AS
$$

BEGIN
UPDATE places
SET
average_rating = (
SELECT AVG(rating)
FROM place_reviews
WHERE place_id = NEW.place_id
),
review_count = (
SELECT COUNT(\*)
FROM place_reviews
WHERE place_id = NEW.place_id
)
WHERE id = NEW.place_id;

RETURN NEW;
END;

$$
LANGUAGE plpgsql;

CREATE TRIGGER update_place_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON place_reviews
  FOR EACH ROW EXECUTE FUNCTION update_place_rating();
\`\`\`

---

## 🔌 API Integration

### AI Chat API (`app/api/chat/route.ts`)

\`\`\`typescript
import { google } from '@ai-sdk/google'
import { streamText } from 'ai'

export async function POST(req: Request) {
  try {
    const { messages, systemContext } = await req.json()

    // Create system message with travel context
    const systemMessage = {
      role: 'system' as const,
      content: systemContext || 'You are a helpful travel assistant.'
    }

    // Stream response from Gemini
    const result = await streamText({
      model: google('gemini-1.5-flash'),
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      maxTokens: 500, // Keep responses concise
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
\`\`\`

### Supabase Integration

#### Client Configuration (`lib/supabase/client.ts`)
\`\`\`typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'

export const createClient = () =>
  createClientComponentClient<Database>()

// Usage in components:
const supabase = createClient()
\`\`\`

#### Server Configuration (`lib/supabase/server.ts`)
\`\`\`typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export const createServerClient = () =>
  createServerComponentClient<Database>({ cookies })

// Usage in server components and API routes:
const supabase = createServerClient()
\`\`\`

### External API Services

#### Mapbox Integration
\`\`\`typescript
// Environment variables required:
// NEXT_PUBLIC_MAPBOX_TOKEN

const mapboxService = new MapboxPlacesService(
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN!
)

// Usage examples:
const places = await mapboxService.searchPlaces('restaurants', [lng, lat])
const address = await mapboxService.reverseGeocode(lng, lat)
\`\`\`

#### Google Gemini AI
\`\`\`typescript
// Environment variables required:
// GOOGLE_GENERATIVE_AI_API_KEY

// Integrated through Vercel AI SDK
import { google } from '@ai-sdk/google'

const model = google('gemini-1.5-flash')
\`\`\`

---

## 📁 File Organization

### By Functionality

#### 🔐 Authentication (4 files)
- `components/auth-provider.tsx` - Global auth context
- `app/auth/signin/page.tsx` - Sign in interface
- `app/auth/signup/page.tsx` - User registration
- `lib/supabase/client.ts` - Client configuration

#### 🗄️ Database (15+ files)
- `types/database.ts` - TypeScript definitions
- `scripts/*.sql` - Database setup and migrations
- `lib/supabase/server.ts` - Server configuration

#### 🤖 AI & Planning (4 files)
- `app/route-planner/page.tsx` - Main planning interface
- `components/ai-travel-assistant.tsx` - AI chat component
- `components/personalized-checklist.tsx` - Dynamic checklists
- `app/api/chat/route.ts` - AI API endpoint

#### 👥 Community (3 files)
- `app/stories/page.tsx` - Community stories platform
- `app/my-stories/page.tsx` - Personal content management
- User-generated content features

#### 🛡️ Safety (3 files)
- `app/safety-map/page.tsx` - Interactive safety map
- `app/report-safety/page.tsx` - Safety incident reporting
- `components/leaflet-map.tsx` - Map visualization

#### 📍 Places (3 files)
- `app/places/page.tsx` - Community places platform
- `lib/mapbox-places.ts` - Mapbox API integration
- `components/enhanced-places-search.tsx` - Search functionality

#### 🎨 UI Components (20+ files)
- `components/ui/*` - Shadcn/ui components
- `components/navigation.tsx` - Main navigation
- `app/layout.tsx` - Root layout and providers
- Custom UI components

#### 🔧 Utilities (5 files)
- `lib/utils.ts` - Helper functions
- `hooks/use-mobile.tsx` - Mobile detection
- `hooks/use-toast.ts` - Toast notifications
- Custom hooks and utilities

---

## 🔄 Development Workflow

### 1. Feature Development Process
\`\`\`bash
# Create feature branch
git checkout -b feature/new-functionality

# Develop component in appropriate directory
# Update TypeScript types if needed
# Add to navigation if required
# Test functionality

# Commit and push
git add .
git commit -m "feat: add new functionality"
git push origin feature/new-functionality
\`\`\`

### 2. Database Changes
\`\`\`bash
# Create new migration script
touch scripts/new-migration-v{version}.sql

# Write SQL changes
# Update types/database.ts
# Test with sample data

# Apply to Supabase:
# Copy SQL to Supabase SQL editor
# Run migration
# Verify changes
\`\`\`

### 3. Component Development Pattern
\`\`\`typescript
// 1. Create component file
// components/new-component.tsx

// 2. Define props interface
interface NewComponentProps {
  data: SomeType
  onAction: (id: string) => void
}

// 3. Implement component
export const NewComponent: React.FC<NewComponentProps> = ({
  data,
  onAction
}) => {
  // State management
  // Event handlers
  // Effects
  // Render logic
}

// 4. Export and use
export default NewComponent
\`\`\`

### 4. API Route Pattern
\`\`\`typescript
// app/api/new-endpoint/route.ts

export async function GET(request: Request) {
  try {
    // Authentication check
    // Data validation
    // Database operations
    // Return response
  } catch (error) {
    // Error handling
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
\`\`\`

### 5. Testing Strategy
\`\`\`bash
# Type checking
npm run type-check

# Build verification
npm run build

# Manual testing checklist:
# - Authentication flow
# - Database operations
# - API endpoints
# - UI responsiveness
# - Error handling
\`\`\`

---

## 🚀 Deployment

### Vercel Deployment

1. **Connect Repository:**
   - Link GitHub repository to Vercel
   - Configure build settings (Next.js preset)

2. **Environment Variables:**
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
   \`\`\`

3. **Build Configuration:**
   \`\`\`json
   // vercel.json (optional)
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "framework": "nextjs"
   }
   \`\`\`

### Database Setup (Production)

1. **Supabase Project:**
   - Create production Supabase project
   - Run all SQL scripts in order
   - Configure Row Level Security (RLS)
   - Set up storage buckets for images

2. **RLS Policies:**
   \`\`\`sql
   -- Example RLS policy for stories
   CREATE POLICY "Users can view all stories" ON stories
     FOR SELECT USING (true);

   CREATE POLICY "Users can insert their own stories" ON stories
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update their own stories" ON stories
     FOR UPDATE USING (auth.uid() = user_id);
   \`\`\`

### Performance Optimization

1. **Image Optimization:**
   - Use Next.js Image component
   - Implement lazy loading
   - Optimize Supabase storage

2. **Database Optimization:**
   - Add indexes for frequently queried columns
   - Use database functions for complex operations
   - Implement pagination for large datasets

3. **Caching Strategy:**
   - Static generation for country data
   - Client-side caching for user data
   - API route caching where appropriate

---

## 🎯 Key Learning Outcomes

### Technical Skills Developed
- **Full-stack Development**: Built complete application from database to UI
- **AI Integration**: Implemented streaming AI chat with contextual responses
- **Real-time Features**: Used Supabase real-time subscriptions
- **API Design**: Created RESTful endpoints and integrated external APIs
- **Database Design**: Designed normalized schema with proper relationships
- **Authentication**: Implemented secure user authentication and authorization

### Problem-Solving Approaches
- **User-Centric Design**: Focused on solving real travel planning problems
- **Scalable Architecture**: Built modular, maintainable code structure
- **Error Handling**: Implemented comprehensive error handling and user feedback
- **Performance**: Optimized for fast loading and smooth user experience

### Project Management
- **Feature Planning**: Broke down complex features into manageable components
- **Version Control**: Used Git for code management and feature development
- **Documentation**: Created comprehensive documentation for future maintenance

---

## 📝 Future Enhancements

### Planned Features
- **Offline Support**: PWA capabilities for offline access
- **Push Notifications**: Real-time safety alerts
- **Social Features**: Friend connections and trip sharing
- **Advanced AI**: More sophisticated travel recommendations
- **Mobile App**: React Native version for mobile platforms

### Technical Improvements
- **Testing**: Implement unit and integration tests
- **Monitoring**: Add error tracking and analytics
- **Performance**: Further optimize loading times
- **Accessibility**: Improve accessibility compliance
- **Internationalization**: Multi-language support

---

---

##  Acknowledgments

- **Supabase** - For providing an excellent backend platform
- **Vercel** - For seamless deployment and hosting
- **Google** - For the Gemini AI API
- **Mapbox** - For mapping and geocoding services
- **Shadcn/ui** - For beautiful, accessible UI components
- **Next.js Team** - For the amazing React framework

---


$$

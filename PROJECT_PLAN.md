# Double JS Doodles - Dog Breeder Website

## Development Plan

### Technology Stack
- **Frontend**: React + TypeScript + shadcn/ui + Tailwind CSS
- **Backend**: FastAPI + Python
- **Database**: MongoDB
- **Media Storage**: Cloudflare R2
- **Authentication**: Admin-only login system

### Project Structure
```
doublejsdoodles/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # shadcn/ui components only
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and configurations
│   │   ├── hooks/          # Custom React hooks
│   │   └── types/          # TypeScript type definitions
│   ├── package.json
│   └── tsconfig.json
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── models/         # MongoDB models
│   │   ├── services/       # Business logic
│   │   ├── config/         # Configuration
│   │   └── main.py         # FastAPI app entry point
│   ├── requirements.txt
│   └── .env
└── CLAUDE.md               # Project rules and conventions
```

### Key Features

#### Core Functionality
1. **Admin Dashboard** - Manage litters, puppies, and homepage content
2. **Public Website** - Display available litters and puppy information
3. **Media Management** - Images/videos stored in Cloudflare R2
4. **Contact System** - Forms for puppy inquiries
5. **Responsive Design** - Modern UI with subtle animations

#### Pages & Components
- **Navbar** - Navigation with admin login
- **Homepage** - Dynamic content managed by admin
- **Litters Page** - Current available litters
- **Puppy Pages** - Individual puppy details with availability status
- **Contact Forms** - Inquiry system for interested buyers
- **Admin Panel** - Content management interface
- **Footer** - Site information and links

### Data Models

#### Puppy Model
- ID, Name, DOB, Breed, Generation
- Availability status (Available/Reserved/Sold)
- Parent information (Mom/Dad)
- Images/videos from R2
- Contact inquiries

#### Litter Model
- ID, Name, Birth date
- Parent dogs (Mom/Dad with full info)
- Puppies array
- Status (Current/Past)

#### Parent Dog Model
- ID, Name, Breed, Generation
- Health clearances
- Images from R2

### Configuration Standards
- All config variables use descriptive prefixes:
  - `CLOUDFLARE_R2_BUCKET_NAME`
  - `CLOUDFLARE_R2_ACCESS_KEY`
  - `MONGODB_CONNECTION_STRING`
  - `FASTAPI_SECRET_KEY`
- Environment-specific settings in dedicated files
- All shadcn/ui components only - no custom UI components

### Development Phases

#### Phase 1: Foundation (High Priority)
1. Project structure setup
2. React + shadcn/ui frontend framework
3. FastAPI + MongoDB backend framework
4. Cloudflare R2 integration
5. Basic authentication

#### Phase 2: Core Features (Medium Priority)
1. Admin dashboard
2. Litter management (CRUD)
3. Puppy management
4. Public website pages
5. Contact forms

#### Phase 3: Enhancement (Low Priority)
1. Advanced media gallery
2. Subtle animations
3. SEO optimization
4. Performance optimization

### Quality Standards
- No syntax errors allowed
- All code must pass linting
- TypeScript strict mode
- Responsive design
- Accessibility compliance
- Modern, clean UI with subtle animations

### Notes
- Only admin login required
- All UI components from shadcn/ui library
- Modern design with subtle animations
- Mobile-first responsive approach
- Image/video optimization for web delivery

## Quick Start

To run the full application:

```bash
# From project root
./start.sh
```

This will start:
- Backend API on http://localhost:8082
- Frontend on http://localhost:3001
- API Documentation on http://localhost:8082/docs

## Admin Credentials
- Username: `admin`
- Password: `secret`

## Completed Features ✅
- [x] Project structure and build system
- [x] React + TypeScript + shadcn/ui frontend
- [x] FastAPI + Python backend with MongoDB
- [x] Secure admin authentication with encrypted passwords
- [x] Responsive navbar and footer
- [x] Modern homepage design
- [x] Cloudflare R2 integration setup
- [x] Environment configuration with prefixes
- [x] Complete litter management system (CRUD)
- [x] Puppy management within litters
- [x] API client with TypeScript types
- [x] Admin authentication with salt-hashed passwords
- [x] No plain-text secrets in API communication

## Security Features 🔒
- Client-side password hashing with salt
- AES encryption for authentication data
- Timestamp validation (5-minute window)
- JWT tokens for session management
- No plain-text passwords in API calls
- Admin-only endpoints properly protected
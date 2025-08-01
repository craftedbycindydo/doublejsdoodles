# Claude Project Rules - Double JS Doodles

## Project Overview
Dog breeder website for Double JS Doodles with React frontend and FastAPI backend.

## Technology Stack
- **Frontend**: React + TypeScript + shadcn/ui + Tailwind CSS
- **Backend**: FastAPI + Python
- **Database**: MongoDB
- **Media Storage**: Cloudflare R2
- **Authentication**: Admin-only login system

## Coding Rules

### Frontend Rules
1. **Components**: Use ONLY shadcn/ui components - NO custom UI components allowed
2. **Styling**: Use Tailwind CSS classes only
3. **TypeScript**: Use strict mode, all components must be typed
4. **File Structure**: 
   - Components in `src/components/`
   - Pages in `src/pages/`
   - Utilities in `src/lib/`
   - Types in `src/types/`

### Backend Rules
1. **Structure**: Follow FastAPI best practices
2. **Models**: Use Pydantic models for all data validation
3. **Database**: MongoDB with Motor (async driver)
4. **API**: RESTful design with proper HTTP status codes

### Configuration Standards
1. **Environment Variables**: All config variables must use descriptive prefixes:
   - `CLOUDFLARE_R2_BUCKET_NAME`
   - `CLOUDFLARE_R2_ACCESS_KEY_ID`
   - `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
   - `CLOUDFLARE_R2_ENDPOINT_URL`
   - `MONGODB_CONNECTION_STRING`
   - `MONGODB_DATABASE_NAME`
   - `FASTAPI_SECRET_KEY`
   - `FASTAPI_ALGORITHM`

2. **File Naming**: Use kebab-case for files, PascalCase for components

### Quality Standards
- No syntax errors allowed
- All code must pass linting
- TypeScript strict mode enabled
- Responsive design required
- Accessibility compliance (WCAG 2.1 AA)
- Modern, clean UI with subtle animations

### Testing & Building
- Frontend: `npm run build` and `npm run lint` must pass
- Backend: Code must be valid Python with proper type hints
- All endpoints must be tested manually before deployment

### Media Management
- All images/videos stored in Cloudflare R2 bucket named "doublejsdoodles"
- Optimize images for web delivery
- Use proper alt tags for accessibility

### Authentication
- Admin-only login system
- No public user registration
- JWT tokens for session management

## Commands to Run
- **Frontend Build**: `npm run build`
- **Frontend Lint**: `npm run lint` (if available)
- **Frontend Dev**: `npm start`
- **Backend Dev**: `cd backend && source venv/bin/activate && uvicorn app.main:app --reload`

## Project Structure
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
└── PROJECT_PLAN.md         # Development roadmap
```
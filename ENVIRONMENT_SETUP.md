# Environment Setup for Frontend

To connect the frontend to the FastAPI backend, create a `.env.local` file in the `client/` directory with the following content:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Development Setup

1. Make sure your FastAPI backend is running on `http://localhost:8000`
2. Create the `.env.local` file with the configuration above
3. Start the frontend development server: `npm run dev`

## Environment Variables

- `NEXT_PUBLIC_API_URL`: The base URL for your FastAPI backend (default: http://localhost:8000)

## Legacy Configuration

The previous Supabase configuration can be safely removed once the migration is complete:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Backend Connection

The frontend will automatically connect to the backend API using the configured URL. The authentication flow includes:
- User registration with company creation
- User login with JWT token management
- Automatic token refresh
- Protected routes and authentication state management 
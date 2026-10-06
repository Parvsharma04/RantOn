# RantOn

RantOn is a discussion-platform prototype with a Next.js web client and a separate Express API. The API supports Firebase-backed user registration, rants, comments, and likes. The current web pages are not yet fully connected to those API features: the home feed and dashboard use in-memory sample data.

## Prerequisites

- Node.js 18.17 or newer and npm
- PostgreSQL, with a database available to the backend
- A Firebase project with the sign-in providers you plan to use enabled
- Firebase web-app configuration and a Firebase Admin service account for backend token verification

There is no root-level package manifest. Install and run each application from its own directory.

## Quick start

1. **Configure the backend.** Create `backend/.env`:

   ```dotenv
   DATABASE_URL="postgresql://postgres:password@localhost:5432/ranton?schema=public"
   JWT_SECRET="replace-with-a-long-random-secret"
   FIREBASE_PROJECT_ID="your-firebase-project-id"
   FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-firebase-project-id.iam.gserviceaccount.com"
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nreplace-with-your-service-account-key\n-----END PRIVATE KEY-----\n"
   ```

   Use the actual values from your PostgreSQL instance and Firebase service account. Keep credentials out of source control.

2. **Install backend dependencies and initialize the database:**

   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate deploy
   NODE_OPTIONS='-r dotenv/config' npm run dev
   ```

   Preloading `dotenv/config` makes `backend/.env` available before the Firebase Admin module initializes; `src/app.ts` otherwise loads dotenv after importing its routes. The API listens on `http://localhost:8000`; its root health response is `server is running`.

3. **Configure the frontend.** In a second terminal, create `frontend/.env.local`:

   ```dotenv
   NEXT_PUBLIC_APIKEY="your-firebase-web-api-key"
   NEXT_PUBLIC_AUTHDOMAIN="your-project.firebaseapp.com"
   NEXT_PUBLIC_PROJECTID="your-firebase-project-id"
   NEXT_PUBLIC_STORAGEBUCKET="your-project.appspot.com"
   NEXT_PUBLIC_MESSAGESENDERID="your-sender-id"
   NEXT_PUBLIC_APPID="your-firebase-web-app-id"
   NEXT_PUBLIC_MEASUREMENTID="your-measurement-id"
   NEXT_PUBLIC_LOCAL_BACKEND_URL="http://localhost:8000/api"
   ```

   The `NEXT_PUBLIC_` values are delivered to the browser; do not put private service-account credentials here.

4. **Install and run the frontend:**

   ```bash
   cd frontend
   npm ci
   npm run dev
   ```

   Open <http://localhost:3000>. Run `npm ci` again whenever you need to restore the frontend dependencies from its lockfile.

## Project map

```text
backend/
  src/app.ts                 Express entry point and API mount points
  src/routes/                HTTP route declarations
  src/controllers/           Firebase auth and Prisma request handlers
  src/middlewares/            JWT authentication
  prisma/schema.prisma        PostgreSQL data model
  prisma/migrations/         Database migrations
frontend/
  app/                       Next.js App Router pages and global layout
  context/AuthContext.tsx     Firebase user state for the client
  firebase.ts                Firebase client initialization and sign-in providers
  components/                Navigation and reusable UI components
docs/                        Project, architecture, API, and contribution docs
```

## Current implementation boundary

The frontend provides home, sign-in, and dashboard pages. Sign-in supports Google, GitHub, anonymous, and email/password Firebase authentication. The home feed and dashboard currently use local sample data; posting and commenting there do not persist through the API. The backend API is independently usable and documented in [API.md](./API.md). The frontend sign-in flow sends its Firebase ID token to the backend for account synchronization.

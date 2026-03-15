# Firebase Authentication Setup Guide

This guide walks you through setting up Firebase Authentication for GrooveOps with role-based access control.

## 1. Create Firebase Project

### Step 1.1: Go to Firebase Console
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** (or select existing project)
3. Enter project name: `grooveops` (or your preference)
4. Follow the setup wizard
5. Once created, you'll see your project dashboard

## 2. Set Up Authentication

### Step 2.1: Enable Email/Password Authentication
1. Go to **Authentication** section (left sidebar)
2. Click **Get started**
3. In the **Sign-in method** tab, find **Email/Password**
4. Click to expand and toggle **Enable**
5. Keep "Email link (passwordless sign-in)" disabled
6. Click **Save**

### Step 2.2: Enable Google Sign-In
1. In **Sign-in method** tab, find **Google**
2. Click to expand and toggle **Enable**
3. Select a **Project support email**
4. Click **Save**

(Google OAuth will be auto-configured for localhost development)

## 3. Get Firebase Configuration

### Step 3.1: Access Firebase Config
1. Go to **Project Settings** (gear icon, top right)
2. Under **Your apps**, click **Web** icon (or Add app → Web)
3. Copy the config object that looks like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

### Step 3.2: Add to Frontend .env

Create/update `e:\software-dev\projects\dj-manager\.env.local`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

## 4. Set Up Firebase Admin SDK (Backend)

The backend needs a service account key to verify Firebase tokens.

### Step 4.1: Generate Service Account Key
1. Go to **Project Settings** (gear icon)
2. Scroll to **Service Accounts** tab
3. Click **Generate New Private Key**
4. Save the JSON file as `serviceAccountKey.json`
5. **IMPORTANT**: Keep this file secure and never commit it to Git!

### Step 4.2: Place in Backend

Move the downloaded file:
```
serviceAccountKey.json → server/serviceAccountKey.json
```

**Security**: The `.gitignore` is already configured to exclude this file.

### Step 4.3: Backend .env (Optional)

Alternatively, you can set an environment variable instead of using the file:

Create/update `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/grooveops
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'  # Or just use the file
```

**Note**: Using the file (`serviceAccountKey.json`) is simpler for local development.

## 5. Update MongoDB with User Collection

Your MongoDB now includes a `users` collection created by the User model at:
`server/src/models/User.ts`

### Collection Structure:
```javascript
{
  _id: ObjectId,
  firebaseUid: "firebase-uid-string",
  email: "user@example.com",
  displayName: "John Doe",
  photoURL: "https://...",
  role: "Artist" | "Organiser" | "Admin",  // Role-based access
  
  // For Artist role
  djProfile: {
    alias: "DJ Shadow",
    bio: "...",
    genres: [...],
    vibes: [...],
    experience: "regular",
    fee: 1000,
    bankName: "",
    accountHolder: "",
    accountNumber: ""
  },
  
  // For Organiser role
  organiserProfile: {
    companyName: "Event Co",
    phone: "+27...",
    verified: false
  },
  
  createdAt: ISODate,
  updatedAt: ISODate
}
```

Default role for new signups: **Artist**

## 6. How Authentication Works

### Frontend Flow:
1. User visits app → Redirected to `/login` if not authenticated
2. User signs in with email/password or Google
3. Firebase generates ID token (JWT)
4. Frontend calls `/api/auth/sync-user` with token
5. Backend verifies token and creates/updates user in MongoDB
6. User redirected to Dashboard with their role

### API Requests:
All authenticated requests include the Firebase ID token:
```javascript
headers: {
  Authorization: `Bearer ${firebaseIdToken}`
}
```

Backend middleware verifies the token before processing requests.

## 7. Role-Based Access

### User Roles:
- **Admin**: Full access to all features
- **Organiser**: Can create/edit events, manage lineup
- **Artist**: Can view/edit own profile, view events

### Default Role Assignment:
- New signups default to **Artist** role
- To assign other roles, manually update MongoDB:

```javascript
db.users.updateOne(
  { email: "organiser@example.com" },
  { $set: { role: "Organiser" } }
)
```

### Protected Routes:
Routes in `src/App.tsx` use the `<ProtectedRoute>` component:
```javascript
<ProtectedRoute requiredRoles={["Admin"]}>
  <AdminPanel />
</ProtectedRoute>
```

## 8. Testing Authentication Locally

### Start Frontend:
```bash
cd e:\software-dev\projects\dj-manager
npm run dev
```

### Start Backend:
```bash
cd e:\software-dev\projects\dj-manager\server
npm run dev
```

### Test Flow:
1. Navigate to `http://localhost:5173/login`
2. Sign up with email and password
3. Should redirect to Dashboard
4. Click user icon (top right) to see role and sign out

### Test Google Sign-In:
- Google OAuth automatically works with `localhost` for Firebase projects
- Click "GOOGLE" button on login screen

## 9. Troubleshooting

### Error: "Firebase Admin SDK initialization error"
- **Cause**: `serviceAccountKey.json` not found
- **Solution**: Download and place in `server/` root

### Error: "Invalid or expired token"
- **Cause**: Firebase token verification failed
- **Solution**: Ensure `.env` values match Firebase config

### Error: "User not found in database"
- **Cause**: `/api/auth/sync-user` endpoint not called
- **Solution**: Check frontend `.env` has correct `VITE_API_URL`

### Can't Sign In
- **Cause**: Email/password not enabled in Firebase
- **Solution**: Go to Firebase Console → Authentication → Enable Email/Password

## 10. Production Deployment

### Environment Variables:
1. **Frontend** (Vercel/Netlify):
   - Set `VITE_FIREBASE_*` variables in deployment settings
   - Update `VITE_API_URL` to production backend URL

2. **Backend** (Render/Heroku):
   - Set `FIREBASE_SERVICE_ACCOUNT_KEY` as environment variable
   - Or upload `serviceAccountKey.json` to server root

### Firebase Security Rules:
By default, Firebase auth is open. Consider setting up:
- Email domain restrictions
- Custom claims for admin users via Firebase Admin SDK

## 11. Next Steps

- [ ] Set up roles for your team (Admin, Organiser, etc.)
- [ ] Customize login page branding
- [ ] Add password reset flow
- [ ] Set up role-based API endpoints
- [ ] Add user profile management page
- [ ] Implement email verification

## Reference

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)

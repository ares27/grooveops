# Firebase Authentication - Quick Start

Complete authentication setup has been implemented. Follow these steps to get started:

## ⚡ Quick Setup (5 minutes)

### 1. Create Firebase Project
- Go to https://console.firebase.google.com
- Click "Add project"
- Name: `grooveops`
- Wait for project creation

### 2. Enable Authentication Methods
- Go to **Authentication** → **Get started**
- Enable **Email/Password**
- Enable **Google** (auto-configured for localhost)

### 3. Get Firebase Config
- Go to **Project Settings** (gear icon)
- Click **Your apps** → **Web**
- Copy the config object with:
  - apiKey
  - authDomain
  - projectId
  - storageBucket
  - messagingSenderId
  - appId

### 4. Create `.env.local` in project root
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. Generate Service Account Key
- Go to **Project Settings** → **Service Accounts**
- Click **Generate New Private Key**
- Save as `server/serviceAccountKey.json`
- ⚠️ Keep it SECRET - never commit to git!

### 6. Test It
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd server && npm run dev
```

Go to http://localhost:5173/login and sign up!

---

## 📁 Files Created

### Frontend
- `src/config/firebase.ts` - Firebase config
- `src/contexts/AuthContext.tsx` - Auth state management
- `src/pages/Login.tsx` - Login/signup page
- `src/pages/NotFound.tsx` - 404 page
- `src/pages/Unauthorized.tsx` - Access denied page
- `src/components/ProtectedRoute.tsx` - Route guard

### Backend
- `server/src/config/firebase.ts` - Firebase Admin setup
- `server/src/middleware/auth.ts` - Token verification
- `server/src/models/User.ts` - User schema (role-based)
- `server/src/routes/Auth.ts` - Auth endpoints

---

## 🔐 How It Works

### Sign In Flow:
1. User → `/login` page
2. Enters email/password or clicks Google
3. Firebase authenticates
4. ID token sent to backend
5. Backend creates/updates user in MongoDB
6. Redirected to Dashboard

### Roles:
- **Admin** - Full access
- **Organiser** - Create events
- **Artist** - Edit profile, view events (default)

### Change User Role:
```javascript
// MongoDB shell
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "Organiser" } }
)
```

---

## 📚 Full Documentation

For detailed setup and troubleshooting, see: **FIREBASE_SETUP.md**

---

## ✅ Checklist

- [ ] Firebase project created
- [ ] Authentication methods enabled
- [ ] Config added to `.env.local`
- [ ] Service account key in `server/serviceAccountKey.json`
- [ ] Frontend running (`npm run dev`)
- [ ] Backend running (`npm run dev`)
- [ ] Can sign up at `/login`
- [ ] Redirected to Dashboard after login
- [ ] User menu shows role in top right

---

## 🆘 Troubleshooting

**"Firebase Admin SDK initialization error"**
→ Place `serviceAccountKey.json` in `server/` root

**"Can't sign in"**
→ Check email/password enabled in Firebase Console

**"Token verification failed"**
→ Verify `.env.local` Firebase config matches Console

**Blank page at /login**
→ Check browser console for errors, ensure `npm run dev` running

---

Need help? See **FIREBASE_SETUP.md** for complete guide!

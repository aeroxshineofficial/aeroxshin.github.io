# Admin Setup

## First-Time Setup

Run this script ONCE to create your admin user with the required custom claim.

### Prerequisites

1. Install Node.js (if not already installed)
2. Install Firebase Admin SDK:
   ```bash
   npm install firebase-admin
   ```
3. Install Firebase CLI (for deploying rules):
   ```bash
   npm install -g firebase-tools
   firebase login
   ```
4. Download service account key:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the downloaded file as `scripts/service-account-key.json`

### Step 1: Deploy Firestore Rules

The Firestore security rules must be deployed before products can be saved.

```bash
firebase deploy --only firestore:rules
```

Or use the automated script:
```bash
node scripts/deploy-rules.js
```

### Step 2: Create Admin User

```bash
node scripts/setup-admin.js create admin@aeroxshine.com YourStrongPassword123
```

### Step 3: Set Claim on Existing User

If you already created a user in Firebase Console:

```bash
node scripts/setup-admin.js set-claim admin@aeroxshine.com
```

### How It Works

The script uses the Firebase Admin SDK to set a `custom claim` (`admin: true`) on the user. This claim is embedded in the user's authentication token and is checked by:

1. **Firestore Security Rules** - Only admin users can write products and read/write/update/delete orders
2. **Admin Panel (client-side)** - Verifies the claim before showing the dashboard

### After Running

- The admin user can now log in at `admin.html`
- The claim takes effect after the user signs out and signs back in
- You can delete `service-account-key.json` after setup (it contains sensitive credentials)

### Troubleshooting

#### "Missing or insufficient permissions" error when saving products

1. **Firestore rules not deployed** - Run: `firebase deploy --only firestore:rules`
2. **Admin claim not set** - Run: `node scripts/setup-admin.js set-claim YOUR_EMAIL`
3. **Token stale** - Sign out and sign back in, or click "Refresh" in the admin panel topbar
4. **Wrong Firebase project** - Verify `firebase-config.js` matches your Firebase project

#### Check your auth status

Open browser console in the admin panel and run:
```javascript
firebase.auth().currentUser.getIdTokenResult(true).then(r => console.log(r.claims));
```

If `admin: true` is not in the claims, the setup script needs to be run.

### Important

- **Never commit `service-account-key.json` to Git** (it's in .gitignore)
- **Never run this script on a public server** - run it locally only
- The script is idempotent - running it again on the same email will just re-set the claim

// ============================================================
// FIREBASE CONFIGURATION - AeroXshine
// ============================================================
// SETUP: Follow the steps in scripts/README.md or the main
// README section "Firebase Setup" to fill in these values.
// ============================================================

var firebaseConfig = {
  apiKey: "AIzaSyAxDGQAUbxWtaFtd0zeLkXoMTMvbfT3UOc",
  authDomain: "aeroxshine-admin.firebaseapp.com",
  projectId: "aeroxshine-admin",
  messagingSenderId: "470743004330",
  appId: "1:470743004330:web:bd382c7716c1c625c3ccd3"
};

// ============================================================
// DO NOT MODIFY BELOW THIS LINE
// ============================================================

var firebaseApp = null;
var db = null;
var auth = null;
var FirebaseServicesReady = false;

(function initFirebase() {
  if (typeof firebase === "undefined") {
    // Firebase SDK not loaded - site works with local data only
    return;
  }

  if (firebaseConfig.apiKey === "YOUR_API_KEY" || !firebaseConfig.apiKey) {
    // API key not yet filled in - site works with local data only
    console.warn("Firebase API key not set. Using local data fallback. See firebase-config.js");
    return;
  }

  try {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    FirebaseServicesReady = true;
  } catch (error) {
    console.error("Firebase init failed:", error.message);
    FirebaseServicesReady = false;
  }
})();

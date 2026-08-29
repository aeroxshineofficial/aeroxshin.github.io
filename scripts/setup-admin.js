#!/usr/bin/env node
/* ============================================================
   ADMIN SETUP SCRIPT - AeroXshine
   ============================================================
   This script creates an admin user and sets the admin custom
   claim. Run this ONCE from your local machine, then delete
   or secure this file.

   PREREQUISITES:
   1. npm install firebase-admin
   2. Download service account key from Firebase Console:
      Project Settings > Service Accounts > Generate New Private Key
   3. Save it as ./service-account-key.json (next to this script)

   USAGE:
   node scripts/setup-admin.js create admin@aeroxshine.com YourStrongPassword123
   node scripts/setup-admin.js set-claim UID_FROM_STEP_ABOVE
   ============================================================ */

var path = require("path");
var execSync = require("child_process").execSync;
var fs = require("fs");

// ── Step 0: Deploy Firestore rules first ──────────────────────
var firebaseJsonPath = path.join(__dirname, "..", "firebase.json");
var firestoreRulesPath = path.join(__dirname, "..", "firestore.rules");

if (fs.existsSync(firebaseJsonPath) && fs.existsSync(firestoreRulesPath)) {
  console.log("Step 0: Deploying Firestore rules...");
  try {
    execSync("firebase --version", { stdio: "ignore" });
    try {
      execSync("firebase deploy --only firestore:rules", {
        cwd: path.join(__dirname, ".."),
        stdio: "pipe"
      });
      console.log("  ✓ Firestore rules deployed successfully.\n");
    } catch (e) {
      console.log("  ⚠ Could not deploy Firestore rules automatically.");
      console.log("  Run this manually: firebase deploy --only firestore:rules\n");
    }
  } catch (e) {
    console.log("  ⚠ Firebase CLI not found. Deploy rules manually after setup:");
    console.log("    npm install -g firebase-tools && firebase login");
    console.log("    firebase deploy --only firestore:rules\n");
  }
} else {
  console.log("Step 0: Skipping rules deployment (firebase.json or firestore.rules not found).\n");
}

// ── Step 1: Load service-account-key.json ──────────────────────
var serviceAccount;
try {
  serviceAccount = require(path.join(__dirname, "service-account-key.json"));
} catch (e) {
  console.error("\nERROR: Could not load service-account-key.json");
  console.error("Reason:", e.code === "MODULE_NOT_FOUND" ? "File not found" : e.message);
  console.error("Download it from Firebase Console > Project Settings > Service Accounts");
  console.error("Save it as: scripts/service-account-key.json\n");
  process.exit(1);
}

// ── Step 2: Validate required fields ──────────────────────────
var requiredFields = ["project_id", "client_email", "private_key"];
var missing = requiredFields.filter(function (f) { return !serviceAccount[f]; });
if (missing.length > 0) {
  console.error("\nERROR: service-account-key.json is missing required fields:", missing.join(", "));
  console.error("Re-download the key from Firebase Console > Project Settings > Service Accounts\n");
  process.exit(1);
}

// ── Step 3: Initialize Firebase Admin SDK ──────────────────────
var admin, authModule, firestoreModule;
try {
  admin = require("firebase-admin");
  authModule = require("firebase-admin/auth");
  firestoreModule = require("firebase-admin/firestore");

  admin.initializeApp({
    credential: admin.cert(serviceAccount)
  });
} catch (e) {
  console.error("\nERROR: Firebase Admin SDK initialization failed");
  console.error("Error code:", e.code || "N/A");
  console.error("Message:", e.message);
  if (e.message && e.message.includes("invalid_grant")) {
    console.error("\nThe service account key may be revoked or expired.");
    console.error("Re-download a new key from Firebase Console > Project Settings > Service Accounts\n");
  }
  process.exit(1);
}

var auth = authModule.getAuth();
var db = firestoreModule.getFirestore();

// ── CLI arguments ─────────────────────────────────────────────
var action = process.argv[2];
var email = process.argv[3];
var password = process.argv[4];

if (action === "create" && email && password) {
  // Step 1: Create user and set admin claim
  console.log("Creating admin user:", email);
  auth.createUser({
    email: email,
    password: password,
    emailVerified: true
  })
  .then(function(userRecord) {
    console.log("User created with UID:", userRecord.uid);
    return auth.setCustomUserClaims(userRecord.uid, { admin: true });
  })
  .then(function() {
    console.log("Admin claim set successfully.");
    console.log("\nNEXT STEP: Run this command to verify:");
    console.log("  node scripts/setup-admin.js set-claim <UID_ABOVE>");
    return db.collection("_setup").doc("admin").set({
      email: email,
      createdAt: firestoreModule.FieldValue.serverTimestamp(),
      note: "Admin claim has been set. This document is for reference only."
    });
  })
  .then(function() {
    console.log("Setup record saved to Firestore.");
    console.log("\nDONE. You can now log in at admin.html with these credentials.");
    process.exit(0);
  })
  .catch(function(err) {
    if (err.code === "auth/email-already-exists") {
      console.log("User already exists. Setting admin claim on existing user...");
      auth.getUserByEmail(email)
        .then(function(userRecord) {
          return auth.setCustomUserClaims(userRecord.uid, { admin: true })
            .then(function() {
              console.log("Admin claim set on existing user. UID:", userRecord.uid);
              process.exit(0);
            });
        })
        .catch(function(e) {
          console.error("Failed:", e.message);
          process.exit(1);
        });
    } else {
      console.error("Failed to create user:", err.message);
      process.exit(1);
    }
  });

} else if (action === "set-claim" && email) {
  // Step 2: Set claim on existing user by UID or email
  var lookup = email.indexOf("@") !== -1
    ? auth.getUserByEmail(email)
    : auth.getUser(email);

  lookup.then(function(userRecord) {
    console.log("Found user:", userRecord.email, "(UID:", userRecord.uid + ")");
    return auth.setCustomUserClaims(userRecord.uid, { admin: true });
  })
  .then(function() {
    console.log("Admin claim set successfully.");
    console.log("The user must sign out and sign back in for the claim to take effect.");
    process.exit(0);
  })
  .catch(function(err) {
    console.error("Failed:", err.message);
    process.exit(1);
  });

} else {
  console.log("\nAeroXshine Admin Setup Script");
  console.log("=============================\n");
  console.log("Usage:");
  console.log("  Create new admin:  node scripts/setup-admin.js create <email> <password>");
  console.log("  Set claim on user: node scripts/setup-admin.js set-claim <uid-or-email>\n");
  console.log("Example:");
  console.log("  node scripts/setup-admin.js create admin@aeroxshine.com MyPassword123");
  console.log("  node scripts/setup-admin.js set-claim admin@aeroxshine.com\n");
  process.exit(0);
}

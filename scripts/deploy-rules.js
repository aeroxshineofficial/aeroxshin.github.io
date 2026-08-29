#!/usr/bin/env node
/* ============================================================
   DEPLOY FIRESTORE RULES - AeroXshine
   ============================================================
   Deploys firestore.rules to the Firebase project.

   PREREQUISITES:
   1. npm install -g firebase-tools
   2. firebase login (authenticate with your Firebase account)
   3. firebase.json must exist in project root (already created)

   USAGE:
   node scripts/deploy-rules.js
   ============================================================ */

var execSync = require("child_process").execSync;
var path = require("path");
var fs = require("fs");

var projectRoot = path.join(__dirname, "..");

// Check firebase.json exists
if (!fs.existsSync(path.join(projectRoot, "firebase.json"))) {
  console.error("\nERROR: firebase.json not found in project root.");
  console.error("Create firebase.json with the firestore rules configuration.\n");
  process.exit(1);
}

// Check firestore.rules exists
if (!fs.existsSync(path.join(projectRoot, "firestore.rules"))) {
  console.error("\nERROR: firestore.rules not found in project root.\n");
  process.exit(1);
}

console.log("Deploying Firestore rules to Firebase project...\n");

try {
  // Check if firebase-tools is installed
  execSync("firebase --version", { stdio: "ignore" });
} catch (e) {
  console.error("ERROR: Firebase CLI not found.");
  console.error("Install it with: npm install -g firebase-tools");
  console.error("Then login: firebase login\n");
  process.exit(1);
}

try {
  // Deploy only Firestore rules
  execSync("firebase deploy --only firestore:rules", {
    cwd: projectRoot,
    stdio: "inherit"
  });
  console.log("\nFirestore rules deployed successfully!");
  console.log("Products can now be created/updated/deleted by admin users.\n");
} catch (e) {
  console.error("\nDeployment failed. Possible causes:");
  console.error("1. Not logged in to Firebase (run: firebase login)");
  console.error("2. No permission to deploy to this project");
  console.error("3. Network error\n");
  process.exit(1);
}

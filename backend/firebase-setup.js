const admin = require('firebase-admin');

// Load Firebase service account credentials
const serviceAccount = require('./pinsight-10ac7-firebase-adminsdk-jt8ed-f6e2a3a011.json'); // Ensure this file is in the same directory

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Firestore instance
const db = admin.firestore();

module.exports = { db };

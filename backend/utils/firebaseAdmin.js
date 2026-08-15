const admin = require('firebase-admin');

// ======================================================
// FIREBASE ADMIN INITIALIZATION
// ======================================================
// This lets the backend verify Firebase ID tokens that the
// frontend gets after a real Google Sign-In / email-password
// login. Without this, the backend has no way to know a login
// request actually came from Firebase — it would have to trust
// whatever the client claims, which is exactly the hole we're
// closing here.
//
// Required env vars (from your Firebase project's service account):
//   FIREBASE_PROJECT_ID
//   FIREBASE_CLIENT_EMAIL
//   FIREBASE_PRIVATE_KEY   (keep the \n escapes if pasting into .env)
//
// Get these from: Firebase Console -> Project Settings ->
// Service Accounts -> Generate new private key.
// ======================================================

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      '[firebaseAdmin] Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY env vars. ' +
      'Server-side token verification will fail until these are set.'
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

/**
 * Verifies a Firebase ID token sent from the client.
 * Throws if the token is missing, expired, or invalid.
 * Returns the decoded token, which includes a *verified* email.
 */
const verifyFirebaseToken = async (idToken) => {
  if (!idToken || typeof idToken !== 'string') {
    const err = new Error('No authentication token provided');
    err.statusCode = 401;
    throw err;
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    return decoded;
  } catch (error) {
    const err = new Error('Invalid or expired authentication token');
    err.statusCode = 401;
    throw err;
  }
};

module.exports = { admin, verifyFirebaseToken };

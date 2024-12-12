const admin = require("firebase-admin");
require('dotenv').config();
const serviceAccount = require(process.env.FIREBASE_JSON_PATH);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_DATABASE_URL,
});

const bucket = admin.storage().bucket();

module.exports = bucket;

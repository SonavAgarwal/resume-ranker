import * as admin from "firebase-admin";

const serviceAccount = require("../credentials/firebase-credentials.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();
export const auth = admin.auth();

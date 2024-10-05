import {
	initializeApp,
	firestore,
	auth as fbAuth,
	credential,
} from "firebase-admin";

const serviceAccount = require("../credentials/firebase-credentials.json");

initializeApp({
	credential: credential.cert(serviceAccount),
});

export const db = firestore();
export const auth = fbAuth();

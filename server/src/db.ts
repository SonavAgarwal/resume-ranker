import { Candidate } from "./types";

var admin = require("firebase-admin");
try {
	var serviceAccount = require("../credentials/firebase-credentials.json");
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
	});
	var db = admin.firestore();
} catch (e) {
	console.error("Error initializing Firebase Admin");
	console.error(e);
}

export interface RRMetadata {
	currentRound: number;
}

export async function connectToDB(): Promise<RRMetadata> {
	// check doc "config" in meta collection
	// if doc doesn't exist, create it
	// return the doc

	const doc = await db.collection("meta").doc("config").get();
	if (!doc.exists) {
		await db.collection("meta").doc("config").set({ currentRound: 0 });
		return { currentRound: 0 };
	} else {
		return doc.data() as RRMetadata;
	}
}

export function uploadProfile(profile: Candidate) {
	db.collection("profiles").doc(profile.id).set(profile);
}

export function uploadProfiles(profiles: Candidate[]) {
	// open a transaction
	const batch = db.batch();

	// insert the profiles into the database
	profiles.forEach((profile) => {
		const docRef = db.collection("profiles").doc(profile.id);
		batch.set(docRef, profile);
	});

	// commit the transaction
	batch.commit();
}

export async function getProfile(id: string): Promise<Candidate> {
	const doc = await db.collection("profiles").doc(id).get();
	return doc.data() as Candidate;
}

// const sqlite3 = require("sqlite3").verbose();

// // open sqlite database in storage
// const db = new sqlite3.Database("database.sqlite");

// // create a table for the profiles
// db.run(`
//     CREATE TABLE IF NOT EXISTS profiles (
//         id TEXT PRIMARY KEY,
//         name TEXT,
//         data TEXT
//     )
// `);

// // create a table for the comparisons
// db.run(`
//     CREATE TABLE IF NOT EXISTS comparisons (
//         id TEXT PRIMARY KEY,
//         winner TEXT,
//         loser TEXT
//     )
// `);

// // create a table for the ratings
// db.run(`
//     CREATE TABLE IF NOT EXISTS ratings (
//         id TEXT PRIMARY KEY,
//         rd REAL,
//         rating REAL,
//         vol REAL
//     )
// `);

// export function addProfile(profile: Candidate) {
// 	// open a transaction
// 	db.run("BEGIN TRANSACTION");

// 	// insert the profile into the database
// 	db.run(`INSERT INTO profiles (id, name, data) VALUES (?, ?, ?)`, [
// 		profile.id,
// 		profile.name,
// 		JSON.stringify(profile.data),
// 	]);

// 	// add an empty rating for each category
// 	for (const category in profile.ratings) {
// 		db.run(`INSERT INTO ratings (id, rd, rating, vol) VALUES (?, ?, ?, ?)`, [
// 			`${profile.id}-${category}`,
// 			profile.ratings[category].rd,
// 			profile.ratings[category].rating,
// 			profile.ratings[category].vol,
// 		]);
// 	}

// 	// commit the transaction
// 	db.run("COMMIT");
// }

// export function getProfile(id: string): Candidate {
// 	// get the profile from the database
// 	const profile = db.get(`SELECT * FROM profiles WHERE id = ?`, [id]);

// 	// get the ratings from the database
// 	const ratings = db.all(`SELECT * FROM ratings WHERE id LIKE ?`, [`${id}-%`]);

// 	// return the profile
// 	return {
// 		id: profile.id,
// 		name: profile.name,
// 		data: JSON.parse(profile.data),
// 		ratings: ratings.reduce((acc: CategoryRatings, rating: Glicko) => {
// 			const category = rating.id.split("-")[1];
// 			acc[category] = {
// 				id: rating.id,
// 				rd: rating.rd,
// 				rating: rating.rating,
// 				vol: rating.vol,
// 			};
// 			return acc;
// 		}, {}),
// 	};
// }

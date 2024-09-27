const sqlite3 = require("sqlite3").verbose();

// open sqlite database in storage
const db = new sqlite3.Database("database.sqlite");

// create a table for the profiles
db.run(`
    CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        name TEXT,
        data TEXT
    )
`);

// create a table for the comparisons
db.run(`
    CREATE TABLE IF NOT EXISTS comparisons (
        id TEXT PRIMARY KEY,
        winner TEXT,
        loser TEXT
    )
`);

// create a table for the ratings
db.run(`
    CREATE TABLE IF NOT EXISTS ratings (
        id TEXT PRIMARY KEY,
        rd REAL,
        rating REAL,
        vol REAL
    )
`);

export function addProfile(profile: Candidate) {
	// open a transaction
	db.run("BEGIN TRANSACTION");

	// insert the profile into the database
	db.run(`INSERT INTO profiles (id, name, data) VALUES (?, ?, ?)`, [
		profile.id,
		profile.name,
		JSON.stringify(profile.data),
	]);

	// add an empty rating for each category
	for (const category in profile.ratings) {
		db.run(`INSERT INTO ratings (id, rd, rating, vol) VALUES (?, ?, ?, ?)`, [
			`${profile.id}-${category}`,
			profile.ratings[category].rd,
			profile.ratings[category].rating,
			profile.ratings[category].vol,
		]);
	}

	// commit the transaction
	db.run("COMMIT");
}

export function getProfile(id: string): Candidate {
	// get the profile from the database
	const profile = db.get(`SELECT * FROM profiles WHERE id = ?`, [id]);

	// get the ratings from the database
	const ratings = db.all(`SELECT * FROM ratings WHERE id LIKE ?`, [`${id}-%`]);

	// return the profile
	return {
		id: profile.id,
		name: profile.name,
		data: JSON.parse(profile.data),
		ratings: ratings.reduce((acc: CategoryRatings, rating: Glicko) => {
			const category = rating.id.split("-")[1];
			acc[category] = {
				id: rating.id,
				rd: rating.rd,
				rating: rating.rating,
				vol: rating.vol,
			};
			return acc;
		}, {}),
	};
}

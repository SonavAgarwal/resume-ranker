// Example using Express
import { parse } from "csv-parse";
import * as dotenv from "dotenv";
import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { checkAuth, isAdmin, isGod, makeAdmin } from "./auth";
import {
	advanceRound,
	deleteRankingGroup,
	getNextComparisonMeta,
	getProfiles,
	getRankingGroups,
	getResults,
	runCompleteComparison,
	runGeneratePairings,
	uploadProfiles,
} from "./db";
import { RankingGroupNames, rrConfig } from "./rrConfig.alias";
import { parseHeaderCell } from "./sheets";
import {
	Candidate,
	CandidateData,
	UnfilledComparison,
	VectorRatings,
} from "./types";
dotenv.config();

// ====================
// START THE SERVER
// ====================

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Parse request body as JSON
app.use(express.json());

// Add middleware to set CORS headers
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*"); // TODO: Change this to the frontend URL
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

	if (req.method === "OPTIONS") {
		return res.status(200).end();
	}

	return next();
});

app.listen(PORT, "0.0.0.0", () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});

// ====================
// MIDDLEWARE
// ====================

app.use(async (req, res, next) => {
	if (!req.headers.authorization) {
		res.status(401).json({ error: "Unauthorized" });
		return;
	}

	try {
		// extract the token
		const token = req.headers.authorization.split(" ")[1];

		const decodedToken = await checkAuth(token);
		if (!decodedToken) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		// either need to be admin or god
		const uid = decodedToken.uid;
		const isAdminBoolean = await isAdmin(uid);
		const isGodBoolean = isGod(decodedToken.email || "NOT GOD");

		if (!isAdminBoolean && !isGodBoolean) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}

		(req as any).user = decodedToken;

		next();
	} catch (error) {
		console.error("Error during authentication:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// ====================
// ROUTES
// ====================

app.get("/", (req: express.Request, res: express.Response) => {
	res.send("Hey, it's Nova's resume ranking server!");
});

app.get("/groups", async (req: express.Request, res: express.Response) => {
	try {
		const rankingGroups = await getRankingGroups();
		res.send({
			rankingGroups,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Something went wrong, sorry!" });
	}
});

app.get("/comparison", async (req: express.Request, res: express.Response) => {
	const rankingGroup = req.query.rankingGroup as RankingGroupNames;
	const lastPivot = req.query.lastPivot as string;

	const rankerId = (req as any).user.uid;

	if (!rankingGroup) {
		res.status(400).json({ error: "Please provide a ranking group" });
		return;
	}

	if (!rankerId) {
		res.status(400).json({ error: "Please sign in" });
		return;
	}

	const comparison: UnfilledComparison | string = await getNextComparisonMeta(
		rankingGroup,
		rankerId,
		lastPivot
	);

	if (typeof comparison === "string") {
		if (comparison === "ROUND_NOT_IN_PROGRESS") {
			res.status(400).json({ error: "Round not in progress" });

			// start a new round
			runGeneratePairings(rankingGroup, false);
		}
		if (comparison === "RANKING_GROUP_NOT_FOUND") {
			res.status(400).json({ error: "Ranking group not found" });
			return;
		}
		if (comparison === "NO_UNGRADED_COMPARISONS") {
			res.status(202).json({
				error: "No ungraded comparisons. Check back in a bit.",
			});

			// start a new round
			advanceRound(rankingGroup);
		}
	} else {
		// fill the comparison with the actual profiles
		let candidateIds = Object.keys(comparison.candidates);
		const profiles = await getProfiles(rankingGroup, candidateIds);

		comparison.candidates = profiles;

		res.send(comparison);
	}
});

app.post("/rank", async (req: express.Request, res: express.Response) => {
	const {
		comparisonId,
		winners,
		rankingGroup,
	}: {
		comparisonId: string;
		winners: Record<string, string>;
		rankingGroup: RankingGroupNames;
	} = req.body;

	try {
		await runCompleteComparison(rankingGroup, comparisonId, winners);
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Something went wrong, sorry!" });
	}

	res.send({
		error: null,
	});
});

app.post(
	"/upload",
	upload.single("csv"),
	async (req: express.Request, res: express.Response) => {
		// require god
		console.log("req.user", (req as any).user);
		if (!isGod((req as any).user.email)) {
			res.status(401).json({ error: "Unauthorized. You must be god." });
			return;
		}

		const csvData = req.file;
		const rankingGroup = req.body.rankingGroup as RankingGroupNames;
		// Check if the file was uploaded
		if (!csvData) {
			res.status(400).json({ error: "Please upload a file" });
			return;
		}

		try {
			// Get the uploaded file
			const csvData = req.file?.buffer;
			if (!csvData) {
				res.status(400).json({ error: "Please upload a file" });
				return;
			}
			const csvString = csvData.toString("utf-8");

			// Parse the CSV data
			const parser = parse(csvString, {
				columns: false,
				skip_empty_lines: true,
				delimiter: ",",
			});

			const records = await new Promise<string[][]>((resolve, reject) => {
				const records: string[][] = [];
				parser.on("readable", () => {
					let record;
					while ((record = parser.read())) {
						records.push(record);
					}
				});
				parser.on("error", reject);
				parser.on("end", () => resolve(records));
			});

			// The first row is the headers
			const headerRow = records[0];

			// Parse the headers
			const headers = headerRow.map((cell: string) => parseHeaderCell(cell));

			// Process the data rows
			const candidates: Candidate[] = [];

			for (let i = 1; i < records.length; i++) {
				const row = records[i]; // Array of cell values
				const candidateData: CandidateData = {};

				for (let j = 0; j < headers.length; j++) {
					const { key, show, question } = headers[j];
					const answer = row[j];
					candidateData[key] = {
						question,
						answer,
						show,
					};
				}

				// Extract the 'name' from candidateData
				const name = candidateData["name"] ? candidateData["name"].answer : "";

				const ratings: VectorRatings = {};
				rrConfig.vectors[rankingGroup].forEach((vector) => {
					ratings[vector.name] = {
						rating: 1500,
					};
				});

				const candidate: Candidate = {
					id: uuidv4(),
					name,
					ratings: ratings,
					overallRating: 1500, // Default rating
					data: candidateData,
				};

				candidates.push(candidate);
			}

			await uploadProfiles(rankingGroup, candidates);

			res.status(200).json({ candidates });

			await advanceRound(rankingGroup, true);
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: "Something went wrong, sorry!" });
		}
	}
);

// delete a ranking group
app.delete("/group", async (req: express.Request, res: express.Response) => {
	if (!isGod((req as any).user.email)) {
		console.log("not god", (req as any).user);
		res.status(401).json({ error: "Unauthorized. You must be god." });
		return;
	}

	const rankingGroup = req.query.rankingGroup as RankingGroupNames;

	await deleteRankingGroup(rankingGroup);

	res.send("Deleted ranking group");
});

// see ranking group results
app.get("/results", async (req: express.Request, res: express.Response) => {
	const rankingGroup = req.query.rankingGroup as RankingGroupNames;

	const results = await getResults(rankingGroup);

	res.send(results);
});

// make admin endpoint
app.post("/admin", async (req: express.Request, res: express.Response) => {
	const { email } = req.body;

	// make sure the user is god
	if (!isGod((req as any).user.email)) {
		res.status(401).json({ error: "Unauthorized. You must be god." });
		return;
	}

	await makeAdmin(email);

	res.send("User is now an admin");
});

// Example using Express
import { parse } from "csv-parse";
import * as dotenv from "dotenv";
import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { connectToDB, uploadProfiles } from "./db";
import { parseHeaderCell } from "./sheets";
import { Candidate, CandidateData } from "./types";
import { getNextComparison } from "./algorithm";
dotenv.config();

// ====================
// CONNECT TO DATABASE
// ====================

connectToDB();

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
	next();
});

app.listen(PORT, "0.0.0.0", () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});

app.get("/", (req: express.Request, res: express.Response) => {
	res.send("Hey, it's Nova's resume ranking server!");
});

app.get("/comparison", async (req: express.Request, res: express.Response) => {
	const comparison = await getNextComparison("meow");
	res.send(comparison);
});

app.post("/rank", async (req: express.Request, res: express.Response) => {
	console.log(req.body);

	const payload: {
		comparisonId: string;
		winnerId: string;
	} = req.body;

	// perform the comparison

	// update the elo ratings

	// res.send(response);
});

// // upload a profile
// app.post("/profile", async (req: express.Request, res: express.Response) => {
// 	console.log(req.body);

// 	const payload: {
// 		profile: Candidate;
// 	} = req.body;

// 	// add the profile to the database

// 	// res.send(response);
// });

// Upload a CSV of profiles
app.post(
	"/upload",
	upload.single("csv"),
	async (req: express.Request, res: express.Response) => {
		const csvData = req.file;
		// Check if the file was uploaded
		if (!csvData) {
			res.status(400).json({ error: "Please upload a file" });
			return;
		}

		// print the file name
		console.log(csvData.originalname);

		try {
			// Get the uploaded file
			const csvData = req.file?.buffer;
			if (!csvData) {
				console.log("No file uploaded");
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

				const candidate: Candidate = {
					id: uuidv4(),
					name,
					ratings: {}, // Empty map
					data: candidateData,
				};

				candidates.push(candidate);
			}

			uploadProfiles(candidates);

			res.status(200).json({ candidates });
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: "Something went wrong, sorry!" });
		}
	}
);

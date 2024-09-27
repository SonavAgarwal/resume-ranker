// Example using Express
import * as dotenv from "dotenv";
import express from "express";
dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.get("/", (req: express.Request, res: express.Response) => {
	res.send("Hey, it's Nova's resume ranking server!");
});

app.listen(PORT, "0.0.0.0", () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});

// Parse request body as JSON
app.use(express.json());

// Add middleware to set CORS headers
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*"); // TODO: Change this to the frontend URL
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
	next();
});

app.get("/comparison", async (req: express.Request, res: express.Response) => {
	const payload: {
		comparisonId?: string;
	} = req.params;

	// if comparisonId is not provided, return a new comparison

	// if comparisonId is provided, return the comparison with that id
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

// upload a profile
app.post("/profile", async (req: express.Request, res: express.Response) => {
	console.log(req.body);

	const payload: {
		profile: Candidate;
	} = req.body;

	// add the profile to the database

	// res.send(response);
});

// // upload a csv of profiles
// app.post("/profiles", async (req: express.Request, res: express.Response) => {
// 	// extract the csv from the request
// 	const csv = req.body.csv;
// });

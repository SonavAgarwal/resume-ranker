import { rrConfig } from "./rrConfig.alias";
import { getProfile } from "./db";
import { Comparison, ComparisonVector } from "./types";

export async function getNextComparison(rankerId: string): Promise<Comparison> {
	// query the database and get two profiles to compare
	// return the two profiles

	console.log("getNextComparison");

	const profile1 = await getProfile("5a94ee4d-f797-403b-bedb-6ac8dae7c799");
	const profile2 = await getProfile("3a383736-9f90-41f0-87bc-61bf5e5788db");

	// console.log(profile1);
	// console.log(profile2);

	const vectors: {
		[key: string]: ComparisonVector;
	} = {};
	rrConfig.vectors.forEach((vector) => {
		vectors[vector.name] = {
			name: vector.name,
			question: vector.question,
		};
	});

	console.log(vectors);

	const comparison: Comparison = {
		id: "1",
		candidates: {
			[profile1.id]: profile1,
			[profile2.id]: profile2,
		},
		vectors,
	};

	console.log(comparison);

	return comparison;
}

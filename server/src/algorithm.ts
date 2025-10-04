import { RankingGroupNames, rrConfig } from "./rrConfig.alias";
import { Candidate, Comparison, Round, UnfilledComparison } from "./types";

interface EloOptions {
	pivotId?: string;
	pivotMatchCount?: number;
}

export function calculateNewELOs(
	comparison: Comparison,
	winners: Record<string, string>,
	options: EloOptions = {}
) {
	let candidateIds = Object.keys(comparison.candidates);
	let c1 = comparison.candidates[candidateIds[0]];
	let c2 = comparison.candidates[candidateIds[1]];

	// calculate the new ELOs for each vector
	// return the new ELOs

	let vectors = Object.keys(comparison.vectors);

	const pivotId = options.pivotId;
	const pivotMatchCount = Math.max(1, options.pivotMatchCount || 1);

	const adjustKForPivot = (candidateId: string, baseK: number) => {
		if (!pivotId || candidateId !== pivotId) {
			return baseK;
		}
		return baseK / Math.sqrt(pivotMatchCount);
	};

	for (let i = 0; i < vectors.length; i++) {
		let vector = vectors[i];
		let winnerId = winners[vector] || "same";

		// save the winnerId in the comparison
		comparison.vectors[vector].winner = winnerId;

		let c1Rating = c1.ratings[vector].rating;
		let c2Rating = c2.ratings[vector].rating;

		let expectedScore = getExpectedScore(c1Rating, c2Rating);
		let c1KFactor = adjustKForPivot(c1.id, getKFactor(c1Rating));
		let c2KFactor = adjustKForPivot(c2.id, getKFactor(c2Rating));

		if (winnerId === "same") {
			c1.ratings[vector].rating = getNewELO(
				c1Rating,
				expectedScore,
				0.5,
				c1KFactor
			);
			c2.ratings[vector].rating = getNewELO(
				c2Rating,
				1 - expectedScore,
				0.5,
				c2KFactor
			);
		} else if (winnerId === c1.id) {
			c1.ratings[vector].rating = getNewELO(
				c1Rating,
				expectedScore,
				1,
				c1KFactor
			);
			c2.ratings[vector].rating = getNewELO(
				c2Rating,
				1 - expectedScore,
				0,
				c2KFactor
			);
		} else if (winnerId === c2.id) {
			c1.ratings[vector].rating = getNewELO(
				c1Rating,
				expectedScore,
				0,
				c1KFactor
			);
			c2.ratings[vector].rating = getNewELO(
				c2Rating,
				1 - expectedScore,
				1,
				c2KFactor
			);
		} else {
			throw new Error("Invalid winnerId");
		}
	}

	// update the overall ratings (weighted average of vector ratings)
	let c1OverallRating = 0;
	let c2OverallRating = 0;

	vectors.forEach((vector) => {
		let weight = comparison.vectors[vector].weight;
		c1OverallRating += c1.ratings[vector].rating * weight;
		c2OverallRating += c2.ratings[vector].rating * weight;
	});

	c1.overallRating = c1OverallRating;
	c2.overallRating = c2OverallRating;
}

function getExpectedScore(rating1: number, rating2: number): number {
	return 1 / (1 + Math.pow(10, (rating2 - rating1) / 400));
}

function getKFactor(rating: number): number {
	return rrConfig.kFactor;
}

function getNewELO(
	rating: number,
	expectedScore: number,
	actualScore: number,
	kFactor: number
): number {
	return rating + kFactor * (actualScore - expectedScore);
}

export interface GeneratedPairings {
	comparisons: UnfilledComparison[];
	pivotIds: string[];
	pivotMatchCounts: Record<string, number>;
}

export function generatePairings(
	rankingGroup: RankingGroupNames,
	candidates: Candidate[],
	round: Round
): GeneratedPairings {
	let numCandidates = candidates.length;

	// pick the pivots (numPivots)
	let numPivots = round.numPivots;

	if (numPivots <= 0) {
		throw new Error("Round must have at least one pivot");
	}

	if (numCandidates < numPivots) {
		throw new Error("Not enough candidates to generate pairings");
	}

	// pick the middle numPivots candidates as pivots
	let pivotIndices = new Set<number>();
	let midLowBound = Math.floor(numCandidates / 2) - Math.floor(numPivots / 2);
	let midHighBound = Math.floor(numCandidates / 2) + Math.floor(numPivots / 2);
	midHighBound = Math.max(midHighBound, midLowBound + numPivots);
	for (let i = midLowBound; i < midHighBound; i++) {
		pivotIndices.add(i);
	}

	const pivotIndicesArray = Array.from(pivotIndices);
	const pivotIds = pivotIndicesArray.map((index) => candidates[index].id);
	const pivotMatchCounts: Record<string, number> = {};
	pivotIds.forEach((id) => {
		pivotMatchCounts[id] = 0;
	});

	// for each candidate that's not in the pivots, generate a comparison with one of the pivots
	let comparisons: UnfilledComparison[] = [];
	for (let i = 0; i < numCandidates; i++) {
		if (pivotIndices.has(i)) {
			continue;
		}

		let pivotIndex = pivotIndicesArray[i % numPivots];

		let pivot = candidates[pivotIndex];
		let candidate = candidates[i];

		const candidateID = candidate.id;
		const pivotID = pivot.id;

		pivotMatchCounts[pivotID] = (pivotMatchCounts[pivotID] || 0) + 1;

		let comparison: UnfilledComparison = {
			id: `c-${pivotID}-${candidateID}`,
			pivot: pivotID,
			grader: null,
			graded: false,
			candidates: {
				[pivotID]: {},
				[candidateID]: {},
			},
			vectors: {},
		};

		rrConfig.vectors[rankingGroup].forEach((vector) => {
			comparison.vectors[vector.name] = {
				name: vector.name,
				question: vector.question,
				weight: vector.weight,
			};
		});

		comparisons.push(comparison);
	}

	return { comparisons, pivotIds, pivotMatchCounts };
}

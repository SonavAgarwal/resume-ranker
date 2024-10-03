import admin, { firestore } from "firebase-admin";
import { calculateNewELOs, generatePairings } from "./algorithm";
import { db } from "./firebase";
import { RankingGroupNames, rrConfig } from "./rrConfig.alias";
import {
	Candidate,
	Comparison,
	RankingGroup,
	Round,
	RoundStatus,
	UnfilledComparison,
} from "./types";

export interface RRMetadata {
	currentRound: number;
}

// export async function connectToDB(): Promise<RRMetadata> {
// 	// check doc "config" in meta collection
// 	// if doc doesn't exist, create it
// 	// return the doc

// 	const doc = await db.collection("meta").doc("config").get();
// 	if (!doc.exists) {
// 		await db.collection("meta").doc("config").set({ currentRound: 0 });
// 		return { currentRound: 0 };
// 	} else {
// 		return doc.data() as RRMetadata;
// 	}
// }

export function uploadProfile(profile: Candidate) {
	db.collection("profiles").doc(profile.id).set(profile);
}

export async function uploadProfiles(
	rankingGroup: RankingGroupNames,
	profiles: Candidate[]
) {
	console.log("uploadProfiles");
	// open a transaction
	const batch = db.batch();

	// update the doc rankingGroup in the rankingGroups collection
	const rankingGroupRef = db.collection("rankingGroups").doc(rankingGroup);
	// add number of profiles to the rankingGroup
	const numNewProfiles = profiles.length;

	const rounds: Round[] = rrConfig.systems[rankingGroup].rounds.map((round) => {
		return {
			number: round.number,
			keepPercentage: round.keepPercentage,
			numPivots: round.numPivots,
			status: RoundStatus.NOT_STARTED,
		};
	});

	interface RankingGroupConstruction
		extends Omit<RankingGroup, "lastUpdated" | "numProfiles"> {
		name: string;
		lastUpdated: firestore.FieldValue;
		numProfiles: firestore.FieldValue;
		currentRound: number;
		rounds: Round[];
	}

	const docData: RankingGroupConstruction = {
		name: rankingGroup,
		lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
		numProfiles: admin.firestore.FieldValue.increment(numNewProfiles),
		currentRound: 0,
		rounds: rounds,
	};

	batch.set(rankingGroupRef, docData, { merge: true });
	console.log("ranking group ref set");

	// insert the profiles into the database
	profiles.forEach((profile) => {
		const docRef = db
			.collection("rankingGroups")
			.doc(rankingGroup)
			.collection("profiles")
			.doc(profile.id);
		batch.set(docRef, profile);
	});
	console.log("profiles set");

	// commit the transaction
	await batch.commit();
	console.log("batch committed");
}

export async function getProfile(
	rankingGroup: string,
	id: string
): Promise<Candidate> {
	const doc = await db
		.collection("rankingGroups")
		.doc(rankingGroup)
		.collection("profiles")
		.doc(id)
		.get();
	return doc.data() as Candidate;
}

export async function getProfiles(
	rankingGroup: RankingGroupNames,
	candidateIds: string[]
): Promise<{ [key: string]: Candidate }> {
	const promises = candidateIds.map((id) => getProfile(rankingGroup, id));
	// wait for all the promises to resolve
	const profiles = await Promise.all(promises);
	// return the profiles as an object
	return profiles.reduce((acc, profile) => {
		acc[profile.id] = profile;
		return acc;
	}, {} as { [key: string]: Candidate });
}

export async function getRankingGroups(): Promise<RankingGroup[]> {
	const snapshot = await db.collection("rankingGroups").listDocuments();
	const rankingGroups: RankingGroup[] = [];
	for (const doc of snapshot) {
		const data = await doc.get();
		let newRG = data.data() as RankingGroup;
		newRG.name = doc.id;
		rankingGroups.push(newRG);
	}
	return rankingGroups;
}

export async function advanceRound(rankingGroup: RankingGroupNames) {
	// increment the current round
	// const rankingGroupRef = db.collection("rankingGroups").doc(rankingGroup);
	// await db.runTransaction(async (t) => {
	// 	const rankingGroupDoc = await t.get(rankingGroupRef);
	// 	const rankingGroupData = rankingGroupDoc.data() as RankingGroup;

	// 	if (!rankingGroupData) {
	// 		throw new Error("Ranking group not found");
	// 	}

	// 	let currentRound = rankingGroupData.currentRound;

	// 	// Check if we're past the last round
	// 	if (currentRound >= rankingGroupData.rounds.length) {
	// 		return false;
	// 	}

	// 	// Check if the current round is completed
	// 	if (
	// 		rankingGroupData.rounds[currentRound].status !== RoundStatus.COMPLETED
	// 	) {
	// 		return false;
	// 	}

	// 	// Increment the current round
	// 	await t.update(rankingGroupRef, {
	// 		currentRound: admin.firestore.FieldValue.increment(1),
	// 	});

	// 	return true;
	// });

	// start the next round
	runGeneratePairings(rankingGroup);
}

// advances the round and generates the pairings
export async function runGeneratePairings(
	rankingGroup: RankingGroupNames,
	advanceRound: boolean = true
) {
	// open a transaction

	console.log("runGeneratePairings");

	await db.runTransaction(async (t) => {
		// get the rankingGroup document
		const rankingGroupRef = db.collection("rankingGroups").doc(rankingGroup);
		const rankingGroupDoc = await t.get(rankingGroupRef);
		const rankingGroupData = rankingGroupDoc.data() as RankingGroup;

		if (!rankingGroupData) {
			throw new Error("Ranking group not found");
		}

		console.log("A");

		// check the round status
		let currentRound = rankingGroupData.currentRound;

		// check if we're past the last round
		if (currentRound >= rankingGroupData.rounds.length) {
			return;
		}

		if (advanceRound) {
			// make sure the current round is completed
			if (
				rankingGroupData.rounds[currentRound].status !== RoundStatus.COMPLETED
			) {
				return;
			}

			// increment the current round
			rankingGroupData.currentRound++;
			currentRound = rankingGroupData.currentRound;
		}

		// Make sure that the next round is not started
		let roundStatus = rankingGroupData.rounds[currentRound].status;
		if (roundStatus !== RoundStatus.NOT_STARTED) {
			return;
		}

		console.log("B");

		let numProfiles = rankingGroupData.numProfiles;
		let currentKeepPercentage =
			rankingGroupData.rounds[currentRound].keepPercentage;
		let numProfilesToKeep = Math.floor(numProfiles * currentKeepPercentage);

		// get all the profiles ordered by their overall rating
		const profiles = await db
			.collection("rankingGroups")
			.doc(rankingGroup)
			.collection("profiles")
			.orderBy("overallRating", "desc")
			.limit(numProfilesToKeep);

		// get the profiles
		const profilesSnapshot = (await t.get(
			profiles
		)) as firestore.QuerySnapshot<Candidate>;
		const profilesData = profilesSnapshot.docs.map(
			(doc) => doc.data() as Candidate
		);

		console.log("C");

		let currentRoundObj = rankingGroupData.rounds[currentRound];

		// create the pairings
		const pairings = generatePairings(
			rankingGroup,
			profilesData,
			currentRoundObj
		);

		// write the pairings to the database
		const pairingsRef = db
			.collection("rankingGroups")
			.doc(rankingGroup)
			.collection("rounds")
			.doc(currentRound.toString())
			.collection("pairings");

		pairings.forEach((pairing) => {
			t.set(pairingsRef.doc(pairing.id), pairing);
		});

		console.log("D");

		// update the round status to IN_PROGRESS
		currentRoundObj.status = RoundStatus.IN_PROGRESS;
		t.set(rankingGroupRef, rankingGroupData);
	});
}

export async function getNextComparisonMeta(
	rankingGroup: RankingGroupNames,
	rankerId: string,
	lastPivot?: string
): Promise<UnfilledComparison | string> {
	// open a transaction
	const comparison = await db.runTransaction(async (t) => {
		// get the rankingGroup document
		const rankingGroupRef = db.collection("rankingGroups").doc(rankingGroup);
		const rankingGroupDoc = await t.get(rankingGroupRef);
		const rankingGroupData = rankingGroupDoc.data() as RankingGroup;
		// console.log(rankingGroupData);

		if (!rankingGroupData) {
			return "RANKING_GROUP_NOT_FOUND";
		}

		// check the round status
		let currentRound = rankingGroupData.currentRound;

		// check if we're past the last round
		if (currentRound >= rankingGroupData.rounds.length) {
			return "NO_UNGRADED_COMPARISONS";
		}

		let roundStatus = rankingGroupData.rounds?.[currentRound]?.status;
		if (roundStatus !== RoundStatus.IN_PROGRESS) {
			return "ROUND_NOT_IN_PROGRESS";
		}

		// first check if there's a comparison that the ranker hasn't graded
		const ungraded = db
			.collection("rankingGroups")
			.doc(rankingGroup)
			.collection("rounds")
			.doc(currentRound.toString())
			.collection("pairings")
			.where("grader", "==", rankerId)
			.where("graded", "==", false)
			.limit(1);

		const ungradedSnapshot = (await t.get(
			ungraded
		)) as firestore.QuerySnapshot<UnfilledComparison>;

		if (!ungradedSnapshot.empty) {
			const ungradedData =
				ungradedSnapshot.docs[0].data() as UnfilledComparison;
			return ungradedData;
		}

		// check if there's a comparison that has the lastPivot
		if (lastPivot) {
			const pivot = db
				.collection("rankingGroups")
				.doc(rankingGroup)
				.collection("rounds")
				.doc(currentRound.toString())
				.collection("pairings")
				.where("pivot", "==", lastPivot)
				.where("grader", "==", null)
				.limit(1);

			const pivotSnapshot = (await t.get(
				pivot
			)) as firestore.QuerySnapshot<UnfilledComparison>;

			if (!pivotSnapshot.empty) {
				// assign the comparison to the ranker
				const chainedComparison =
					pivotSnapshot.docs[0].data() as UnfilledComparison;
				chainedComparison.grader = rankerId;
				t.update(pivotSnapshot.docs[0].ref, {
					grader: rankerId,
				});
				return chainedComparison;
			}
		}

		// get any pairings that the ranker hasn't graded
		const pairings = db
			.collection("rankingGroups")
			.doc(rankingGroup)
			.collection("rounds")
			.doc(currentRound.toString())
			.collection("pairings")
			.where("grader", "==", null)
			.limit(1);

		// get the pairings
		const pairingsSnapshot = (await t.get(
			pairings
		)) as firestore.QuerySnapshot<UnfilledComparison>;

		if (pairingsSnapshot.empty) {
			// look for assigned but expired pairings (5 minutes timeout)
			const expiredPairings = db
				.collection("rankingGroups")
				.doc(rankingGroup)
				.collection("rounds")
				.doc(currentRound.toString())
				.collection("pairings")
				.where("graded", "==", false)
				.where(
					"assignedAt",
					"<",
					admin.firestore.Timestamp.fromMillis(Date.now() - 5 * 60 * 1000)
				)
				.limit(1);

			const expiredPairingsSnapshot = (await t.get(
				expiredPairings
			)) as firestore.QuerySnapshot<UnfilledComparison>;

			if (!expiredPairingsSnapshot.empty) {
				const expiredPairing =
					expiredPairingsSnapshot.docs[0].data() as UnfilledComparison;
				// assign the comparison to the ranker
				t.update(expiredPairingsSnapshot.docs[0].ref, {
					grader: rankerId,
					assignedAt: admin.firestore.Timestamp.now(),
				});
				return expiredPairing;
			}

			return "NO_UNGRADED_COMPARISONS";
		}

		// assign the comparison to the ranker
		const comparison = pairingsSnapshot.docs[0].data() as UnfilledComparison;
		comparison.grader = rankerId;
		t.update(pairingsSnapshot.docs[0].ref, {
			grader: rankerId,
		});
		return comparison;
	});

	return comparison;
}

export async function checkIfRoundOver(rankingGroup: RankingGroupNames) {
	// open a transaction
	const roundOver = await db.runTransaction(async (t) => {
		// get the rankingGroup document
		const rankingGroupRef = db.collection("rankingGroups").doc(rankingGroup);
		const rankingGroupDoc = await t.get(rankingGroupRef);
		const rankingGroupData = rankingGroupDoc.data() as RankingGroup;

		// check the round status
		let currentRound = rankingGroupData.currentRound;
		let roundStatus = rankingGroupData.rounds[currentRound].status;
		if (roundStatus !== RoundStatus.IN_PROGRESS) {
			return;
		}

		// check if all the pairings have been graded
		const pairings = db
			.collection("rankingGroups")
			.doc(rankingGroup)
			.collection("rounds")
			.doc(currentRound.toString())
			.collection("pairings")
			.where("graded", "==", false);

		const pairingsSnapshot = (await t.get(
			pairings
		)) as firestore.QuerySnapshot<UnfilledComparison>;

		if (pairingsSnapshot.empty) {
			// update the round status to FINISHED
			let updateObject: any = {};
			updateObject[`rounds.${currentRound}.status`] = RoundStatus.COMPLETED;
			updateObject[`currentRound`] = rankingGroupData.currentRound;
			t.update(rankingGroupRef, updateObject);
		}
	});

	return roundOver;
}

// delete ranking group
export async function deleteRankingGroup(rankingGroup: RankingGroupNames) {
	// use recursive delete
	const rgref = db.collection("rankingGroups").doc(rankingGroup);
	admin.firestore().recursiveDelete(rgref);
}

export async function runCompleteComparison(
	rankingGroup: RankingGroupNames,
	comparisonId: string,
	winners: Record<string, string>
) {
	// open a transaction
	await db.runTransaction(async (t) => {
		// get the rankingGroup document
		const rankingGroupRef = db.collection("rankingGroups").doc(rankingGroup);
		const rankingGroupDoc = await t.get(rankingGroupRef);
		const rankingGroupData = rankingGroupDoc.data() as RankingGroup;
		if (!rankingGroupData) {
			throw new Error("Ranking group not found");
		}

		// check the round status
		let currentRound = rankingGroupData.currentRound;

		// get the comparison document
		const comparisonRef = db
			.collection("rankingGroups")
			.doc(rankingGroup)
			.collection("rounds")
			.doc(currentRound.toString())
			.collection("pairings")
			.doc(comparisonId);

		const comparisonDoc = await t.get(comparisonRef);
		const comparisonData = comparisonDoc.data() as UnfilledComparison;

		// fetch the profiles
		const candidateIds = Object.keys(comparisonData.candidates);
		const profiles = await getProfiles(rankingGroup, candidateIds);
		let filledComparison = comparisonData as Comparison;
		filledComparison.candidates = profiles;
		filledComparison.graded = true;

		// get the profiles
		const c1 = profiles[candidateIds[0]];
		const c2 = profiles[candidateIds[1]];

		// calculate the new ELO ratings
		calculateNewELOs(filledComparison, winners);

		// update the comparison document

		let guttedComparison = {
			...filledComparison,
			candidates: {
				[c1.id]: {},
				[c2.id]: {},
			},
		};

		t.update(comparisonRef, guttedComparison);

		// update the elos of the profiles

		t.set(
			db
				.collection("rankingGroups")
				.doc(rankingGroup)
				.collection("profiles")
				.doc(c1.id),
			filledComparison.candidates[c1.id]
		);

		t.set(
			db
				.collection("rankingGroups")
				.doc(rankingGroup)
				.collection("profiles")
				.doc(c2.id),
			filledComparison.candidates[c2.id]
		);
	});
}

export async function getResults(rankingGroup: RankingGroupNames) {
	// get the profiles
	const profiles = await db
		.collection("rankingGroups")
		.doc(rankingGroup)
		.collection("profiles")
		.orderBy("overallRating", "desc")
		.get();

	// print all the ids
	profiles.forEach((doc) => {
		console.log(doc.id);
	});

	return { profiles: profiles.docs.map((doc) => doc.data() as Candidate) };
}

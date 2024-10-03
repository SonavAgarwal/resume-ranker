import { firestore } from "firebase-admin";

export interface Candidate {
	id: string;
	name: string;
	ratings: VectorRatings;
	overallRating: number;
	data: CandidateData;
}

export interface VectorRatings {
	[key: string]: ELO;
}

export interface ELO {
	// id: string;
	// rd: number;
	rating: number;
	// vol: number;
}

export interface CandidateData {
	[key: string]: {
		question: string;
		answer: any;
		show: boolean;
	};
}

export interface Comparison {
	id: string;
	grader: string | null;
	graded?: boolean;
	assignedAt?: firestore.Timestamp;
	pivot: string;
	candidates: {
		[id: string]: Candidate;
	};
	vectors: {
		[id: string]: ComparisonVector;
	};
}

export interface UnfilledComparison {
	id: string;
	grader: string | null;
	graded?: boolean;
	assignedAt?: firestore.Timestamp;
	pivot: string;
	candidates: {
		[id: string]: {};
	};
	vectors: {
		[id: string]: ComparisonVector;
	};
}

export interface ComparisonVector {
	name: string;
	question: string;
	weight: number;
	winner?: Candidate["id"];
}

export interface RankingGroup {
	name: string;
	lastUpdated: FirebaseFirestore.Timestamp;
	numProfiles: number;
	rounds: Round[];
	currentRound: number;
}

export interface Round {
	number: number;
	keepPercentage: number;
	numPivots: number;
	status?: RoundStatus;
}

export enum RoundStatus {
	NOT_STARTED = "NOT_STARTED",
	IN_PROGRESS = "IN_PROGRESS",
	COMPLETED = "COMPLETED",
	GENERATING = "GENERATING",
}

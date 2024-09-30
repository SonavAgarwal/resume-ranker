export interface Candidate {
	id: string;
	name: string;
	ratings: CategoryRatings;
	data: CandidateData;
}

export interface CategoryRatings {
	[key: string]: Glicko;
}

export interface Glicko {
	id: string;
	rd: number;
	rating: number;
	vol: number;
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
	candidates: {
		[id: string]: Candidate;
	};
	vectors: {
		[id: string]: ComparisonVector;
	};
}

export interface ComparisonVector {
	name: string;
	question: string;
	winner?: Candidate["id"];
}

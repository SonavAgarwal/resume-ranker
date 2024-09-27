interface Candidate {
	id: string;
	name: string;
	ratings: CategoryRatings;
	data: CandidateData;
}

interface CategoryRatings {
	[key: string]: Glicko;
}

interface Glicko {
	id: string;
	rd: number;
	rating: number;
	vol: number;
}

interface CandidateData {
	[key: string]: {
		question: string;
		answer: any;
		show: boolean;
	};
}

interface Comparison {
	id: string;
	candidates: {
		[id: string]: Candidate;
	};
	vectors: {
		[id: string]: ComparisonVector;
	};
}

interface ComparisonVector {
	name: string;
	question: string;
	winner?: Candidate["id"];
}

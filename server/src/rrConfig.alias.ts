export type RankingGroupNames = "devs-24" | "designers-24" | "numbers";

export const rrConfig = {
	kFactor: 32,
	settings: {
		"devs-24": {
			questionOrder: ["socialGood", "technicalSkills", "preference"],
			fieldOrder: [
				"pronouns",
				"gradYear",
				"majors",
				"minors",
				"whyNova",
				"problem",
				"community",
				"links",
				"additionalInfo",
				"resume",
			],
		},
		"designers-24": {
			questionOrder: ["socialGood", "technicalSkills", "preference"],
			fieldOrder: [
				"pronouns",
				"gradYear",
				"majors",
				"minors",
				"whyNova",
				"problem",
				"community",
				"links",
				"additionalInfo",
				"resume",
			],
		},
		numbers: {
			questionOrder: ["Number 1", "Number 2", "Number 3"],
			fieldOrder: [],
		},
	},

	vectors: {
		numbers: [
			{
				name: "Number 1",
				question: "Whose number 1 is higher?",
				weight: 0.33333,
			},
			{
				name: "Number 2",
				question: "Whose number 2 is higher?",
				weight: 0.33333,
			},
			{
				name: "Number 3",
				question: "Whose number 3 is higher?",
				weight: 0.33333,
			},
		],
		"devs-24": [
			{
				name: "socialGood",
				question: "Who demonstrates a bigger drive for impact and social good?",
				weight: 0.1,
			},
			{
				name: "technicalSkills",
				question:
					"Who is more technically skilled and better at problem solving?",
				weight: 0.8,
			},
			{
				name: "preference",
				question: "Who would you prefer to work with?",
				weight: 0.1,
			},
		],
		"designers-24": [
			{
				name: "socialGood",
				question: "Who demonstrates a bigger drive for impact and social good?",
				weight: 0.1,
			},
			{
				name: "technicalSkills",
				question:
					"Who is more technically skilled and better at problem solving?",
				weight: 0.8,
			},
			{
				name: "preference",
				question: "Who would you prefer to work with?",
				weight: 0.1,
			},
		],
	},
	systems: {
		numbers: {
			numRounds: 1,
			rounds: [
				{
					number: 0,
					keepPercentage: 1,
					numPivots: 2,
				},
				{
					number: 1,
					keepPercentage: 0.7,
					numPivots: 2,
				},
				{
					number: 2,
					keepPercentage: 0.5,
					numPivots: 2,
				},
				{
					number: 3,
					keepPercentage: 0.3,
					numPivots: 2,
				},
			],
		},
		"devs-24": {
			numRounds: 2,
			rounds: [
				{
					number: 0,
					keepPercentage: 1,
					numPivots: 5,
				},
				{
					number: 1,
					keepPercentage: 0.85,
					numPivots: 1,
				},
				{
					number: 2,
					keepPercentage: 0.65,
					numPivots: 5,
				},
				{
					number: 3,
					keepPercentage: 0.45,
					numPivots: 5,
				},
				{
					number: 4,
					keepPercentage: 0.25,
					numPivots: 5,
				},
			],
		},
		"designers-24": {
			numRounds: 2,
			rounds: [
				{
					number: 0,
					keepPercentage: 1,
					numPivots: 3,
				},
				{
					number: 1,
					keepPercentage: 0.85,
					numPivots: 3,
				},
				{
					number: 2,
					keepPercentage: 0.65,
					numPivots: 3,
				},
				{
					number: 3,
					keepPercentage: 0.45,
					numPivots: 3,
				},
				{
					number: 4,
					keepPercentage: 0.25,
					numPivots: 3,
				},
			],
		},
	},
};

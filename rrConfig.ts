export const rrConfig = {
	vectors: [
		{
			name: "experience",
			question: "Which candidate is more experienced?",
		},
		{
			name: "fit",
			question: "Which candidate is a better fit for the team?",
		},
		{
			name: "technicalSkills",
			question: "Which candidate has better technical skills?",
		},
	],
	system: {
		numRounds: 2,
		rounds: {
			"0": {
				type: "random",
				chainSize: 10,
				eliminate: 0,
			},
			"1": {
				type: "swiss",
				chainSize: 2,
				eliminate: 0,
			},
			"2": {
				type: "swiss",
				chainSize: 2,
				eliminate: 0,
			},
			"3": {
				type: "swiss",
				chainSize: 2,
				eliminate: 0,
			},
			"4": {
				type: "swiss",
				chainSize: 2,
				eliminate: 0,
			},
			"5": {
				type: "swiss",
				chainSize: 2,
				eliminate: 0,
			},
			"6": {
				type: "swiss",
				chainSize: 2,
				eliminate: 0.2,
			},
			"7": {
				type: "swiss",
				chainSize: 2,
				eliminate: 0.2,
			},
			"8": {
				type: "swiss",
				chainSize: 2,
				eliminate: 0.2,
			},
			"9": {
				type: "swiss",
				chainSize: 2,
				eliminate: 0.2,
			},
		},
	},
};

export type RankingGroupNames =
    | 'dev-25-co29'
    | 'dev-25-co28'
    | 'dev-25-co27'
    | 'des-25-co29'
    | 'des-25-co28'
    | 'des-25-co27'

export const BASE_COLLECTION = 'ranking_groups_25'

export const rrConfig = {
    kFactor: 32,
    settings: {
        'dev-25-co29': {
            questionOrder: ['socialGood', 'technicalSkills', 'preference'],
            fieldOrder: [
                'pronouns',
                'gradYear',
                'majors',
                'minors',
                'whyNova',
                'problem',
                'community',
                'links',
                'additionalInfo',
                'resume'
            ]
        },
        'dev-25-co28': {
            questionOrder: ['socialGood', 'technicalSkills', 'preference'],
            fieldOrder: [
                'pronouns',
                'gradYear',
                'majors',
                'minors',
                'whyNova',
                'problem',
                'community',
                'links',
                'additionalInfo',
                'resume'
            ]
        },
        'dev-25-co27': {
            questionOrder: ['socialGood', 'technicalSkills', 'preference'],
            fieldOrder: [
                'pronouns',
                'gradYear',
                'majors',
                'minors',
                'whyNova',
                'problem',
                'community',
                'links',
                'additionalInfo',
                'resume'
            ]
        },
        'des-25-co29': {
            questionOrder: ['socialGood', 'technicalSkills', 'preference'],
            fieldOrder: [
                'pronouns',
                'gradYear',
                'majors',
                'minors',
                'whyNova',
                'problem',
                'community',
                'links',
                'additionalInfo',
                'resume'
            ]
        },
        'des-25-co28': {
            questionOrder: ['socialGood', 'technicalSkills', 'preference'],
            fieldOrder: [
                'pronouns',
                'gradYear',
                'majors',
                'minors',
                'whyNova',
                'problem',
                'community',
                'links',
                'additionalInfo',
                'resume'
            ]
        },
        'des-25-co27': {
            questionOrder: ['socialGood', 'technicalSkills', 'preference'],
            fieldOrder: [
                'pronouns',
                'gradYear',
                'majors',
                'minors',
                'whyNova',
                'problem',
                'community',
                'links',
                'additionalInfo',
                'resume'
            ]
        }
    },

    vectors: {
        'dev-25-co29': [
            {
                name: 'socialGood',
                question:
                    'Who demonstrates a bigger drive for impact and social good?',
                weight: 0.3
            },
            {
                name: 'technicalSkills',
                question:
                    'Who is more technically skilled and better at problem solving?',
                weight: 0.6
            },
            {
                name: 'preference',
                question: 'Who would you prefer to work with?',
                weight: 0.1
            }
        ],
        'dev-25-co28': [
            {
                name: 'socialGood',
                question:
                    'Who demonstrates a bigger drive for impact and social good?',
                weight: 0.3
            },
            {
                name: 'technicalSkills',
                question:
                    'Who is more technically skilled and better at problem solving?',
                weight: 0.6
            },
            {
                name: 'preference',
                question: 'Who would you prefer to work with?',
                weight: 0.1
            }
        ],
        'dev-25-co27': [
            {
                name: 'socialGood',
                question:
                    'Who demonstrates a bigger drive for impact and social good?',
                weight: 0.3
            },
            {
                name: 'technicalSkills',
                question:
                    'Who is more technically skilled and better at problem solving?',
                weight: 0.6
            },
            {
                name: 'preference',
                question: 'Who would you prefer to work with?',
                weight: 0.1
            }
        ],
        'des-25-co29': [
            {
                name: 'socialGood',
                question:
                    'Who demonstrates a bigger drive for impact and social good?',
                weight: 0.3
            },
            {
                name: 'technicalSkills',
                question:
                    'Who is more technically skilled and better at problem solving?',
                weight: 0.6
            },
            {
                name: 'preference',
                question: 'Who would you prefer to work with?',
                weight: 0.1
            }
        ],
        'des-25-co28': [
            {
                name: 'socialGood',
                question:
                    'Who demonstrates a bigger drive for impact and social good?',
                weight: 0.3
            },
            {
                name: 'technicalSkills',
                question:
                    'Who is more technically skilled and better at problem solving?',
                weight: 0.6
            },
            {
                name: 'preference',
                question: 'Who would you prefer to work with?',
                weight: 0.1
            }
        ],
        'des-25-co27': [
            {
                name: 'socialGood',
                question:
                    'Who demonstrates a bigger drive for impact and social good?',
                weight: 0.3
            },
            {
                name: 'technicalSkills',
                question:
                    'Who is more technically skilled and better at problem solving?',
                weight: 0.6
            },
            {
                name: 'preference',
                question: 'Who would you prefer to work with?',
                weight: 0.1
            }
        ]
    },
    systems: {
        'dev-25-co29': {
            numRounds: 6,
            rounds: [
                {
                    number: 0,
                    keepPercentage: 1,
                    numPivots: 5
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 5
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 4
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 3
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 2
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 2
                }
            ]
        },
        'dev-25-co28': {
            numRounds: 6,
            rounds: [
                {
                    number: 0,
                    keepPercentage: 1,
                    numPivots: 5
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 5
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 4
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 3
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 2
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 2
                }
            ]
        },
        'dev-25-co27': {
            numRounds: 6,
            rounds: [
                {
                    number: 0,
                    keepPercentage: 1,
                    numPivots: 5
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 5
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 4
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 3
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 2
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 2
                }
            ]
        },
        'des-25-co29': {
            numRounds: 6,
            rounds: [
                {
                    number: 0,
                    keepPercentage: 1,
                    numPivots: 5
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 5
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 4
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 3
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 2
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 2
                }
            ]
        },
        'des-25-co28': {
            numRounds: 6,
            rounds: [
                {
                    number: 0,
                    keepPercentage: 1,
                    numPivots: 5
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 5
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 4
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 3
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 2
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 2
                }
            ]
        },
        'des-25-co27': {
            numRounds: 6,
            rounds: [
                {
                    number: 0,
                    keepPercentage: 1,
                    numPivots: 5
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 5
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 4
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 3
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 2
                },
                {
                    number: 1,
                    keepPercentage: 0.8,
                    numPivots: 2
                }
            ]
        }
    }
}

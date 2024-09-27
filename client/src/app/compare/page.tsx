'use client'

import React from 'react'
import Profile from './Profile'
import { useForm } from 'react-hook-form'
import clsx from 'clsx'

interface Props {}

const comparison: Comparison = {
    id: '1',
    candidates: {
        '1': {
            id: '1',
            name: 'John Doe',
            ratings: {
                '1': {
                    id: '1',
                    rd: 100,
                    rating: 1500,
                    vol: 0.06
                },
                '2': {
                    id: '2',
                    rd: 100,
                    rating: 1500,
                    vol: 0.06
                }
            },
            data: {
                experience: {
                    question: 'How many years of experience do you have?',
                    answer: 5
                },
                skills: {
                    question: 'What skills do you have?',
                    answer: ['React', 'Node.js']
                },
                education: {
                    question: 'What is your highest level of education?',
                    answer: 'Bachelors'
                },
                experience2: {
                    question: 'How many years of experience do you have?',
                    answer: 5
                },
                skills2: {
                    question: 'What skills do you have?',
                    answer: ['React', 'Node.js']
                },
                education2: {
                    question: 'What is your highest level of education?',
                    answer: 'Bachelors'
                },
                experience3: {
                    question: 'How many years of experience do you have?',
                    answer: 5
                },
                skills3: {
                    question: 'What skills do you have?',
                    answer: ['React', 'Node.js']
                },
                education3: {
                    question: 'What is your highest level of education?',
                    answer: 'Bachelors'
                },
                cv: {
                    question: 'pdf',
                    answer: 'https://drive.google.com/file/d/15hoSZhWTqtVqFkLE9BIboZ8zVY68EoeN/preview'
                }
            }
        },
        '2': {
            id: '2',
            name: 'Jane Doe',
            ratings: {
                '1': {
                    id: '1',
                    rd: 100,
                    rating: 1500,
                    vol: 0.06
                },
                '2': {
                    id: '2',
                    rd: 100,
                    rating: 1500,
                    vol: 0.06
                }
            },
            data: {
                experience: {
                    question: 'How many years of experience do you have?',
                    answer: 3
                },
                skills: {
                    question: 'What skills do you have?',
                    answer: ['Vue', 'Express']
                }
            }
        }
    },
    vectors: {
        experience: {
            name: 'experience',
            question: 'Which candidate has more experience?'
        },
        skills: {
            name: 'skills',
            question: 'Which candidate has more skills?'
        },
        education: {
            name: 'education',
            question: 'Which candidate has a higher level of education?'
        }
    }
}

const Page = (props: Props) => {
    const { register, handleSubmit, watch } = useForm()

    return (
        <div className="flex h-screen w-full flex-row items-center justify-center gap-4 p-4">
            <Profile profile={comparison.candidates['1']} />
            <Profile profile={comparison.candidates['2']} />
            <div className="flex h-full w-72 flex-col bg-gray-100">
                <div className="border-b-2 border-b-gray-200 bg-gray-100 p-4 font-bold">
                    <h1 className="text-2xl font-bold">Comparison</h1>
                </div>
                <div className="flex flex-col gap-4 p-4">
                    {Object.entries(comparison.vectors).map(([key, vector]) => (
                        <div key={key} className="flex flex-col gap-4">
                            <h2 className="text-base font-bold">
                                {vector.question}
                            </h2>
                            <div className="flex flex-row gap-4">
                                <label
                                    className={clsx(
                                        'flex flex-1 cursor-pointer items-center justify-center rounded-md p-4',
                                        watch(`${key}-winner`) ===
                                            comparison.candidates['1'].id
                                            ? 'bg-green-400'
                                            : 'bg-gray-200'
                                    )}
                                >
                                    <input
                                        type="radio"
                                        className="hidden"
                                        value={comparison.candidates['1'].id}
                                        {...register(`${key}-winner`)}
                                    />
                                    {comparison.candidates['1'].name}
                                </label>
                                <label
                                    className={clsx(
                                        'flex flex-1 cursor-pointer items-center justify-center rounded-md p-4',
                                        watch(`${key}-winner`) ===
                                            comparison.candidates['2'].id
                                            ? 'bg-green-400'
                                            : 'bg-gray-200'
                                    )}
                                >
                                    <input
                                        type="radio"
                                        className="hidden"
                                        value={comparison.candidates['2'].id}
                                        {...register(`${key}-winner`)}
                                    />
                                    {comparison.candidates['2'].name}
                                </label>
                            </div>
                        </div>
                    ))}
                    <button
                        className="rounded-md bg-blue-500 p-4 text-white"
                        onClick={handleSubmit((data) => {
                            console.log(data)
                        })}
                    >
                        Finish
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Page

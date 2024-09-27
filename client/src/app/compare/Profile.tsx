import React from 'react'

interface Props {
    profile: Candidate
}

const Profile = ({ profile }: Props) => {
    return (
        <div className="flex h-full flex-1 flex-col bg-gray-100">
            <div className="border-b-2 border-b-gray-200 bg-gray-100 p-4 font-bold">
                <h1 className="text-2xl">{profile.name}</h1>
            </div>
            <div className="flex flex-1 flex-col gap-4 overflow-scroll p-4">
                {Object.entries(profile.data).map(([key, value]) => {
                    if (value.question === 'pdf') {
                        return (
                            <iframe
                                key={key}
                                src={value.answer}
                                className="min-h-96 flex-1"
                                allow="autoplay"
                            ></iframe>
                        )
                    }
                    return (
                        <div key={key}>
                            <h2 className="text-xl font-bold">
                                {value.question}
                            </h2>
                            {
                                // if the answer is a string, display it
                                ['string', 'number', 'boolean'].includes(
                                    typeof value.answer
                                ) ? (
                                    <p>{value.answer}</p>
                                ) : // if the answer is an array, display it as a list
                                Array.isArray(value.answer) ? (
                                    <ul>
                                        {value.answer.map((answer) => (
                                            <li
                                                key={answer}
                                                className="ml-4 list-disc"
                                            >
                                                {answer}
                                            </li>
                                        ))}
                                    </ul>
                                ) : null
                            }
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Profile

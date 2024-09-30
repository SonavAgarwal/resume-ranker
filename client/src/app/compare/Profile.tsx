import { Candidate } from '@/lib/types.alias'
import React from 'react'

interface Props {
    profile: Candidate
}

function parseDriveLink(link: string) {
    // turn https://drive.google.com/open?id=1aQ9Ms-PTctWmZ45U7Yl_eqVRr1q1hhsn
    // into https://drive.google.com/file/d/17SSFYZC9IN617Y11QeCgePpQcq1OmCl7/preview
    const id = link.split('id=')[1]
    return `https://drive.google.com/file/d/${id}/preview`
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
                                src={parseDriveLink(value.answer)}
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

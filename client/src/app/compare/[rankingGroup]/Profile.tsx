import { RankingGroupNames, rrConfig } from '@/lib/rrConfig.alias'
import { Candidate } from '@/lib/types.alias'
import React from 'react'
import Linkify from 'react-linkify'

interface Props {
    profile: Candidate
    prefix: string
    rankingGroup: RankingGroupNames
}

function parseDriveLink(link: string) {
    // turn https://drive.google.com/open?id=1aQ9Ms-PTctWmZ45U7Yl_eqVRr1q1hhsn
    // into https://drive.google.com/file/d/17SSFYZC9IN617Y11QeCgePpQcq1OmCl7/preview
    const id = link.split('id=')[1]
    return `https://drive.google.com/file/d/${id}/preview`
}

const Profile = ({ profile, prefix, rankingGroup }: Props) => {
    const fieldOrder = rrConfig.settings[rankingGroup].fieldOrder
    const fieldIndex: Record<string, number> = fieldOrder.reduce(
        (acc, field, i) => ({ ...acc, [field]: i }),
        {}
    )
    console.log(fieldIndex)

    function getFieldIndex(field: string) {
        const index = fieldIndex[field]
        return index === undefined ? 100000 : index
    }

    const fields = Object.keys(profile.data).sort(
        (a: string, b: string) => getFieldIndex(a) - getFieldIndex(b)
    )

    return (
        <div className="flex h-full flex-1 flex-col bg-gray-100">
            <div className="border-b-2 border-b-gray-200 bg-gray-100 p-4 font-bold">
                <h1 className="text-2xl">
                    {prefix}: {profile.name}
                </h1>
                <p className="text-sm text-gray-500">{profile.id}</p>
            </div>
            <div className="flex flex-1 flex-col gap-4 overflow-scroll p-4">
                {fields.map((key) => {
                    const value = profile.data[key]

                    if (!value.show) return null

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
                    if (!value.answer) return null
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
                                    <Linkify
                                        componentDecorator={(
                                            decoratedHref,
                                            decoratedText,
                                            key
                                        ) => (
                                            <a
                                                target="_blank"
                                                href={decoratedHref}
                                                key={key}
                                                className="text-blue-500 hover:underline"
                                            >
                                                {decoratedText}
                                            </a>
                                        )}
                                    >
                                        {value.answer}
                                    </Linkify>
                                ) : // if the answer is an array, display it as a list
                                Array.isArray(value.answer) ? (
                                    <ul>
                                        {value.answer.map((answer) => (
                                            <li
                                                key={answer}
                                                className="ml-4 list-disc"
                                            >
                                                <Linkify>{answer}</Linkify>
                                                {/* {answer} */}
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

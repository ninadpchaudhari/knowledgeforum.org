import React from 'react';

const History = props => {

    const [read, edit] = props.records.reduce(
        (acc, el) => {
            if (el.type === 'read') {
                acc[0].push(el)
            }else{
                acc[1].push(el)
            }
            return acc
        }, [[],[]])
    return (
        <div>
            <h5>Edit logs:</h5>
            <p className='mb-0'>{edit.length} edits</p>
            <ul>
                {edit.map((record) =>
                    <li key={record._id}>{record.date}: {record.author}</li>
                )}
            </ul>
            <h5>Read logs:</h5>
            <p className='mb-0'>{read.length} reads</p>
            <ul>
                {read.map((record) =>
                    <li key={record._id}>{record.date}: {record.author}</li>
                )}
            </ul>
        </div>
    )

}

export default History

import React, {useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Col, Row } from 'react-bootstrap'
import {addContribAuthor, removeContribAuthor, editNote} from '../../store/noteReducer.js'
import { addNotification } from '../../store/notifier.js'
import AuthorSelect from '../authorSelect/AuthorSelect'
import Select from 'react-select'

const AuthorTab = props => {
    const contribution = useSelector((state) => state.notes[props.contribId])
    const authors = useSelector((state) => contribution.authors.map((auth) => state.users[auth]))
    const communityAuthors = useSelector((state) => state.users)
    const groups = useSelector((state) => state.globals.community.groups)
    const group_options = groups.map((g) => ({value: g.title, label: g.title}))

    const [g, setG] = useState(contribution.group)
    const dispatch = useDispatch()
    const removeAuthor = (author, idx) => {
        if (idx === 0) {
            addNotification({title: 'Error!', type:'danger', message:'cannot remove the Primary Author'})
            return;
        }else if (idx >= 0) {
            dispatch(removeContribAuthor({contribId: props.contribId, author: author._id}))
        }
    }

    const addAuthor = (author) => {
        console.log(author)
        if (!contribution.authors.includes(author.value)){
            dispatch(addContribAuthor({contribId: props.contribId, author: author.value}))
        }
    }

    const selectGroup = (selected) => {
        setG(selected)
        dispatch(editNote({_id: contribution._id, group: selected}))
    }

    //TODO
    const isEditable = () => {
        return true
    }
    return (
                <div className="authorTab mt-2" style={{height: '100%'}}>
                    <Row>
                        <Col>
                            <h5>Authors:</h5>
                            <ul>
                                {
                                    authors.map((author, idx) => (

                                        <li key={author._id} style={{cursor: 'move'}}>
                                            {author.firstName} {author.lastName}
                                            <Button size='sm' className='ml-1'
                                                    onClick={() => removeAuthor(author, idx)}>x</Button>
                                        </li>

                                    ))
                                }
                            </ul>
                        </Col>
                        <Col>
                            <div>
                                <h5>Add author:</h5>
                                <AuthorSelect authors={communityAuthors} onAuthorSelected={addAuthor}/>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <h5>Group:</h5>
                            <div>
                                {
                                    isEditable()?
                                    <form method="" id="" action="">
                                        <Select value={g} options={group_options} onChange={selectGroup} isClearable={true}/>
                                    </form>
                                    :
                                    <div>{contribution.group.title}</div>
                                }
                            </div>
                        </Col>
                    </Row>
                </div>

    )
}

export default AuthorTab

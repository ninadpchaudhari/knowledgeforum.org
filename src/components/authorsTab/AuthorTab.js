import React from 'react';
import { useSelector } from 'react-redux';
import { Button, Col, Row } from 'react-bootstrap'
import { addNotification } from '../../store/notifier.js'
import AuthorSelect from '../authorSelect/AuthorSelect'
import Select from 'react-select'

const AuthorTab = props => {
    const authors = useSelector((state) => props.contrib.authors.map((auth) => state.users[auth]))
    const communityAuthors = useSelector((state) => state.users)
    const groups = useSelector((state) => state.globals.community.groups)
    const group_options = groups.map((g) => ({value: g._id, label: g.title}))
    const contribGroup = groups.find(group => group._id === props.contrib.group)
    const g = contribGroup ? {value: contribGroup._id, label: contribGroup.title} : {value: null, label: 'No Group selected'}


    const removeAuthor = (author, idx) => {
        if (idx === 0) {
            addNotification({title: 'Error!', type:'danger', message:'cannot remove the Primary Author'})
            return;
        }else if (idx >= 0) {
            props.onChange({authors: props.contrib.authors.filter(auth => auth !== author._id)})
        }
    }

    const addAuthor = (author) => {
        if (!props.contrib.authors.includes(author.value)){
            props.onChange({authors: [...props.contrib.authors, author.value]})
        }
    }

    const selectGroup = (selected) => {
        props.onChange({group: selected && selected.value})
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
                                    <div>{g.label}</div>
                                }
                            </div>
                        </Col>
                    </Row>
                </div>

    )
}

export default AuthorTab

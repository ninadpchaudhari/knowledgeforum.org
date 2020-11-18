import React, {useState} from 'react';
import {Button, Row, Col} from 'react-bootstrap'
import Select from 'react-select'
const AuthorSelect = props => {
    const select_options = Object.entries(props.authors).map(
        (auth) => { return {value: auth[1]._id, label: `${auth[1].firstName} ${auth[1].lastName}`} })

    const [selectedOption, setSelectedOption] = useState(null);
    const handleChange = selected => {
        setSelectedOption(selected)
    };

    return (
        <div>
            <Row>
                <Col>
                    <Select options={select_options} onChange={handleChange} isClearable={true}/>
                </Col>
                <Col md='auto'>
                    <Button disabled={!selectedOption}
                        onClick={() => props.onAuthorSelected(selectedOption)}>Add</Button>
                </Col>
            </Row>
            <p>{select_options.length} possible author(s) in this community.</p>
        </div>
    )
}

export default AuthorSelect

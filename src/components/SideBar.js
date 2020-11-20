import React from 'react';
import { DropdownButton, Dropdown, Col } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { newNote } from '../store/noteReducer.js'
import "./SideBar.css"

const SideBar = props => {
    const dispatch = useDispatch();
    return(
        <div className="row">
            <Col className="ml-0 pl-2" md="12" sm="2" xs="2">
                <DropdownButton className="circle-button" drop="right" variant="outline-info" title={<i className="fas fa-plus-circle"></i>}>

                    <Dropdown.Item onClick={() => dispatch(newNote(props.view, props.communityId, props.author._id))}>
                        New Note
                    </Dropdown.Item>

                    <Dropdown.Item onClick={() => console.log("new view")}>
                        new View
                    </Dropdown.Item>
                </DropdownButton>
            </Col>
        </div>
    )

}

export default SideBar;

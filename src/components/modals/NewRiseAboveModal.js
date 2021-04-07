import React, {useState} from 'react';
import { useDispatch } from 'react-redux';
import { Modal, Button, Row, Col, Form } from 'react-bootstrap';
import { newRiseAbove } from '../../store/async_actions.js'

const NewRiseAboveModal = props => {

    const [title, setTitle] = useState('')
    const dispatch = useDispatch();

    const createRiseAbove = () => {
        dispatch(newRiseAbove(title))
        props.handleClose()
    }


    return (
        <Modal show={props.show} onHide={props.handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>New RiseAbove</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col>
                        <Form.Group className="ra-title-form" controlId="ra-title">
                            <Form.Control type="text"
                                          size="sm"
                                          placeholder="Enter title"
                                          value={title}
                                          onChange={(val) => {setTitle(val.target.value)}}/>
                        </Form.Group>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={props.handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={createRiseAbove}>
                    Create
                </Button>
            </Modal.Footer>
        </Modal>
  );
}

export default NewRiseAboveModal;

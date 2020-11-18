import React from 'react';
import {Form, Container, Row, Col} from 'react-bootstrap';
import { connect } from 'react-redux'
import {fetchScaffolds} from '../../store/scaffoldReducer.js'
import scaffoldService from './scaffold.service'
import './scaffold.css'

class ScaffoldSelect extends React.Component {
    constructor(props) {
        super(props)
        this.state = {selected: props.initVal};
        this.onSelectChange = this.onSelectChange.bind(this);
    }


    componentDidMount() {
        if (!this.props.fetched){
            const {communityId, contextId} = this.props;
            this.props.fetchScaffolds(communityId, contextId);
        }
    }

    onSelectChange(event) {
        this.setState({selected: event.target.value});
    }

    scaffoldSelected = (scaffoldId, support) => {
        if (this.props.returnSupport){
            this.props.onScaffoldSelected(support)
            return
        }
        const scaffold = this.props.items[scaffoldId];
        let addhyphen = true;
        let initialText = '';
        const isTemplate = scaffold.data && scaffold.data.isTemplate
        if (isTemplate) {
            addhyphen = false;
            initialText = '<br><br>'
        }

        const scaffold_text = support._to.title
        const tagCreator = scaffoldService.newScaffoldTag(support.to, scaffold_text, isTemplate, addhyphen);
        this.props.onScaffoldSelected(tagCreator, initialText)
    }

    render() {
        const scaffolds = this.props.items;
        const options = scaffolds.map((scaffold, i) =>
            <option key={i} value={i}>{scaffold.title}</option>
        );
        let supports = '';
        if (scaffolds.length && scaffolds[this.state.selected].supports) {
            supports = scaffolds[this.state.selected].supports.map((support, i) =>
                <Col className="mt-1 p-0" key={i} md={12}>
                    <div className='KFSupportButton' size='sm' onClick={() => this.scaffoldSelected(this.state.selected, support) }>
                        {support._to.title}
                    </div>
                </Col>
            );
        }

        return (
            <Container>
                <Row>
                    <Col className='p-0'>
                        <Form>
                            <Form.Group className='mb-1' controlId="exampleForm.ControlSelect2">
                                <Form.Control size='sm' as="select" onChange={this.onSelectChange}>
                                    {options}
                                </Form.Control>
                            </Form.Group>
                        </Form>
                    </Col>
                </Row>
                <Row>
                    {supports}
                </Row>
            </Container>

        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        communityId: state.globals.communityId,
        contextId: state.globals.contextId,
        ...state.scaffolds
    }
}

const mapDispatchToProps = { fetchScaffolds }

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ScaffoldSelect)

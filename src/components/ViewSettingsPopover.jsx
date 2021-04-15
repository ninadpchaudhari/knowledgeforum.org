import React, { Component } from 'react'
import { OverlayTrigger, Popover, Button } from 'react-bootstrap';
import { Input } from 'reactstrap'
import { connect } from 'react-redux'

class ViewSettingsPopover extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currSettingsList: "viewSettingsTemp",
    }

    this.handleSettingsListChange = this.handleSettingsListChange.bind(this);
  }

  handleSettingsListChange(e){
    this.setState({currSettingsList: e.target.value});
  }

  render() {
    var popoverContent = null;
    if(this.state.currSettingsList === "viewSettingsTemp"){
      popoverContent = (
        <ul id="viewSettingsPopoverList">
          <li>Buildson <input type="checkbox" name="buildson" onChange={this.props.handleViewSettingsChange} checked={this.props.viewSettingsObj.buildson}></input></li>
          <li>Reference <input type="checkbox" name="references" onChange={this.props.handleViewSettingsChange} checked={this.props.viewSettingsObj.references}></input></li>
          <li>Group <input type="checkbox" name="showGroup" onChange={this.props.handleViewSettingsChange} checked={this.props.viewSettingsObj.showGroup}></input></li>
          <li>Author <input type="checkbox" name="showAuthor" onChange={this.props.handleViewSettingsChange} checked={this.props.viewSettingsObj.showAuthor}></input></li>
          <li>Date <input type="checkbox" name="showTime" onChange={this.props.handleViewSettingsChange} checked={this.props.viewSettingsObj.showTime}></input></li>
        </ul>
      );
    } else if(this.state.currSettingsList === "viewType"){
      popoverContent = (
        "pick view type"
      );
    } else if(this.state.currSettingsList === "commSettings"){
      popoverContent = (
        "manager community settings"
      );
    }

    return (
      <OverlayTrigger
          placement="auto"
          trigger="click"
          delay={{ show: 0, hide: 0 }}
          rootClose
          overlay={
            <Popover>
              {/* <Popover.Title>View Settings (Temporary)<a id="viewSettingsReset" onClick={this.props.initializeViewSettingsObj}><i className="fas fa-undo-alt"></i></a></Popover.Title>*/}
              <Popover.Title>
                    <Input type="select" onChange={this.handleSettingsListChange} defaultValue={this.state.currSettingsList}>
                        <option key="viewSettingsTemp" value="viewSettingsTemp">View Settings(Temporary)</option>
                        <option key="viewType" value="viewType">View Type</option>
                        {(this.props.author && this.props.author.role === "manager") ? (<option key="commSettings" value="commSettings">Community Settings</option>) : null}
                    </Input>
              </Popover.Title>
              <Popover.Content>
                {popoverContent}
              </Popover.Content>
            </Popover>
          }>
          <Button className="circle-button pad sidebar-btn">
              <i className="fas fa-cog"></i>
          </Button>
      </OverlayTrigger>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
    return {
        author: state.globals.author,
    }
}

export default connect(
  mapStateToProps,
  null
)(ViewSettingsPopover);

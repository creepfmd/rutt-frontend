// src/components/Objects/index.js
import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import {List, ListItem} from 'material-ui/List';
import Card from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import ActionExitToApp from 'material-ui/svg-icons/action/exit-to-app';
import Delete from 'material-ui/svg-icons/action/delete';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import { makeRequest, logout, styles } from '../util';

class Objects extends Component {
  static propTypes = {}
  static defaultProps = {}

  state = {
    objects: [],
    addObjectName: '',
    open: false,
    addErrorText : ''
  }

  componentDidMount () {
    this.getObjects();
  }

	getObjects = () => {
    let _this = this;
    makeRequest('GET', 'objects').then(data => {
      let response = JSON.parse(data);
      _this.setState({
        objects : response.objects,
      });
    })
    .catch(err => {
      window.location.href = `/login`
    });
  }

  goSystem = () => {
    window.location.href = `/systems`;
  }

  goUsers = () => {
    window.location.href = `/users`;
  }

  addObject = () => {
    let _this = this;
    if (this.state.addObjectName.trim().length > 0) {
      makeRequest('POST',
      'object/new',
      {objectId : this.state.addObjectName}).then( data => {
      let obj = _this.state.objects;
      obj.push(JSON.parse(data));
      _this.setState({ objects : obj });
      _this.setState({ addObjectName : '' });
      _this.setState({ addErrorText : '' });
    })
    .catch(err => {
      window.location.href = `/login`
    });
    } else {
      this.setState({ addErrorText : 'This field is required' });
    }
  }

  deleteObject = (event) => {
    this.setState({deleteId: event});
    this.setState({open: true});
  }

  changeObject = (event) => {
    window.location.href = `/object/${event}`;
  }

  changeObjectName = (event) => {
    this.setState({addObjectName : event.target.value})
  }

  handleCloseYes = () => {
    let _this = this;
    this.setState({open: false});
    makeRequest('DELETE',
      `object/${this.state.deleteId}`).then( data => {
        _this.getObjects();
    })
    .catch(err => {
      window.location.href = `/login`
    });
  }

  handleCloseNo = () => {
    this.setState({open: false})
  }

  render() {

    let objects = this.state.objects.length === 0 ? '' :
    this.state.objects.map((item, index) =>
      <ListItem key={item._id} primaryText={item.objectId}
        onClick={() => this.changeObject(item._id)}
        rightIconButton={<IconButton onClick={() => this.deleteObject(item._id)}><Delete /></IconButton>}>
      </ListItem>
    );

    return (
      <div>
        <AppBar
          title="Default Objects"
          style={styles.appBarStyle}
          iconElementRight={
            <IconMenu
              iconButtonElement={
              <IconButton><MoreVertIcon /></IconButton>
              }
              targetOrigin={{horizontal: 'right', vertical: 'top'}}
              anchorOrigin={{horizontal: 'right', vertical: 'top'}}
            >
            <MenuItem onClick={this.goSystem} primaryText="All Systems" />
            <MenuItem onClick={logout} primaryText="Logout" />
          </IconMenu>}
          iconElementLeft={<IconButton
            onClick={logout}>
            <ActionExitToApp />
          </IconButton>}
        />
        <Card style={styles.cardStyle}>
          <List>{objects}</List>

          <TextField
          onChange={this.changeObjectName}
          value={this.state.addObjectName}
          hintText="New object"
          errorText={this.state.addErrorText}
          fullWidth={true}
          />

          <FlatButton onClick={this.addObject} label="Add" />

        </Card>
        <Dialog
          title="Delete object"
          actions={[
            <FlatButton
              label="No"
              primary={true}
              onClick={this.handleCloseNo}
            />,
            <FlatButton
              label="Yes"
              primary={true}
              onClick={this.handleCloseYes}
            />,
          ]}
          modal={true}
          open={this.state.open}>
          Are you sure?
        </Dialog>
      </div>
    );
  }
}

export default Objects;

// src/components/Systems/index.js
import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import {List, ListItem} from 'material-ui/List';
import Card from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';
import ActionExitToApp from 'material-ui/svg-icons/action/exit-to-app';
import Delete from 'material-ui/svg-icons/action/delete';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

import { makeRequest, logout, styles } from '../util';

class Systems extends Component {
  static propTypes = {}
  static defaultProps = {
  }

  state = {
    systems: [],
    addSystemName: '',
    open: false,
    addSystemErrorText : '',
    userName : ''
  }

  componentDidMount () {
    this.getUser();
  }

	getSystems = () => {
    let _this = this;

    makeRequest('GET', 'systems/' + this.state.user._id).then(data => {
      let response = JSON.parse(data);
      _this.setState({
        systems : response.systems,
      });
      response.systems.forEach( (element) => {
        makeRequest('GET', 'redis/zcard/' + element.systemId).then(data => {
          let s = _this.state.systems;
          let d = JSON.parse(data);
          s.find(item => {return item.systemId === element.systemId}).zcard = d.zcard;
          _this.setState({
            systems : s,
          });
        })
        .catch(err => {
          if (err.status === 401)
          console.log('Error get redis zcard')
        })
      })
    })
    .catch(err => {
      if (err.status === 401)
        alert('Error in systems list')
    });
  }

	getUser = () => {
    let _this = this;
    makeRequest('GET', 'me').then(data => {
      let response = JSON.parse(data);
      _this.setState({
        user : response,
      });
      _this.setState({
        userName : response.name,
      });
      this.getSystems();
    })
    .catch(err => {
      if (err.status === 401)
        window.location.href = `/login`
    });
  }

  goObjects = () => {
    window.location.href = `/objects`;
  }

  goUsers = () => {
    if (this.state.userName === "admin")
      window.location.href = `/users`
    else
      window.location.href = `/user/${ this.state.user._id }`
  }

  addSystem = () => {
    let _this = this;
    //if (this.state.addSystemName.trim().length > 0) {
      makeRequest('POST',
        'system/new',
        { userId : this.state.user._id }).then( data => {
        let systems = _this.state.systems;
        systems.push(JSON.parse(data));
        _this.setState({systems : systems});
        _this.setState({addSystemName : ''});
        _this.setState({ addSystemErrorText : '' });
      })
      .catch(err => {
        if (err.status === 401)
          window.location.href = `/login`
      })
    /*} else {
      this.setState({ addSystemErrorText : 'This field is required' });
    }*/
  }

  deleteSystem = (event) => {
    this.setState({deleteId: event._id});
    this.setState({deleteSystemId: event.systemId});
    this.setState({open: true});
  }

  changeSystem = (event) => {
    window.location.href = `/system/${event}`;
  }

  changeSystemName = (event) => {
    this.setState({addSystemName : event.target.value})
  }

  handleCloseYes = () => {
    let _this = this;
    this.setState({open: false});
    makeRequest('DELETE',
      `system/${this.state.deleteId}`).then( data => {
        _this.getSystems();
    })
    .catch(err => {
      if (err.status === 401)
        window.location.href = `/login`
    });
  }

  handleCloseNo = () => {
    this.setState({open: false})
  }

  render() {

    let systems = this.state.systems.length === 0 ? '' :
    this.state.systems.map((item, index) =>
      <ListItem
        key={item._id}
        primaryText={item.systemName ? item.systemName : item.systemId}
        secondaryText={item.zcard ? item.systemId + ' [' + item.zcard + ']' : item.systemId}
        onClick={() => this.changeSystem(item.systemId)}
        rightIconButton={<IconButton onClick={() => this.deleteSystem(item)}><Delete /></IconButton>}>
      </ListItem>
    );

    return (
      <div>
        <AppBar
          style={styles.appBarStyle}
          title="All Systems"
          iconElementRight={
            <IconMenu
              iconButtonElement={
              <IconButton><MoreVertIcon /></IconButton>
              }
              targetOrigin={{horizontal: 'right', vertical: 'top'}}
              anchorOrigin={{horizontal: 'right', vertical: 'top'}}
            >
            <MenuItem onClick={this.goObjects} primaryText="Default Objects" />
            <MenuItem onClick={this.goUsers} primaryText={this.state.userName === "admin" ? "Users" : "Profile"} />
            <MenuItem onClick={logout} primaryText="Log out" />
          </IconMenu>}
          iconElementLeft={<IconButton
            onClick={logout}>
            <ActionExitToApp />
          </IconButton>}
        />
        <Card style={styles.cardStyle}>
          <List>{systems}</List>
          <FlatButton onClick={this.addSystem} label="Add SYSTEM" />
        </Card>
        <Dialog
          title={ 'Delete system ' + this.state.deleteSystemId }
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

export default Systems;

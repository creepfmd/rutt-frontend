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
import TextField from 'material-ui/TextField';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import md5 from 'md5';
import { makeRequest, logout, styles } from '../util';

class Users extends Component {
  static propTypes = {}
  static defaultProps = {
  }

  state = {
    users: [],
    user: null,
    addUserName: '',
    open: false,
    addUserErrorText : ''
  }

  componentDidMount () {
    this.getUser();
  }

	getUsers = () => {
    let _this = this;
    makeRequest('GET', 'users/').then(data => {
      let response = JSON.parse(data);
      _this.setState({
        users : response.users,
      });
    })
    .catch(err => {
      if (err.status === 401)
        window.location.href = `/login`
    });
  }

	getUser = () => {
    let _this = this;
    makeRequest('GET', 'me').then(data => {
      let response = JSON.parse(data);
      _this.setState({
        user : response,
      });
      if (response.name !== 'admin') {
        window.location.href = `/login`
      }
      this.getUsers();
    })
    .catch(err => {
      if (err.status === 401)
        window.location.href = `/login`
    });
  }

  goObjects = () => {
    window.location.href = `/objects`;
  }

  goSystems = () => {
    window.location.href = `/systems`;
  }

  addUser = () => {
    let _this = this;
    if (this.state.addUserName.trim().length > 0) {
      makeRequest('POST',
        'user/new',
        { name : this.state.addUserName, password: md5(this.state.addUserName) }).then( data => {
        let users = _this.state.users;
        users.push(JSON.parse(data));
        _this.setState({users : users});
        _this.setState({addUserName : ''});
        _this.setState({ addUserErrorText : '' });
      })
      .catch(err => {
        if (err.status === 401)
          window.location.href = `/login`
      })
    } else {
      this.setState({ addUserErrorText : 'This field is required' });
    }
  }

  deleteUser = (event) => {
    this.setState({deleteId: event._id});
    this.setState({open: true});
  }

  changeUser = (event) => {
    window.location.href = `/user/${event}`;
  }

  changeUserName = (event) => {
    this.setState({addUserName : event.target.value})
  }

  handleCloseYes = () => {
    let _this = this;
    this.setState({open: false});
    makeRequest('DELETE',
      `user/${this.state.deleteId}`).then( data => {
        _this.getUsers();
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

    let users = this.state.users.length === 0 ? '' :
    this.state.users.map((item, index) =>
      <ListItem
        key={index}
        primaryText={item.name}
        onClick={() => this.changeUser(item._id)}
        rightIconButton={<IconButton onClick={() => this.deleteUser(item)}><Delete /></IconButton>}>
      </ListItem>
    );

    return (
      <div>
        <AppBar
          style={styles.appBarStyle}
          title="Users"
          iconElementRight={
            <IconMenu
              iconButtonElement={
              <IconButton><MoreVertIcon /></IconButton>
              }
              targetOrigin={{horizontal: 'right', vertical: 'top'}}
              anchorOrigin={{horizontal: 'right', vertical: 'top'}}
            >
            <MenuItem onClick={this.goSystems} primaryText="All systems" />
            <MenuItem onClick={this.goObjects} primaryText="Default Objects" />
            <MenuItem onClick={logout} primaryText="Logout" />
          </IconMenu>}
          iconElementLeft={<IconButton
            onClick={logout}>
            <ActionExitToApp />
          </IconButton>}
        />
        <Card style={styles.cardStyle}>
          <List>{users}</List>
          <TextField
            onChange={this.changeUserName}
            value={this.state.addUserName}
            errorText={this.state.addUserErrorText}
            hintText="New user"
            fullWidth={true}
          />
          <FlatButton onClick={this.addUser} label="Add User" />
        </Card>
        <Dialog
          title={ 'Delete User ' }
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

export default Users;

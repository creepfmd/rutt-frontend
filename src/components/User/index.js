// src/components/System/index.js
import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import Card from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import LinearProgress from 'material-ui/LinearProgress';
import NavigationRefresh from 'material-ui/svg-icons/navigation/refresh';
import NavigationCheck from 'material-ui/svg-icons/navigation/check';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import { makeRequest, logout, styles } from '../util';

class ChangeUser extends Component {
  static propTypes = {}
  static defaultProps = {}

  constructor(props) {
    super(props);
    this.state = {
      _id : '',
      name : '',
      password : '',
      nameErrorText : '',
      passwordErrorText : '',
      showProgress : styles.reloadBarOff,
      wannaUpdate : false,
    };
  }

  componentDidMount () {
    this.getUser(this.props.params.userId);
  }

	getUser = (id) => {
    let _this = this;
    this.setState({ showProgress : styles.reloadBarOn });
    makeRequest('GET', 'user/' + id).then(data => {
      let s = JSON.parse(data);
      _this.setState({
          _id : s._id,
          userId : s.userId,
          name : s.name,
          password : s.password,
       });
       _this.setState({ showProgress : styles.reloadBarOff });
    })
    .catch(err => {
      _this.setState({ showProgress : styles.reloadBarOff });
      window.location.href = `/login`
    });
  }

  /* Params func */
  changeName = (event) => {
    this.setState({ name : event.target.value });
    this.setState({ wannaUpdate : true });
  }

  changePassword = (event) => {
    this.setState({ password : event.target.value });
    this.setState({ wannaUpdate : true });
  }

  goUsers = () => {
    if (this.state.name === 'admin')
      window.location.href = `/users`
    else
      window.location.href = `/systems`
  }

  applyJSON = () => {
    let _this = this;
    if (this.state.name.trim().length > 0 && this.state.password.trim().length > 0) {
      this.setState({ showProgress : styles.reloadBarOn });
      makeRequest('PUT',
      `user/${this.props.params.userId}`,
      {
        name : this.state.name,
        password : this.state.password
      }).then( data => {
        _this.getUser(_this.props.params.userId);
        _this.setState({ showProgress : styles.reloadBarOff });
        _this.setState({ wannaUpdate : false });
        _this.setState({ nameErrorText : '' });
        _this.setState({ passwordErrorText : '' });
      })
      .catch(err => {
        _this.setState({ showProgress : styles.reloadBarOff });
        window.location.href = `/login`
      })
    } else {
      this.setState({ nameErrorText : 'This field is required' });
      this.setState({ passwordErrorText : 'This field is required' });
    }
  }

  handleSelectObject = (event) => {
    this.setState({selectedObject : event.target.value});
  }

  linearProgress = () => {
    return this.state.showProgress ? `<LinearProgress mode="indeterminate" color"red"/>` : ''
  }

  render() {
    return (
        <div>
          <LinearProgress mode="indeterminate" color="red" style={this.state.showProgress}/>
          <AppBar
            style={styles.appBarStyle}
            title={this.state.name}
            iconElementRight={
            <IconMenu
              iconButtonElement={
              <IconButton><MoreVertIcon /></IconButton>
              }
              targetOrigin={{horizontal: 'right', vertical: 'top'}}
              anchorOrigin={{horizontal: 'right', vertical: 'top'}}
            >
            <MenuItem onClick={this.goUsers} primaryText="Back" />
            <MenuItem onClick={logout} primaryText="Log out" />
            </IconMenu>}
            iconElementLeft={<IconButton
              tooltip="Update"
              onClick={this.applyJSON}>
              {this.state.wannaUpdate ? <NavigationRefresh /> : <NavigationCheck />}
            </IconButton>}
          />
          <Card style={styles.cardStyle}>
              <TextField
                floatingLabelText="name"
                errorText={this.state.nameErrorText}
                onChange={this.changeName}
                value={this.state.name}
                fullWidth={true}
              />
              <TextField
                floatingLabelText="password"
                errorText={this.state.passwordErrorText}
                onChange={this.changePassword}
                value={this.state.password}
                type="password"
                fullWidth={true}
              />
            </Card>
          </div>
        );
  }
}

export default ChangeUser;

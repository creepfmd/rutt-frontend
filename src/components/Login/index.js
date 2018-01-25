// src/components/NotAuth/index.js
import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import Card from 'material-ui/Card';
import TextField from 'material-ui/TextField';

export default class Login extends Component {
  static propTypes = {}
  static defaultProps = {}
  state = {
    login: '',
    password: ''
  }

  login = () => {
    if (this.state.login.trim().length > 0 && this.state.password.trim().length > 0) {
      localStorage.setItem('nameSAO', this.state.login);
      localStorage.setItem('passwordSAO', this.state.password);
      window.location.href = `/`
    } else {
      this.setState({ loginErrorText : 'This field is required' });
      this.setState({ passwordErrorText : 'This field is required' });
    }
  }

  changeLogin = (event) => {
    this.setState({login : event.target.value})
  }

  changePassword = (event) => {
    this.setState({password : event.target.value})
  }

  render() {

    let cardStyle = { padding: '20px',
      width: '400px',
      margin: '0 auto',
      top: '35vh',
      position: 'relative'
    };

    return (
      <div>
        <Card style={cardStyle}>

        <TextField
          onChange={this.changeLogin}
          floatingLabelText="Login"
          hintText="Login"
          value={this.state.login}
          errorText={this.state.loginErrorText}
          fullWidth={true}
        />

        <TextField
          onChange={this.changePassword}
          floatingLabelText="Password"
          hintText="Password"
          type="password"
          value={this.state.password}
          errorText={this.state.passwordErrorText}
          fullWidth={true}
          onKeyPress={event => {
                if (event.key === 'Enter') {
                  this.login()
                }
          }}
        />

        <FlatButton onClick={this.login} label="Login" style={{ left: '140px'}} />

      </Card>
    </div>
    );
  }
}

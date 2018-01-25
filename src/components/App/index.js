// src/components/App/index.js
import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import LinearProgress from 'material-ui/LinearProgress';
import { makeRequest, styles } from '../util';

class App extends Component {

  componentWillMount () {
    this.getUser();
  }

	getUser = () => {
    makeRequest('GET', 'me').then(data => {
      window.location.href = `/systems`
    })
    .catch(err => {
      window.location.href = `/login`
    })
  }

  render() {
    return (
      <div>
        <LinearProgress mode="indeterminate" color="red" style={styles.reloadBarOn}/>
        <AppBar
          title="Loading"
        />
      </div>
    );
  }
}

export default App;

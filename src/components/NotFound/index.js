// src/components/NotFound/index.js
import React, { Component } from 'react';

export default class NotFound extends Component {
  static propTypes = {}
  static defaultProps = {}
  state = {}

  render() {
    return (
      <div>
        <h1>
          404 <small>Page not Found :(</small>
        </h1>
      </div>
    );
  }
}

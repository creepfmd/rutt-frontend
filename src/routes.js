// src/routes.js
import React from 'react';
import { Router, Route } from 'react-router'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import App from './components/App';
import ChangeObject from './components/Object';
import Objects from './components/Objects';
import ChangeSystem from './components/System';
import NotFound from './components/NotFound';
import Login from './components/Login';
import Systems from './components/Systems';
import Users from './components/Users';
import ChangeUser from './components/User';
import ChangeDestination from './components/Destination';

const Routes = (props) => (
  <MuiThemeProvider>
    <Router {...props}>
      <Route path="/" component={App} />
      <Route path="/objects" component={Objects} />
      <Route path="/systems" component={Systems} />
      <Route path="/object/:objectId" component={ChangeObject} />
      <Route path="/object/:objectId/destination/:destinationId" component={ChangeDestination} />
      <Route path="/system/:systemId" component={ChangeSystem} />
      <Route path="/system/:systemId/object/:objectId" component={ChangeObject} />
      <Route path="/system/:systemId/object/:objectId/destination/:destinationId" component={ChangeDestination} />
      <Route path="/users" component={Users} />
      <Route path="/user/:userId" component={ChangeUser} />
      <Route path="/login" component={Login} />
      <Route path="*" component={NotFound} />
    </Router>
  </MuiThemeProvider>
);

export default Routes;

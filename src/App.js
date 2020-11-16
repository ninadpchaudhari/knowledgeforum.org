import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import ReactNotification from 'react-notifications-component';
import Login from './Login';
import Dashboard from './Dashboard';
import Graph from './Graph';

import 'react-notifications-component/dist/theme.css'
function App() {
  return (
    <div>
      <ReactNotification />
      <Router>
        <Switch>
          <Route exact path="/" component={Login}></Route>
          <Route exact path="/dashboard" component={Dashboard}></Route>
          <Route exact path="/graph" component={Graph}></Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;

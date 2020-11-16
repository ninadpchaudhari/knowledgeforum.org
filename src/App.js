import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import Graph from './Graph';

function App() {
  return (
    <div>
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

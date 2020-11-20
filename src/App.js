import React, { useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import ReactNotification from 'react-notifications-component';
import Login from './Login';
import Dashboard from './Dashboard';
import View from './components/View.js'
import { setToken } from './store/api.js';
import { useDispatch } from 'react-redux';
import { fetchLoggedUser } from './store/globalsReducer.js'

import 'react-notifications-component/dist/theme.css'
function App() {

    const dispatch = useDispatch();
    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (token) {
            setToken(token)
            dispatch(fetchLoggedUser())
        }
    })
  return (
    <div>
      <ReactNotification />
      <Router>
        <Switch>
          <Route exact path="/" component={Login}></Route>
          <Route exact path="/dashboard" component={Dashboard}></Route>
          <Route exact path="/graph" component={View}></Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;

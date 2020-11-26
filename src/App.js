import React, { useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import ReactNotification from 'react-notifications-component';
import Login from './Login';
import Dashboard from './Dashboard';
import View from './components/View.js'
import { useDispatch } from 'react-redux';
import { setGlobalToken, setCurrentServer, fetchLoggedUser } from './store/globalsReducer.js'
import { getLoginData } from './helper/Login_helper.js'
import 'react-notifications-component/dist/theme.css'
function App() {

    const dispatch = useDispatch();
    useEffect(() => {
        const [server, token, ] = getLoginData();
        if (token) {
            dispatch(setGlobalToken(token))
            dispatch(setCurrentServer(server))
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
          <Route exact path="/view/:viewId" component={View}></Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;

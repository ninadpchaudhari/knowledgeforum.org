import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ReactNotification from 'react-notifications-component';
import Login from './components/Login/Login.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import View from './components/CommunityView/View.js'
import { setGlobalToken, setCurrentServer, fetchLoggedUser } from './store/globalsReducer.js'
import { setToken, setServer } from './store/api.js'
import { getLoginData } from './components/Login/Login_helper.js'
import ProtectedRoute from './ProtectedRoute.jsx'
import 'react-notifications-component/dist/theme.css'
function App() {

    const dispatch = useDispatch();
    //Check if user loged in, if logged in set token,server and user info in store
    const [server, token, ] = getLoginData();
    if (token) {
        setToken(token);
        setServer(server);
        dispatch(setGlobalToken(token))
        dispatch(setCurrentServer(server))
        dispatch(fetchLoggedUser())
    }

    return (
        <div id="sub-root">
            <ReactNotification />
            <Router>
                <Switch>
                    <Route exact path="/" component={Login}/>
                    <ProtectedRoute exact path="/dashboard" component={Dashboard}></ProtectedRoute>
                    <ProtectedRoute path="/view/:viewId" component={View}></ProtectedRoute>
                    <ProtectedRoute component={Dashboard}></ProtectedRoute>
                </Switch>
            </Router>
        </div>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ReactNotification from 'react-notifications-component';
import Login from './Login';
import Dashboard from './Dashboard';
import View from './components/View.js'
import { setGlobalToken, setCurrentServer, fetchLoggedUser } from './store/globalsReducer.js'
import { getLoginData } from './helper/Login_helper.js'
import ProtectedRoute from './ProtectedRoute.jsx'
import SignUpForm from './SignUpForm';
import 'react-notifications-component/dist/theme.css'
function App() {

    const dispatch = useDispatch();
    //Check if user loged in, if logged in set token,server and user info in store
    const [server, token, ] = getLoginData();
    if (token) {
        dispatch(setGlobalToken(token))
        dispatch(setCurrentServer(server))
        dispatch(fetchLoggedUser())
    }

    return (
        <div>
            <ReactNotification />
            <Router>
                <Switch>
                    <Route exact path="/" component={Login}/>
                    <Route exact path="/signup" component={SignUpForm}></Route>
                    <ProtectedRoute exact path="/dashboard" component={Dashboard}></ProtectedRoute>
                    <ProtectedRoute path="/view/:viewId" component={View}></ProtectedRoute>
                </Switch>
            </Router>
        </div>
  );
}

export default App;

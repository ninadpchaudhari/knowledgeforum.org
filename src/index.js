import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'react-redux';
import store from './store/store';
/* ReactDOM.render(<App />, document.getElementById('root')); */

import 'bootstrap/dist/css/bootstrap.min.css';
ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);

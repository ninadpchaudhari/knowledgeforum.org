import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import { Provider } from 'react-redux';
import store from './store/store';
import WebSocketProvider from './WebSocket.js'

ReactDOM.render(
    <Provider store={store}>
        <WebSocketProvider>
            <App />
        </WebSocketProvider>
    </Provider>,
    document.getElementById('root')
);

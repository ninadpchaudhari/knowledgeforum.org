
import React, { createContext } from  'react';
import io from 'socket.io-client';
import { WS_BASE } from './config.js'
import { useDispatch } from 'react-redux';
import {setSocketStatus } from './store/globalsReducer.js'
import { addViewLink, removeViewLink } from './store/noteReducer.js'
const WebSocketContext = createContext(null)

export { WebSocketContext }

export default (({ children }) => {
    let socket;
    let ws;

    const dispatch = useDispatch();

    const emit = (model, message) => {
        socket.emit(model, message);
    }


    const syncUpdates = (modelName) => {
        /**
         * Syncs item creation/updates on 'model:save'
         */
        socket.on(modelName + ':save', (item) => {
            if (modelName === 'link' && item.type === 'contains' && item._to.status === 'active'){
                dispatch(addViewLink(item));
            }
        });

        /**
         * Syncs removed items on 'model:remove'
         */
        socket.on(modelName + ':remove', function(item) {
            if (modelName === 'link' && item._to.status === 'active'){
                dispatch(removeViewLink(item));
            }
        });
    };

    const subscribeToView = (viewId) => {
        socket.emit('subscribe', `linkfrom:${viewId}`);
        socket.emit('subscribe', `noteCount:${viewId}`);
    }
    /**
     * Removes listeners for a models updates on the socket
     *
     * @param modelName
     */
    const unsyncUpdates  = (modelName) => {
        socket.removeAllListeners(modelName + ':save');
        socket.removeAllListeners(modelName + ':remove');
    }

    if (!socket){
        socket = io.connect(
            'http://localhost:9000',
            {path: WS_BASE,
             log: true,
             "close timeout": 60
           , "heartbeat timeout": 60
           , "heartbeat interval": 20
        });
        socket.on('connect', ()=>{
            dispatch(setSocketStatus(true));
        });
        socket.on('error', function (data) {
            console.log(data || 'error');
            dispatch(setSocketStatus(false));
        });

        socket.on('connect_failed', function (data) {
            console.log(data || 'connect_failed');
            dispatch(setSocketStatus(false));
        });
        ws = {
            socket: socket,
            emit: emit,
            unsyncUpdates: unsyncUpdates,
            syncUpdates: syncUpdates,
            subscribeToView: subscribeToView
        }
    }

    return (
        <WebSocketContext.Provider value={ws}>
            {children}
        </WebSocketContext.Provider>
    )

})

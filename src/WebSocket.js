
import React, { createContext } from  'react';
import io from 'socket.io-client';
import { WS_BASE } from './config.js'
import { useDispatch } from 'react-redux';
import {setSocketStatus } from './store/globalsReducer.js'
import { removeViewLink, removeViewNote } from './store/noteReducer.js'
import { onViewLink } from './store/async_actions'
import { url } from './store/api.js'
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
                dispatch(onViewLink(item));
            }
        });

        /**
         * Syncs removed items on 'model:remove'
         */
        socket.on(modelName + ':remove', function(item) {
            if (modelName === 'link' && item._to.status === 'active'){
                dispatch(removeViewLink(item));
                dispatch(removeViewNote({'_id': item.to}))
            }
        });
    };

    const subscribeToView = (viewId) => {
        socket.emit('subscribe', `linkfrom:${viewId}`);
        socket.emit('subscribe', `noteCount:${viewId}`);
    }

    const unsubscribeToView = (viewId) => {
        socket.emit('unsubscribe', `linkfrom:${viewId}`);
        socket.emit('unsubscribe', `noteCount:${viewId}`);
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

    const openConnection = (subscribe, sync) => {
        if (!socket){
            socket = io.connect(
                url,
                {path: WS_BASE,
                 log: true,
                 "close timeout": 60
                 , "heartbeat timeout": 60
                 , "heartbeat interval": 20
                });
            socket.on('connect', ()=>{
                dispatch(setSocketStatus(true));
                if (subscribe){
                    subscribeToView(subscribe)
                }
                if (sync){
                    syncUpdates(sync)
                }
            });
            socket.on('error', function (data) {
                console.log(data || 'error');
                socket = null;
                dispatch(setSocketStatus(false));
            });

            socket.on('connect_failed', function (data) {
                console.log(data || 'connect_failed');
                socket = null;
                dispatch(setSocketStatus(false));
            });

            socket.on('disconnect', function(data){
                socket = null;
                dispatch(setSocketStatus(false));
            })

        }else{
            if (subscribe){
                subscribeToView(subscribe)
            }
            if (sync){
                syncUpdates(sync)
            }
        }
    }

    const disconnect = () => {
        if (socket)
            socket.disconnect();
    }

    ws = {
        socket: socket,
        openConnection: openConnection,
        emit: emit,
        unsyncUpdates: unsyncUpdates,
        syncUpdates: syncUpdates,
        subscribeToView: subscribeToView,
        unsubscribeToView: unsubscribeToView,
        disconnect: disconnect
    }

    return (
        <WebSocketContext.Provider value={ws}>
            {children}
        </WebSocketContext.Provider>
    )

})

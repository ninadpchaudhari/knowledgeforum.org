import { store } from 'react-notifications-component';

const notifConfig = {
    type: "success",
    insert: "top",
    container: "top-right",
    animationIn: ["animated", "fadeIn"],
    animationOut: ["animated", "fadeOut"],
    dismiss: {
        duration: 5000,
        // onScreen: true
    },
}
export const addNotification = ( notif ) => {
    return store.addNotification({...notifConfig, ...notif});
}

export const removeNotification = (notifId) => {
    store.removeNotification(notifId)
}

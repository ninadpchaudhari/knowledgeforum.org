import { configureStore } from '@reduxjs/toolkit';
import { globalsReducer } from './globalsReducer.js'
import { dialogReducer } from './dialogReducer.js'
import { noteReducer } from './noteReducer.js'
import { scaffoldReducer } from './scaffoldReducer.js'
import { userReducer } from './userReducer.js'

export default configureStore({
  reducer: {
      dialogs: dialogReducer,
      notes: noteReducer,
      scaffolds: scaffoldReducer,
      globals: globalsReducer,
      users: userReducer
  },
    devTools: true
});

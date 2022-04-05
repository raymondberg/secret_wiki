import { configureStore } from '@reduxjs/toolkit'
import userReducer from './shared/userSlice'


export default configureStore({
    reducer: {
      users: userReducer,
    },
})

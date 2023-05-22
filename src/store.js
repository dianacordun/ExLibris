import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/user/userSlice';
import profileReducer from './features/user/profileSlice';
import profileDetailsReducer from './features/user/profileDetailsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    profile: profileReducer,
    profileDetails: profileDetailsReducer,
  },
})
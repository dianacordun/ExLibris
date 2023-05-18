import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: !!localStorage.getItem('profileExists'),
}

const profileSlice = createSlice({
  name: 'profile',
  initialState: initialState, 
  reducers: {
    setExistingProfile: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setExistingProfile } = profileSlice.actions;
export default profileSlice.reducer;
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    value: {
      firstName: '',
      lastName: '',
    },
  };

export const profileDetails = createSlice({
  name: 'profileDetails',
  initialState,
  reducers: {
    setProfileDetails: (state, action) => {
        state.value = action.payload 
    },
  },
})

// Action creators are generated for each case reducer function
export const { setProfileDetails } = profileDetails.actions
export default profileDetails.reducer
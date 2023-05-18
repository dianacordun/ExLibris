import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: JSON.parse(localStorage.getItem('user')),
}

export const user = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
        state.value = action.payload 
    },
  },
})

// Action creators are generated for each case reducer function
export const { setUser } = user.actions
export default user.reducer
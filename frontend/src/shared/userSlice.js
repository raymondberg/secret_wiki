import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice({
  name: 'users',
  initialState: {
    value: [],
  },
  reducers: {
    updateUsers: (state, usersMessage) => {
      state.value = usersMessage.payload
    },
  },
})

export const { updateUsers } = userSlice.actions

export default userSlice.reducer

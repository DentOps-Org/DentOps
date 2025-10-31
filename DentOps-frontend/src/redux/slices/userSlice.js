import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "users",
  initialState: { list: [] },
  reducers: {},
});

export default userSlice.reducer;

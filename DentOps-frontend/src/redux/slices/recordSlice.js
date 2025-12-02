import { createSlice } from "@reduxjs/toolkit";

const recordSlice = createSlice({
  name: "users",
  initialState: { list: [] },
  reducers: {},
});

export default recordSlice.reducer;

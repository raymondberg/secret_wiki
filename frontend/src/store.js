import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./shared/userSlice";
import wikiReducer from "./shared/wikiSlice";

export default configureStore({
  reducer: {
    users: userReducer,
    wiki: wikiReducer,
  },
});

import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./reducers/authReducer";
import sidebarReducer from "./reducers/sidebarReducer";
import notificationReducer from "./reducers/notificationReducer";
import contractReducer from "./reducers/contractReducer";

const rootReducer = combineReducers({
  auth: authReducer,
  sidebar: sidebarReducer,
  notifications: notificationReducer,
  contract: contractReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Only persist the auth state
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
      immutableCheck: false,
    }),
});

export const persistor = persistStore(store);

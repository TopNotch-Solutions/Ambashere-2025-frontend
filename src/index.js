import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./store/store";
import { preloadImages, preloadImagesForApp } from "./utils/preloadImages";
import { PUBLIC_IMAGES } from "./constants/appImages";

const root = ReactDOM.createRoot(document.getElementById("root"));

preloadImages(PUBLIC_IMAGES, { highPriority: true });

if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
  window.addEventListener("load", () => {
    const swUrl = `${process.env.PUBLIC_URL || ""}/sw.js`;
    navigator.serviceWorker.register(swUrl).catch(() => {});
  });
}

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter basename={process.env.REACT_APP_BASENAME}>
          <App />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

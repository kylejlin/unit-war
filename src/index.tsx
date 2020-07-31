import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { makeUtilsAccessibleForDebug } from "./debugUtils/makeUtilsAccessibleForDebug";
import "./index.css";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

makeUtilsAccessibleForDebug();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

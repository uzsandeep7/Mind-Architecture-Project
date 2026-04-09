import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ContrastModeProvider } from "./contexts/ContrastModeContext";
import { ReadAloudProvider } from "./contexts/ReadAloudContext";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element with id 'root' not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ContrastModeProvider>
      <ReadAloudProvider>
        <App />
      </ReadAloudProvider>
    </ContrastModeProvider>
  </React.StrictMode>
);

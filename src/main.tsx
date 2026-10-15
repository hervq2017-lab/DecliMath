import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { initRemoteSession } from "./lib/authRemote";
import { supabaseReady } from "./lib/supabase";
import "./styles.css";

// Avec Supabase, on reprend la session avant d'afficher l'écran (évite un éclair de page de connexion). Délai maximal : 4 s.
const ready = supabaseReady
  ? Promise.race([initRemoteSession().catch(() => undefined), new Promise((r) => setTimeout(r, 4000))])
  : Promise.resolve();

ready.then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  );
});

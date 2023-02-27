import React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./user-interface/app";


const root: ReactDOM.Root = ReactDOM.createRoot(
    document.getElementById("root")
);

root.render(<App />);
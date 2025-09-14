// Custom Calling of Sheets

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { ExcelDataProvider } from "./context/ExcelDataContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Load only Students + Holidays sheets */}
    <ExcelDataProvider sheetsToLoad={["Students", "Holidays", "Events", "Notices"]}>
      <App />
    </ExcelDataProvider>
  </React.StrictMode>
);





// Full Calling of Sheets

// // src/main.jsx
// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App.jsx";
// import 'bootstrap/dist/css/bootstrap.min.css';
// // import "./index.css";
// import { ExcelDataProvider } from "./context/ExcelDataContext";

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <ExcelDataProvider>
//       <App />
//     </ExcelDataProvider>
//   </React.StrictMode>
// );




// Normal

// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// // import './index.css'
// import 'bootstrap/dist/css/bootstrap.min.css';
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

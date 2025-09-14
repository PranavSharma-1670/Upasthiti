// src/components/layout/Content.jsx
import React from "react";
import Dashboard from "../pages/Dashboard";
import AddEventsAndNotices from "../pages/Add Events And Notices";
import AddStudent from "../pages/Add Student";
import AddTeacher from "../pages/Add Teacher";
import ModifyClassRecords from "../pages/Modify Class Records";
import ModifyAttendance from "../pages/Modify Attendance";
import CheckLogs from "../pages/Check Logs";
import CheckDataStorage from "../pages/Check DataStorage";
import ProcessAttendance from "../pages/Process Attendance";

const Content = ({ currentPage }) => {
  switch (currentPage) {
    case "Dashboard":
      return <Dashboard />;
    case "Add Events And Notices":
      return <AddEventsAndNotices />;
    case "Add Student":
      return <AddStudent />;
    case "Add Teacher":
      return <AddTeacher />;
    case "Modify Class Records":
      return <ModifyClassRecords />;
    case "Modify Attendance":
      return <ModifyAttendance />;
    case "Check Logs":
      return <CheckLogs />;
    case "Check DataStorage":
      return <CheckDataStorage />;
    case "Process Attendance":
      return <ProcessAttendance />;
    default:
      return <Dashboard />;
  }
};

export default Content;



// import Dashboard from "../pages/Dashboard";
// import Users from "../pages/Users";
// import Settings from "../pages/Settings";
// import Reports from "../pages/Reports";

// const Content = ({ currentPage }) => {
//   switch (currentPage) {
//     case "Dashboard":
//       return <Dashboard />;
//     case "Users":
//       return <Users />;
//     case "Settings":
//       return <Settings />;
//     case "Reports":
//       return <Reports />;
//     default:
//       return <Dashboard />;
//   }
// };

// export default Content;



// const Content = () => {
//     return (
//       <div className="p-4">
//         <h2 className="fw-semibold mb-3">Main Content Area</h2>
//         <p className="text-muted">
//           This is where the main content of the application will be displayed.
//         </p>
//       </div>
//     );
//   };
  
//   export default Content;
  
import "./Sidebar.css";
// import { X, Speedometer, People, Gear, FileText } from "react-bootstrap-icons";
import {X, Speedometer2, CalendarCheck, PersonPlus, Person, Pencil, Check2Square, FileText, Database, ClipboardCheck,} from "react-bootstrap-icons";

const Sidebar = ({ isOpen, toggleSidebar, currentPage, setCurrentPage }) => {
  // const menuItems = [
  //   { name: "Dashboard", icon: <Speedometer /> },
  //   { name: "Users", icon: <People /> },
  //   { name: "Settings", icon: <Gear /> },
  //   { name: "Reports", icon: <FileText /> },
  // ];
  const menuItems = [
    { name: "Dashboard", icon: <Speedometer2 /> },
    { name: "Add Events And Notices", icon: <CalendarCheck /> },
    { name: "Add Student", icon: <PersonPlus /> },
    { name: "Add Teacher", icon: <Person /> },
    { name: "Modify Class Records", icon: <Pencil /> },
    { name: "Modify Attendance", icon: <Check2Square /> },
    { name: "Check Logs", icon: <FileText /> },
    { name: "Check DataStorage", icon: <Database /> },
    { name: "Process Attendance", icon: <ClipboardCheck /> },
  ];

  return (
    <div className={`sidebar bg-dark text-white p-3 ${isOpen ? "open" : "closed"}`}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">{isOpen ? "Menu" : ""}</h5>
        {isOpen && (
          <button className="btn btn-sm btn-outline-light" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        )}
      </div>

      <ul className="nav flex-column">
        {menuItems.map((item, index) => (
          <li key={index} className="nav-item mb-2">
            <button
              onClick={() => setCurrentPage(item.name)}
              className={`nav-link btn btn-link text-start p-0 text-white ${
                currentPage === item.name ? "fw-bold text-primary" : ""
              }`}
            >
              {isOpen ? (
                <>
                  {item.icon} <span className="ms-2">{item.name}</span>
                </>
              ) : (
                item.icon
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;



// import "./Sidebar.css";
// import { X } from "react-bootstrap-icons";

// const Sidebar = ({ isOpen, toggleSidebar, setCurrentPage }) => {
//   const menuItems = [
//     { name: "Dashboard", link: "#" },
//     { name: "Users", link: "#" },
//     { name: "Settings", link: "#" },
//     { name: "Reports", link: "#" },
//   ];

//   return (
//     <div className={`sidebar bg-dark text-white p-3 ${isOpen ? "open" : "closed"}`}>
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h5 className="mb-0">{isOpen ? "Menu" : ""}</h5>
//         {isOpen && (
//           <button className="btn btn-sm btn-outline-light" onClick={toggleSidebar}>
//             <X size={20} />
//           </button>
//         )}
//       </div>

//       <ul className="nav flex-column">
//         {menuItems.map((item, index) => (
//           <li key={index} className="nav-item mb-2">
//             <button
//               onClick={() => setCurrentPage(item.name)}
//               className="nav-link btn btn-link text-white text-start p-0"
//             >
//               {isOpen ? item.name : "•"}
//             </button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Sidebar;


// import "./Sidebar.css";
// import { X } from "react-bootstrap-icons";

// const Sidebar = ({ isOpen, toggleSidebar }) => {
//   const menuItems = [
//     { name: "Dashboard", link: "#" },
//     { name: "Users", link: "#" },
//     { name: "Settings", link: "#" },
//     { name: "Reports", link: "#" },
//   ];

//   return (
//     <div className={`sidebar bg-dark text-white p-3 ${isOpen ? "open" : "closed"}`}>
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h5 className="mb-0">{isOpen ? "Menu" : ""}</h5>

//         {/* Close button only when open */}
//         {isOpen && (
//           <button className="btn btn-sm btn-outline-light" onClick={toggleSidebar}>
//             <X size={20} />
//           </button>
//         )}
//       </div>

//       <ul className="nav flex-column">
//         {menuItems.map((item, index) => (
//           <li key={index} className="nav-item mb-2">
//             <a href={item.link} className="nav-link text-white">
//               {isOpen ? item.name : "•"} {/* show text when open, dot when collapsed */}
//             </a>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Sidebar;
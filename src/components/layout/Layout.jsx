import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Content from "./Content";

const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState("Dashboard");

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="d-flex flex-column vh-100">
      <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="d-flex flex-grow-1">
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          currentPage={currentPage}  // pass current page
          setCurrentPage={setCurrentPage}
        />
        <main className="flex-grow-1 p-4">
          <Content currentPage={currentPage} />
        </main>
      </div>
    </div>
  );
};

export default Layout;



// import { useState } from "react";
// import Sidebar from "./Sidebar";
// import Navbar from "./Navbar";
// import Dashboard from "../pages/Dashboard";
// import Users from "../pages/Users";
// import Settings from "../pages/Settings";
// import Reports from "../pages/Reports";

// const Layout = () => {
//   const [isSidebarOpen, setSidebarOpen] = useState(true);
//   const [currentPage, setCurrentPage] = useState("Dashboard"); // track current page

//   const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

//   const renderContent = () => {
//     switch (currentPage) {
//       case "Dashboard":
//         return <Dashboard />;
//       case "Users":
//         return <Users />;
//       case "Settings":
//         return <Settings />;
//       case "Reports":
//         return <Reports />;
//       default:
//         return <Dashboard />;
//     }
//   };

//   return (
//     <div className="d-flex flex-column vh-100">
//       <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
//       <div className="d-flex flex-grow-1">
//         <Sidebar
//           isOpen={isSidebarOpen}
//           toggleSidebar={toggleSidebar}
//           setCurrentPage={setCurrentPage} // pass to Sidebar
//         />
//         <main className="flex-grow-1 p-4">{renderContent()}</main>
//       </div>
//     </div>
//   );
// };

// export default Layout;



// // import { useState } from "react";
// // import Sidebar from "./Sidebar";
// // import Navbar from "./Navbar";

// // const Layout = () => {
// //   const [isSidebarOpen, setSidebarOpen] = useState(true);

// //   const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

// //   return (
// //     <div className="d-flex flex-column vh-100">
// //       {/* Navbar */}
// //       <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

// //       <div className="d-flex flex-grow-1">
// //         {/* Sidebar */}
// //         <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

// //         {/* Main Content */}
// //         <main className="flex-grow-1 p-4">
// //           <h1>Dashboard Content</h1>
// //           <p>This is the main content area.</p>
// //         </main>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Layout;
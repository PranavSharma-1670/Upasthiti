const Navbar = ({ isSidebarOpen, toggleSidebar }) => {
    return (
        // <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm px-3">z
       <nav className="navbar navbar-dark bg-dark px-3">
        {/* <div className="d-flex align-items-center"> */}
          {!isSidebarOpen && (
            <button className="btn btn-outline-light me-2" onClick={toggleSidebar}>
              ☰
            </button>
          )}
          <span className="navbar-brand mb-0 h1">My App</span>
          <a className="navbar-brand fw-bold" href="#">
           Navbar
           </a>
           <div className="ms-auto">
            <button className="btn btn-primary me-2">Login</button>
            <button className="btn btn-outline-secondary">Signup</button>
            </div>
            {/* </div> */}
       </nav>
    );
  };
  
  export default Navbar;
    

// const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
//     return (
//       <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm px-3">
//         {/* Show toggle button only when sidebar is closed (on mobile) */}
//         {!isSidebarOpen && (
//           <button
//             className="btn btn-outline-primary me-3 d-md-none"
//             onClick={toggleSidebar}
//           >
//             ☰
//           </button>
//         )}
  
//         <a className="navbar-brand fw-bold" href="#">
//           Navbar
//         </a>
  
//         <div className="ms-auto">
//           <button className="btn btn-primary me-2">Login</button>
//           <button className="btn btn-outline-secondary">Signup</button>
//         </div>
//       </nav>
//     );
//   };
  
//   export default Navbar;
  
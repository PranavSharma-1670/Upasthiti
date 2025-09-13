import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Settings from "../pages/Settings";
import Reports from "../pages/Reports";

const Content = ({ currentPage }) => {
  switch (currentPage) {
    case "Dashboard":
      return <Dashboard />;
    case "Users":
      return <Users />;
    case "Settings":
      return <Settings />;
    case "Reports":
      return <Reports />;
    default:
      return <Dashboard />;
  }
};

export default Content;



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
  
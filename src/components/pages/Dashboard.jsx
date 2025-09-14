import React from "react";
import LeftPanel from "../leftPanel/LeftPanel";
import RightPanel from "../rightPanel/RightPanel";

const Dashboard = () => {
  return (
    <div className="container-fluid h-100">
      <div className="row h-100">
      <div className="d-flex" style={{ height: "100vh", gap: "1rem" }}>
        {/* Left Column (2/3 width) */}
        <div className="col-lg-8 d-flex flex-column">
          <LeftPanel />
        </div>

        {/* Right Column (1/3 width) */}
        <div className="col-lg-4 d-flex">
          <RightPanel />
        </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


// import React from "react";
// import RightPanel from "../rightPanel/RightPanel";

// const Dashboard = () => {
//   return (
//     <div className="container-fluid h-100">
//       <div className="row h-100">
//         {/* Left Column (2/3 width) */}
//         <div className="col-lg-8 d-flex flex-column">
//           {/* Top row with 3 cards */}
//           <div className="row mb-4">
//             <div className="col-md-4">
//               <div className="card shadow-sm p-3 h-100">
//                 <h5>Card 1</h5>
//                 <p>Some details here</p>
//               </div>
//             </div>
//             <div className="col-md-4">
//               <div className="card shadow-sm p-3 h-100">
//                 <h5>Card 2</h5>
//                 <p>Some details here</p>
//               </div>
//             </div>
//             <div className="col-md-4">
//               <div className="card shadow-sm p-3 h-100">
//                 <h5>Card 3</h5>
//                 <p>Some details here</p>
//               </div>
//             </div>
//           </div>

//           {/* Calendar placeholder */}
//           <div className="card shadow-sm p-3 mb-4 flex-grow-1">
//             <h5>Calendar</h5>
//             <p>[Calendar Component will go here]</p>
//           </div>

//           {/* Table placeholder */}
//           <div className="card shadow-sm p-3 flex-grow-1">
//             <h5>Data Table</h5>
//             <p>[Table Component will go here]</p>
//           </div>
//         </div>

//         {/* Right Column (1/3 width) */}
//         <div className="col-lg-4 d-flex">
//           <RightPanel />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

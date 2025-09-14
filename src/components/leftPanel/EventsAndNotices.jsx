// src/components/leftPanel/EventsAndNotices.jsx
import React from "react";
import { useExcelData } from "../../context/ExcelDataContext";

const EventsAndNotices = () => {
  const { data, loading } = useExcelData();

  if (loading) return <p>Loading events and notices...</p>;

  const events = (data.Events || []).map((e) => ({
    Type: "Event",
    Date: e.Date,
    Title: e.Title,
    Description: e.Description,
    "Issued By": e["Issued By"] || "Admin", // fallback if missing
  }));

  const notices = (data.Notices || []).map((n) => ({
    Type: "Notice",
    Date: n.Date,
    Title: n.Title,
    Description: n.Description,
    "Issued By": n["Issued By"] || "",
  }));

  const combined = [...events, ...notices].sort(
    (a, b) => new Date(a.Date) - new Date(b.Date)
  );

  return (
    <div className="card shadow-sm p-3 mb-4 flex-grow-1">
      <h5 className="mb-3">Events And Notices</h5>

      {/* Scrollable container */}
      <div
        style={{
          minHeight: "196px",
          maxHeight: "200px", // adjust this to roughly fit 5 rows
          overflowY: "auto",
        }}
      >
        <table className="table table-sm table-hover mb-0">
          <thead className="table-light sticky-top">
            <tr>
              <th>Type</th>
              <th>Date</th>
              <th>Title</th>
              <th>Description</th>
              <th>Issued By</th>
            </tr>
          </thead>
          <tbody>
            {combined.map((item, idx) => (
              <tr key={idx}>
                <td>{item.Type}</td>
                <td>{item.Date}</td>
                <td>{item.Title}</td>
                <td>{item.Description}</td>
                <td>{item["Issued By"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventsAndNotices;


// Perfect but Unsorted

// // src/components/leftPanel/EventsAndNotices.jsx
// import React from "react";
// import { useExcelData } from "../../context/ExcelDataContext";

// const EventsAndNotices = () => {
//   const { data, loading } = useExcelData();

//   if (loading) return <p>Loading Events and Notices...</p>;

//   // Get Events and Notices arrays, default to empty
//   const events = (data.Events || []).map((e) => ({
//     Type: "Event",
//     Date: e.Date,
//     Title: e.Title,
//     Description: e.Description,
//     "Issued By": e["Issued By"] || "-", // fallback if blank
//   }));

//   const notices = (data.Notices || []).map((n) => ({
//     Type: "Notice",
//     Date: n.Date,
//     Title: n.Title,
//     Description: n.Description,
//     "Issued By": n["Issued By"] || "-",
//   }));

//   // Combine both
//   const combinedData = [...events, ...notices];

//   return (
//     <div className="card shadow-sm p-3 mb-4 flex-grow-1">
//       <h5 className="mb-3">Events And Notices</h5>
//       <div className="table-responsive">
//         <table className="table table-bordered table-hover">
//           <thead className="table-light">
//             <tr>
//               <th>Type</th>
//               <th>Date</th>
//               <th>Title</th>
//               <th>Description</th>
//               <th>Issued By</th>
//             </tr>
//           </thead>
//           <tbody>
//             {combinedData.map((row, idx) => (
//               <tr key={idx}>
//                 <td>{row.Type}</td>
//                 <td>{row.Date}</td>
//                 <td>{row.Title}</td>
//                 <td>{row.Description}</td>
//                 <td>{row["Issued By"]}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default EventsAndNotices;





// Dynamic Working System

// // src/components/leftPanel/EventsAndNotices.jsx
// import React, { useState } from "react";
// import { useExcelData } from "../../context/ExcelDataContext";

// const EventsAndNotices = () => {
//   const { data, loading } = useExcelData();
//   const [tab, setTab] = useState("Events"); // default tab

//   if (loading) return <p>Loading data...</p>;

//   const events = data.Events || [];
//   const notices = data.Notices || [];

//   return (
//     <div className="card shadow-sm p-3 mb-4 flex-grow-1">
//       <h5 className="mb-3">Events and Notices</h5>

//       {/* Tabs */}
//       <div className="mb-3">
//         <button
//           className={`btn btn-sm me-2 ${tab === "Events" ? "btn-primary" : "btn-outline-primary"}`}
//           onClick={() => setTab("Events")}
//         >
//           Events
//         </button>
//         <button
//           className={`btn btn-sm ${tab === "Notices" ? "btn-primary" : "btn-outline-primary"}`}
//           onClick={() => setTab("Notices")}
//         >
//           Notices
//         </button>
//       </div>

//       {/* Table */}
//       {tab === "Events" ? (
//         <table className="table table-bordered table-sm">
//           <thead>
//             <tr>
//               <th>Event ID</th>
//               <th>Date</th>
//               <th>Title</th>
//               <th>Description</th>
//             </tr>
//           </thead>
//           <tbody>
//             {events.length > 0 ? (
//               events.map((e) => (
//                 <tr key={e["Event ID"]}>
//                   <td>{e["Event ID"]}</td>
//                   <td>{e.Date}</td>
//                   <td>{e.Title}</td>
//                   <td>{e.Description}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="4" className="text-center">
//                   No Events Found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       ) : (
//         <table className="table table-bordered table-sm">
//           <thead>
//             <tr>
//               <th>Notice ID</th>
//               <th>Date</th>
//               <th>Title</th>
//               <th>Description</th>
//               <th>Issued By</th>
//             </tr>
//           </thead>
//           <tbody>
//             {notices.length > 0 ? (
//               notices.map((n) => (
//                 <tr key={n["Notice ID"]}>
//                   <td>{n["Notice ID"]}</td>
//                   <td>{n.Date}</td>
//                   <td>{n.Title}</td>
//                   <td>{n.Description}</td>
//                   <td>{n["Issued By"]}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="5" className="text-center">
//                   No Notices Found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default EventsAndNotices;




// Default

// // src/components/leftPanel/EventsAndNotices.jsx
// import React from "react";
// import { useExcelData } from "../../context/ExcelDataContext";

// const EventsAndNotices = () => {
//   const { data, loading } = useExcelData();

//   if (loading) return <p>Loading Events and Notices...</p>;

//   const events = data.Events || [];
//   const notices = data.Notices || [];

//   return (
//     <div className="card shadow-sm p-3 mb-4 flex-grow-1">
//       <h5 className="mb-3">Events And Notices</h5>

//       {/* Events Table */}
//       <h6>Events</h6>
//       <table className="table table-sm table-striped">
//         <thead>
//           <tr>
//             <th>Event ID</th>
//             <th>Date</th>
//             <th>Title</th>
//             <th>Description</th>
//           </tr>
//         </thead>
//         <tbody>
//           {events.map((event) => (
//             <tr key={event["Event ID"]}>
//               <td>{event["Event ID"]}</td>
//               <td>{event.Date}</td>
//               <td>{event.Title}</td>
//               <td>{event.Description}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Notices Table */}
//       <h6 className="mt-4">Notices</h6>
//       <table className="table table-sm table-striped">
//         <thead>
//           <tr>
//             <th>Notice ID</th>
//             <th>Date</th>
//             <th>Title</th>
//             <th>Description</th>
//             <th>Issued By</th>
//           </tr>
//         </thead>
//         <tbody>
//           {notices.map((notice) => (
//             <tr key={notice["Notice ID"]}>
//               <td>{notice["Notice ID"]}</td>
//               <td>{notice.Date}</td>
//               <td>{notice.Title}</td>
//               <td>{notice.Description}</td>
//               <td>{notice["Issued By"]}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default EventsAndNotices;


// Old

// import React from "react";

// const DataTable = () => {
//   return (
//     <div className="card shadow-sm p-3 flex-grow-1">
//       <h5>Data Table</h5>
//       <p>[Table Component will go here ??]</p>
//     </div>
//   );
// };

// export default DataTable;

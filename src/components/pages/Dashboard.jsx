import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import "bootstrap/dist/css/bootstrap.min.css";

const Dashboard = () => {
  const [excelData, setExcelData] = useState([]);

  const cards = [
        { title: "Total Users", value: "1,234", color: "primary" },
        { title: "New Orders", value: "567", color: "success" },
        { title: "Revenue", value: "$12,345", color: "warning" },
    ];
    
  const tableData = [
    { id: 1, name: "John Doe", email: "john@example.com", status: "Active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", status: "Inactive" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", status: "Active" },
    { id: 4, name: "Alice Brown", email: "alice@example.com", status: "Pending" },
    ];

  useEffect(() => {
    const fetchExcel = async () => {
      const response = await fetch("/testdata.xlsx"); // file inside public/
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setExcelData(jsonData);
    };

    fetchExcel();
  }, []);

  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>
      <div className="row">
        {/* Left Column (2/3) */}
         <div className="col-lg-8 mb-4">
           {/* Cards */}
           <div className="row mb-4">
             {cards.map((card, idx) => (
               <div key={idx} className="col-md-4 mb-3">
                 <div className={`card text-white bg-${card.color} h-100`}>
                   <div className="card-body">
                     <h5 className="card-title">{card.title}</h5>
                     <h3>{card.value}</h3>
                   </div>
                 </div>
               </div>
            ))}
          </div>

          {/* Calendar */}
          <div className="card mb-4">
            <div className="card-header">Calendar</div>
            <div className="card-body">
              {/* Placeholder for calendar */}
              <p>Calendar Component Goes Here</p>
            </div>
          </div>

          {/* Table */}
          <div className="card">
            <div className="card-header">User Table</div>
            <div className="card-body p-0">
              <table className="table mb-0">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row) => (
                    <tr key={row.id}>
                      <td>{row.id}</td>
                      <td>{row.name}</td>
                      <td>{row.email}</td>
                      <td>{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="col-lg-4 mb-4">
          {excelData.length > 0 ? (
            excelData.slice(0, 3).map((row, idx) => (
              <div key={idx} className="card mb-3">
                <div className="card-body">
                  {Object.entries(row).map(([key, value]) => (
                    <p key={key}>
                      <strong>{key}: </strong> {value.toString()}
                    </p>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="card">
              <div className="card-body">Loading Excel data...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;



// import "bootstrap/dist/css/bootstrap.min.css";

// const Dashboard = () => {
//   const cards = [
//     { title: "Total Users", value: "1,234", color: "primary" },
//     { title: "New Orders", value: "567", color: "success" },
//     { title: "Revenue", value: "$12,345", color: "warning" },
//   ];

//   const tableData = [
//     { id: 1, name: "John Doe", email: "john@example.com", status: "Active" },
//     { id: 2, name: "Jane Smith", email: "jane@example.com", status: "Inactive" },
//     { id: 3, name: "Bob Johnson", email: "bob@example.com", status: "Active" },
//     { id: 4, name: "Alice Brown", email: "alice@example.com", status: "Pending" },
//   ];

//   return (
//     <div>
//       <h1 className="mb-4">Dashboard</h1>
//       <div className="row">
//         {/* Left Column (2/3) */}
//         <div className="col-lg-8 mb-4">
//           {/* Cards */}
//           <div className="row mb-4">
//             {cards.map((card, idx) => (
//               <div key={idx} className="col-md-4 mb-3">
//                 <div className={`card text-white bg-${card.color} h-100`}>
//                   <div className="card-body">
//                     <h5 className="card-title">{card.title}</h5>
//                     <h3>{card.value}</h3>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Calendar */}
//           <div className="card mb-4">
//             <div className="card-header">Calendar</div>
//             <div className="card-body">
//               {/* Placeholder for calendar */}
//               <p>Calendar Component Goes Here</p>
//             </div>
//           </div>

//           {/* Table */}
//           <div className="card">
//             <div className="card-header">User Table</div>
//             <div className="card-body p-0">
//               <table className="table mb-0">
//                 <thead className="table-light">
//                   <tr>
//                     <th>ID</th>
//                     <th>Name</th>
//                     <th>Email</th>
//                     <th>Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {tableData.map((row) => (
//                     <tr key={row.id}>
//                       <td>{row.id}</td>
//                       <td>{row.name}</td>
//                       <td>{row.email}</td>
//                       <td>{row.status}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>

//         {/* Right Column (1/3) */}
//         <div className="col-lg-4 mb-4">
//           <div className="card mb-3">
//             <div className="card-body">Right Widget 1</div>
//           </div>
//           <div className="card mb-3">
//             <div className="card-body">Right Widget 2</div>
//           </div>
//           <div className="card mb-3">
//             <div className="card-body">Right Widget 3</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;


// const Dashboard = () => {
//     return (
//       <div>
//         <h1>Dashboard</h1>
//         <p>This is the Dashboard page content.</p>
//       </div>
//     );
//   };
  
//   export default Dashboard;
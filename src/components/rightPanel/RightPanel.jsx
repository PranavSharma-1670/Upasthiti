import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import SearchBar from "./SearchBar";

const RightPanel = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState("Tree"); // 👈 Default set to Tree
  const [data, setData] = useState({});

  // Load Excel file from public folder on component mount
  useEffect(() => {
    fetch("/school_sample_data.xlsx")
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const allSheets = {};
        workbook.SheetNames.forEach((sheetName) => {
          const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
          allSheets[sheetName] = sheetData;
        });
        setData(allSheets);
      })
      .catch((err) => console.error("Error reading Excel file:", err));
  }, []);

  // Filter students by search
  const filteredStudents = data.Students
    ? data.Students.filter((student) =>
        `${student["First Name"]} ${student["Last Name"]}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="card shadow-sm p-3 w-100 h-100 d-flex flex-column">
      {/* Header + Search */}
      <div className="sticky-top bg-white pb-2">
        <h5 className="mb-3">Search Records</h5>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>

      {/* View Toggles */}
      <div className="mt-3 mb-3">
        <p><strong>View Toggles:</strong></p>
        <div className="btn-group w-100" role="group">
          {["JSON", "Tree", "Table"].map((type) => (
            <button
              key={type}
              className={`btn btn-sm ${
                viewType === type ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setViewType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Data Display Only */}
      <div
        className="border rounded p-2 bg-light"
        style={{
          minHeight: "480px",
          maxHeight: "480px",
          overflowY: "auto",
        }}
      >
        {/* JSON View */}
        {viewType === "JSON" && <pre>{JSON.stringify(filteredStudents, null, 2)}</pre>}

        {/* Tree View */}
        {viewType === "Tree" && (
          <ul>
            {filteredStudents.map((student, idx) => (
              <li key={idx}>
                {student["First Name"]} {student["Last Name"]} ({student.ClassID} - {student.Section})
                <ul>
                  <li>Admission No: {student["Admission No"]}</li>
                  <li>Class Teacher: {student.ClassTeacher}</li>
                  <li>Gender: {student.Gender}</li>
                  <li>Contact Info: {student["Contact Info"]}</li>
                  <li>Special Needs: {student["Special Needs"]}</li>
                </ul>
              </li>
            ))}
          </ul>
        )}

        {/* Table View */}
        {viewType === "Table" && (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Admission No</th>
                <th>Class ID</th>
                <th>Section</th>
                <th>Class Teacher</th>
                <th>Gender</th>
                <th>Contact Info</th>
                <th>Special Needs</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, idx) => (
                <tr key={idx}>
                  <td>{student["First Name"]}</td>
                  <td>{student["Last Name"]}</td>
                  <td>{student["Admission No"]}</td>
                  <td>{student.ClassID}</td>
                  <td>{student.Section}</td>
                  <td>{student.ClassTeacher}</td>
                  <td>{student.Gender}</td>
                  <td>{student["Contact Info"]}</td>
                  <td>{student["Special Needs"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RightPanel;




// All Good But whole Area Scrollable

// import React, { useState, useEffect } from "react";
// import * as XLSX from "xlsx";
// import SearchBar from "./SearchBar";

// const RightPanel = () => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [viewType, setViewType] = useState("JSON");
//   const [data, setData] = useState({});

//   // Load Excel file from public folder on mount
//   useEffect(() => {
//     const fetchData = async () => {
//       const response = await fetch("/school_sample_data.xlsx");
//       const arrayBuffer = await response.arrayBuffer();
//       const workbook = XLSX.read(arrayBuffer, { type: "array" });

//       const allSheets = {};
//       workbook.SheetNames.forEach((sheetName) => {
//         const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
//         allSheets[sheetName] = sheetData;
//       });

//       // Map ClassTeacher into Students
//       if (allSheets.Students && allSheets.Classes && allSheets.Teachers) {
//         // Build map of TeacherID -> Teacher Name
//         const teacherMap = {};
//         allSheets.Teachers.forEach((t) => {
//           teacherMap[t["Teacher ID"]] = t.Name;
//         });

//         // Build map of ClassID -> Class Teacher Name
//         const classMap = {};
//         allSheets.Classes.forEach((cls) => {
//           const teacherId = cls["Class Teacher ID"];
//           classMap[cls["Class ID"]] = teacherMap[teacherId] || "N/A";
//         });

//         // Update Students sheet to include Full Name and Class Teacher
//         allSheets.Students = allSheets.Students.map((student) => ({
//           Name: `${student["First Name"]} ${student["Last Name"]}`,
//           AdmissionNo: student["Admission No"],
//           Class: student["Class ID"],
//           Section: student.Section,
//           ClassTeacher: classMap[student["Class ID"]] || "N/A",
//           Gender: student.Gender,
//           ContactInfo: student["Contact Info"],
//           SpecialNeeds: student["Special Needs"],
//         }));
//       }

//       setData(allSheets);
//     };

//     fetchData();
//   }, []);

//   // Filtered Students by search
//   const getFilteredStudents = () => {
//     if (!data.Students) return [];
//     return data.Students.filter((student) =>
//       student.Name.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   };

//   const filteredStudents = getFilteredStudents();

//   return (
//     <div className="card shadow-sm p-3 w-100 h-100 d-flex flex-column">
//       {/* Header + Search */}
//       <div className="sticky-top bg-white pb-2">
//         <h5 className="mb-3">Search Records</h5>
//         <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
//       </div>

//       {/* Scrollable Content */}
//       <div className="mt-3 flex-grow-1 overflow-auto">
//         {/* View Toggles */}
//         <div className="mb-3">
//           <p><strong>View Toggles:</strong></p>
//           <div className="btn-group w-100" role="group">
//             {["JSON", "Tree", "Table"].map((type) => (
//               <button
//                 key={type}
//                 className={`btn btn-sm ${
//                   viewType === type ? "btn-primary" : "btn-outline-primary"
//                 }`}
//                 onClick={() => setViewType(type)}
//               >
//                 {type}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Data Display */}
//         <div>
//           <p><strong>Data Display ({viewType} View):</strong></p>
//           <div
//             className="border rounded p-2 bg-light"
//             style={{ minHeight: "480px", overflow: "auto" }}
//           >
//             {/* JSON View */}
//             {viewType === "JSON" && (
//               <pre>{JSON.stringify(filteredStudents, null, 2)}</pre>
//             )}

//             {/* Tree View */}
//             {viewType === "Tree" && (
//               <ul>
//                 {filteredStudents.map((student, idx) => (
//                   <li key={idx}>
//                     {student.Name} ({student.Class} - {student.Section})
//                     <ul>
//                       <li>Admission No: {student.AdmissionNo}</li>
//                       <li>Class Teacher: {student.ClassTeacher}</li>
//                       <li>Gender: {student.Gender}</li>
//                       <li>Contact Info: {student.ContactInfo}</li>
//                       <li>Special Needs: {student.SpecialNeeds}</li>
//                     </ul>
//                   </li>
//                 ))}
//               </ul>
//             )}

//             {/* Table View */}
//             {viewType === "Table" && (
//               <table className="table table-striped">
//                 <thead>
//                   <tr>
//                     <th>Name</th>
//                     <th>Admission No</th>
//                     <th>Class</th>
//                     <th>Section</th>
//                     <th>Class Teacher</th>
//                     <th>Gender</th>
//                     <th>Contact</th>
//                     <th>Special Needs</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredStudents.map((student, idx) => (
//                     <tr key={idx}>
//                       <td>{student.Name}</td>
//                       <td>{student.AdmissionNo}</td>
//                       <td>{student.Class}</td>
//                       <td>{student.Section}</td>
//                       <td>{student.ClassTeacher}</td>
//                       <td>{student.Gender}</td>
//                       <td>{student.ContactInfo}</td>
//                       <td>{student.SpecialNeeds}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RightPanel;



// Error 

// import React, { useState, useEffect } from "react";
// import * as XLSX from "xlsx";
// import SearchBar from "./SearchBar";

// const RightPanel = () => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [viewType, setViewType] = useState("JSON");
//   const [data, setData] = useState({});

//   // Load Excel File from /public on component mount
//   useEffect(() => {
//     fetch("/school_sample_data.xlsx")
//       .then((res) => res.arrayBuffer())
//       .then((buffer) => {
//         const workbook = XLSX.read(buffer, { type: "array" });

//         const allSheets = {};
//         workbook.SheetNames.forEach((sheetName) => {
//           const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
//           allSheets[sheetName] = sheetData;
//         });

//         setData(allSheets);
//       })
//       .catch((err) => console.error("Error loading Excel file:", err));
//   }, []);

//   // Filtered data (by search)
//   const getFilteredData = () => {
//     if (!data.Students) return [];
//     return data.Students.filter((student) =>
//       student.Name.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   };

//   const filtered = getFilteredData();

//   return (
//     <div className="card shadow-sm p-3 w-100 h-100 d-flex flex-column">
//       {/* Header + Search */}
//       <div className="sticky-top bg-white pb-2">
//         <h5 className="mb-3">Search Records</h5>
//         <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
//       </div>

//       {/* Scrollable Content */}
//       <div
//         className="mt-3 flex-grow-1 overflow-auto"
//         style={{ maxHeight: "100%" }}
//       >
//         {/* Toggles */}
//         <div className="mb-3">
//           <p><strong>View Toggles:</strong></p>
//           <div className="btn-group w-100" role="group">
//             {["JSON", "Tree", "Table"].map((type) => (
//               <button
//                 key={type}
//                 className={`btn btn-sm ${
//                   viewType === type ? "btn-primary" : "btn-outline-primary"
//                 }`}
//                 onClick={() => setViewType(type)}
//               >
//                 {type}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Data Display */}
//         <div>
//           <p><strong>Data Display ({viewType} View):</strong></p>
//           <div
//             className="border rounded p-2 bg-light"
//             style={{ minHeight: "480px", overflow: "auto" }}
//           >
//             {viewType === "JSON" && (
//               <pre>{JSON.stringify(filtered, null, 2)}</pre>
//             )}

//             {viewType === "Tree" && (
//               <ul>
//                 {filtered.map((student, idx) => (
//                   <li key={idx}>
//                     {student.Name} ({student.Class})
//                     <ul>
//                       <li>Admission No: {student.AdmissionNo}</li>
//                       <li>Class Teacher: {student.ClassTeacher}</li>
//                     </ul>
//                   </li>
//                 ))}
//               </ul>
//             )}

//             {viewType === "Table" && (
//               <table className="table table-striped">
//                 <thead>
//                   <tr>
//                     <th>Name</th>
//                     <th>Admission No</th>
//                     <th>Class</th>
//                     <th>Class Teacher</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filtered.map((student, idx) => (
//                     <tr key={idx}>
//                       <td>{student.Name}</td>
//                       <td>{student.AdmissionNo}</td>
//                       <td>{student.Class}</td>
//                       <td>{student.ClassTeacher}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RightPanel;


// Base no file

// import React, { useState } from "react";
// import * as XLSX from "xlsx";
// import SearchBar from "./SearchBar";

// const RightPanel = () => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [viewType, setViewType] = useState("JSON");
//   const [data, setData] = useState({});

//   // Load Excel File
//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     const reader = new FileReader();

//     reader.onload = (event) => {
//       const binaryStr = event.target.result;
//       const workbook = XLSX.read(binaryStr, { type: "binary" });

//       const allSheets = {};
//       workbook.SheetNames.forEach((sheetName) => {
//         const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
//         allSheets[sheetName] = sheetData;
//       });

//       setData(allSheets);
//     };

//     reader.readAsBinaryString(file);
//   };

//   // Filtered data (by search)
//   const getFilteredData = () => {
//     if (!data.Students) return [];

//     return data.Students.filter((student) =>
//       student.Name.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   };

//   const filtered = getFilteredData();

//   return (
//     <div className="card shadow-sm p-3 w-100 h-100 d-flex flex-column">
//       {/* Header + Search */}
//       <div className="sticky-top bg-white pb-2">
//         <h5 className="mb-3">Search Records</h5>
//         <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
//         <input
//           type="file"
//           accept=".xlsx, .xls"
//           onChange={handleFileUpload}
//           className="form-control mt-2"
//         />
//       </div>

//       {/* Scrollable Content */}
//       <div
//         className="mt-3 flex-grow-1 overflow-auto"
//         style={{ maxHeight: "100%" }}
//       >
//         {/* Toggles */}
//         <div className="mb-3">
//           <p><strong>View Toggles:</strong></p>
//           <div className="btn-group w-100" role="group">
//             {["JSON", "Tree", "Table"].map((type) => (
//               <button
//                 key={type}
//                 className={`btn btn-sm ${
//                   viewType === type ? "btn-primary" : "btn-outline-primary"
//                 }`}
//                 onClick={() => setViewType(type)}
//               >
//                 {type}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Data Display */}
//         <div>
//           <p><strong>Data Display ({viewType} View):</strong></p>
//           <div
//             className="border rounded p-2 bg-light"
//             style={{ minHeight: "480px", overflow: "auto" }}
//           >
//             {viewType === "JSON" && (
//               <pre>{JSON.stringify(filtered, null, 2)}</pre>
//             )}

//             {viewType === "Tree" && (
//               <ul>
//                 {filtered.map((student, idx) => (
//                   <li key={idx}>
//                     {student.Name} ({student.Class})
//                     <ul>
//                       <li>Admission No: {student.AdmissionNo}</li>
//                       <li>Class Teacher: {student.ClassTeacher}</li>
//                     </ul>
//                   </li>
//                 ))}
//               </ul>
//             )}

//             {viewType === "Table" && (
//               <table className="table table-striped">
//                 <thead>
//                   <tr>
//                     <th>Name</th>
//                     <th>Admission No</th>
//                     <th>Class</th>
//                     <th>Class Teacher</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filtered.map((student, idx) => (
//                     <tr key={idx}>
//                       <td>{student.Name}</td>
//                       <td>{student.AdmissionNo}</td>
//                       <td>{student.Class}</td>
//                       <td>{student.ClassTeacher}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RightPanel;

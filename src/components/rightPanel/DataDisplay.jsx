// src/components/rightPanel/DataDisplay.jsx
import React from "react";

const DataDisplay = ({ viewType, students }) => {
  if (!students || students.length === 0) return <p>No students found.</p>;

  if (viewType === "JSON") {
    return <pre>{JSON.stringify(students, null, 2)}</pre>;
  }

  if (viewType === "Tree") {
    return (
      <ul>
        {students.map((student, idx) => (
          <li key={idx}>
            {student["First Name"]} {student["Last Name"]} ({student["Class ID"]} - {student.Section})
            <ul>
              <li>Admission No: {student["Admission No"]}</li>
              <li>Class Teacher ID: {student["Class Teacher ID"]}</li>
              <li>Gender: {student.Gender}</li>
              <li>Contact Info: {student["Contact Info"]}</li>
              <li>Special Needs: {student["Special Needs"]}</li>
            </ul>
          </li>
        ))}
      </ul>
    );
  }

  if (viewType === "Table") {
    return (
      <table className="table table-striped">
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Admission No</th>
            <th>Class ID</th>
            <th>Section</th>
            <th>Class Teacher ID</th>
            <th>Gender</th>
            <th>Contact Info</th>
            <th>Special Needs</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, idx) => (
            <tr key={idx}>
              <td>{student["First Name"]}</td>
              <td>{student["Last Name"]}</td>
              <td>{student["Admission No"]}</td>
              <td>{student["Class ID"]}</td>
              <td>{student.Section}</td>
              <td>{student["Class Teacher ID"]}</td>
              <td>{student.Gender}</td>
              <td>{student["Contact Info"]}</td>
              <td>{student["Special Needs"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return null;
};

export default DataDisplay;



// // src/components/rightPanel/DataDisplay.jsx
// import React from "react";

// const DataDisplay = ({ viewType, students }) => {
//   if (!students.length) return <p>No students found.</p>;

//   if (viewType === "JSON") {
//     return <pre>{JSON.stringify(students, null, 2)}</pre>;
//   }

//   if (viewType === "Tree") {
//     return (
//       <ul>
//         {students.map((student, idx) => (
//           <li key={idx}>
//             {student["First Name"]} {student["Last Name"]} ({student["Class ID"]} - {student.Section})
//             <ul>
//               <li>Admission No: {student["Admission No"]}</li>
//               <li>Class Teacher: {student["Class Teacher"]}</li>
//               <li>Gender: {student.Gender}</li>
//               <li>Contact Info: {student["Contact Info"]}</li>
//               <li>Special Needs: {student["Special Needs"]}</li>
//             </ul>
//           </li>
//         ))}
//       </ul>
//     );
//   }

//   if (viewType === "Table") {
//     return (
//       <table className="table table-striped">
//         <thead>
//           <tr>
//             <th>First Name</th>
//             <th>Last Name</th>
//             <th>Admission No</th>
//             <th>Class ID</th>
//             <th>Section</th>
//             <th>Class Teacher</th>
//             <th>Gender</th>
//             <th>Contact Info</th>
//             <th>Special Needs</th>
//           </tr>
//         </thead>
//         <tbody>
//           {students.map((student, idx) => (
//             <tr key={idx}>
//               <td>{student["First Name"]}</td>
//               <td>{student["Last Name"]}</td>
//               <td>{student["Admission No"]}</td>
//               <td>{student["Class ID"]}</td>
//               <td>{student.Section}</td>
//               <td>{student["Class Teacher"]}</td>
//               <td>{student.Gender}</td>
//               <td>{student["Contact Info"]}</td>
//               <td>{student["Special Needs"]}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     );
//   }

//   return null;
// };

// export default DataDisplay;

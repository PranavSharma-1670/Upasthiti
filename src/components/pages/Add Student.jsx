// Working but i wanted but yes

import React, { useState, useEffect } from "react";
import "./AddStudent.css";

const AddStudent = () => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Form state (maps to your students table)
  const [formData, setFormData] = useState({
    admissionNo: "",
    firstName: "",
    lastName: "",
    dob: "",
    gender: "M",
    address: "",
    contactInfo: "",
    photoPath: "",
    classId: "",      // maps to class_id
    section: "A",     // single char
    specialNeeds: false,
    iepDetails: "",
    loginId: "",
    password: "",
  });

  const [classes, setClasses] = useState([]); // fetched from backend  
  const [classesWithSections, setClassesWithSections] = useState([]); // classes with their available sections
  const [students, setStudents] = useState({}); // { "Grade 1-A": [{...}, ...] }

  // Fetch classes and their sections from backend
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // Fetch basic classes for form dropdown
        const resClasses = await fetch("http://localhost:5050/api/classes");
        if (resClasses.ok) {
          const classesData = await resClasses.json();
          setClasses(classesData || []);
        }

        // Fetch classes with their available sections
        const resSections = await fetch("http://localhost:5050/api/classes/sections");
        if (resSections.ok) {
          const sectionsData = await resSections.json();
          setClassesWithSections(sectionsData || []);
        }
      } catch (err) {
        console.error("Error fetching classes:", err.message);
      }
    };
    fetchClasses();
  }, []);

  // Group classes by grade name and collect all sections
  const getGroupedClasses = () => {
    const grouped = {};
    
    classesWithSections.forEach(classObj => {
      const gradeName = classObj.class_name; // e.g., "Grade 1"
      
      if (!grouped[gradeName]) {
        grouped[gradeName] = {
          gradeName: gradeName,
          classes: [],
          allSections: []
        };
      }
      
      grouped[gradeName].classes.push(classObj);
      
      // Add sections from this class to the combined list
      if (classObj.sections && classObj.sections.length > 0) {
        classObj.sections.forEach(section => {
          if (!grouped[gradeName].allSections.includes(section)) {
            grouped[gradeName].allSections.push(section);
          }
        });
      }
    });
    
    // Sort sections for each grade
    Object.keys(grouped).forEach(grade => {
      grouped[grade].allSections.sort();
    });
    
    return grouped;
  };

  // handle inputs including checkbox
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Clicking a Section button: toggle selection, fetch students
  const handleSectionClick = async (gradeName, section) => {
    const key = `${gradeName}-${section}`;
    const newSelected = selectedSection === key ? null : key;
    setSelectedSection(newSelected);

    if (newSelected) {
      // Find the class object for this grade
      const classObj = classesWithSections.find(c => c.class_name === gradeName);
      
      if (classObj) {
        setFormData((prev) => ({ ...prev, section, classId: classObj.class_id }));

        // fetch students for this class + section
        try {
          const res = await fetch(
            `http://localhost:5050/api/students?class_id=${classObj.class_id}&section=${section}`
          );
          const data = await res.json();
          setStudents((prev) => ({ ...prev, [key]: data }));
        } catch (err) {
          console.error("Error fetching students:", err);
          setStudents((prev) => ({ ...prev, [key]: [] }));
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      admissionNo: formData.admissionNo,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dob: formData.dob || null,
      gender: formData.gender,
      address: formData.address,
      contactInfo: formData.contactInfo,
      photoPath: formData.photoPath,
      classId: formData.classId || null,
      section: formData.section || null,
      specialNeeds: formData.specialNeeds,
      iepDetails: formData.iepDetails,
      loginId: formData.loginId,
      passwordHash: formData.password, // hash on server in production
    };

    try {
      const res = await fetch("http://localhost:5050/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => null);
        throw new Error(`Failed to add student: ${res.status} ${errBody || ""}`);
      }

      await res.json();
      alert("✅ Student added successfully!");

      // refresh students list for the current section if it matches
      if (payload.classId && payload.section) {
        const targetClass = classes.find(c => c.class_id == payload.classId);
        if (targetClass) {
          const key = `${targetClass.class_name}-${payload.section}`;
          
          // refresh the student list for this section
          try {
            const resStudents = await fetch(
              `http://localhost:5050/api/students?class_id=${payload.classId}&section=${payload.section}`
            );
            const updatedStudents = await resStudents.json();
            setStudents((prev) => ({ ...prev, [key]: updatedStudents }));
          } catch (err) {
            console.error("Error refreshing student list:", err);
          }
        }
      }

      // reset form and close panel
      setFormData({
        admissionNo: "",
        firstName: "",
        lastName: "",
        dob: "",
        gender: "M",
        address: "",
        contactInfo: "",
        photoPath: "",
        classId: "",
        section: "A",
        specialNeeds: false,
        iepDetails: "",
        loginId: "",
        password: "",
      });
      setShowForm(false);
      
    } catch (err) {
      console.error("Error adding student:", err);
      alert("❌ Failed to add student. See console for details.");
    }
  };

  return (
    <div className="container-fluid p-3">
      {/* Row 1: Summary Panels */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm p-3 h-100">
            <h6>Total Classes</h6>
            <h3>{Object.keys(getGroupedClasses()).length}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm p-3 h-100">
            <h6>Total Students</h6>
            <h3>{Object.values(students).flat().length}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm p-3 h-100">
            <h6>Total Teachers</h6>
            <h3>28</h3>
          </div>
        </div>
      </div>

      {/* Row 2: Slide-in Add Student Form */}
      <div className={`slide-panel ${showForm ? "open" : ""}`}>
        <div className="card shadow-sm p-4 form-scrollable">
          <h5>Add Student</h5>
          <form onSubmit={handleSubmit} className="row g-3">
            {/* Admission No */}
            <div className="col-md-4">
              <label className="form-label">Admission No</label>
              <input
                type="text"
                className="form-control"
                name="admissionNo"
                value={formData.admissionNo}
                onChange={handleChange}
                required
              />
            </div>
            {/* First / Last */}
            <div className="col-md-4">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-control"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-control"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
            {/* DOB / Gender */}
            <div className="col-md-4">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-control"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
            {/* Contact / Photo */}
            <div className="col-md-4">
              <label className="form-label">Contact Info</label>
              <input
                type="text"
                className="form-control"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Photo Path</label>
              <input
                type="text"
                className="form-control"
                name="photoPath"
                value={formData.photoPath}
                onChange={handleChange}
                placeholder="e.g., /uploads/student1.jpg"
              />
            </div>
            {/* Class select */}
            <div className="col-md-6">
              <label className="form-label">Class</label>
              <select
                className="form-select"
                name="classId"
                value={formData.classId}
                onChange={handleChange}
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c.class_id} value={c.class_id}>
                    {c.class_name}
                  </option>
                ))}
              </select>
            </div>
            {/* Section */}
            <div className="col-md-3">
              <label className="form-label">Section</label>
              <select
                className="form-select"
                name="section"
                value={formData.section}
                onChange={handleChange}
              >
                {["A","B","C","D","E","F"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            {/* Special Needs */}
            <div className="col-md-3 d-flex align-items-center">
              <div className="form-check">
                <input
                  id="specialNeeds"
                  type="checkbox"
                  className="form-check-input"
                  name="specialNeeds"
                  checked={formData.specialNeeds}
                  onChange={handleChange}
                />
                <label htmlFor="specialNeeds" className="form-check-label ms-2">
                  Special Needs
                </label>
              </div>
            </div>
            {/* IEP Details */}
            <div className="col-12">
              <label className="form-label">IEP Details</label>
              <textarea
                className="form-control"
                name="iepDetails"
                value={formData.iepDetails}
                onChange={handleChange}
                rows={3}
              />
            </div>
            {/* Login / Password */}
            <div className="col-md-6">
              <label className="form-label">Login ID</label>
              <input
                type="text"
                className="form-control"
                name="loginId"
                value={formData.loginId}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            {/* Actions */}
            <div className="col-12 mt-3">
              <button type="submit" className="btn btn-success me-2">
                Save
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Row 3: Classes Display */}
      <div className="card shadow-sm p-3 mt-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Classes</h4>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowForm(!showForm)}
          >
            + Add Student
          </button>
        </div>

        {/* Display classes from backend - grouped by grade */}
        {classesWithSections.length > 0 ? (
          Object.entries(getGroupedClasses()).map(([gradeName, gradeData]) => (
            <div key={gradeName} className="mb-4">
              <h5 className="border-bottom pb-1">{gradeName}</h5>
              <div className="d-flex flex-wrap gap-2">
                {/* Show all sections for this grade in one row */}
                {gradeData.allSections.length > 0 ? (
                  gradeData.allSections.map((section) => {
                    const key = `${gradeName}-${section}`;
                    return (
                      <button
                        key={key}
                        className={`btn ${
                          selectedSection === key ? "btn-success" : "btn-outline-secondary"
                        }`}
                        onClick={() => handleSectionClick(gradeName, section)}
                      >
                        Section {section}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-muted">No sections available</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted py-4">
            <p>Loading classes...</p>
          </div>
        )}

        {/* Show student table outside the loop - only when a section is selected */}
        {selectedSection && (
          <div className="mt-3 ps-3">
            <h6>Students in {selectedSection}</h6>
            <table className="table table-sm table-bordered mt-2">
              <thead>
                <tr>
                  <th>Admission No</th>
                  <th>Name</th>
                  <th>DOB</th>
                </tr>
              </thead>
              <tbody>
                {(students[selectedSection] || []).map((student) => (
                  <tr key={student.student_id}>
                    <td>{student.admission_no}</td>
                    <td>{`${student.first_name} ${student.last_name}`}</td>
                    <td>{student.dob ? new Date(student.dob).toLocaleDateString() : "N/A"}</td>
                  </tr>
                ))}
                {!(students[selectedSection] || []).length && (
                  <tr>
                    <td colSpan={3} className="text-center text-muted">
                      No students yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddStudent;






// Working but linear

// import React, { useState, useEffect } from "react";
// import "./AddStudent.css";

// const AddStudent = () => {
//   const [selectedSection, setSelectedSection] = useState(null);
//   const [showForm, setShowForm] = useState(false);

//   // Form state (maps to your students table)
//   const [formData, setFormData] = useState({
//     admissionNo: "",
//     firstName: "",
//     lastName: "",
//     dob: "",
//     gender: "M",
//     address: "",
//     contactInfo: "",
//     photoPath: "",
//     classId: "",      // maps to class_id
//     section: "A",     // single char
//     specialNeeds: false,
//     iepDetails: "",
//     loginId: "",
//     password: "",
//   });

//   const [classes, setClasses] = useState([]); // fetched from backend  
//   const [classesWithSections, setClassesWithSections] = useState([]); // classes with their available sections
//   const [students, setStudents] = useState({}); // { "Grade 1-A": [{...}, ...] }

//   // Fetch classes and their sections from backend
//   useEffect(() => {
//     const fetchClasses = async () => {
//       try {
//         // Fetch basic classes for form dropdown
//         const resClasses = await fetch("http://localhost:5050/api/classes");
//         if (resClasses.ok) {
//           const classesData = await resClasses.json();
//           setClasses(classesData || []);
//         }

//         // Fetch classes with their available sections
//         const resSections = await fetch("http://localhost:5050/api/classes/sections");
//         if (resSections.ok) {
//           const sectionsData = await resSections.json();
//           setClassesWithSections(sectionsData || []);
//         }
//       } catch (err) {
//         console.error("Error fetching classes:", err.message);
//       }
//     };
//     fetchClasses();
//   }, []);

//   // handle inputs including checkbox
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   // Clicking a Section button: toggle selection, fetch students
//   const handleSectionClick = async (classObj, section) => {
//     const key = `${classObj.class_name}-${section}`;
//     const newSelected = selectedSection === key ? null : key;
//     setSelectedSection(newSelected);

//     if (newSelected) {
//       setFormData((prev) => ({ ...prev, section, classId: classObj.class_id }));

//       // fetch students for this class + section
//       try {
//         const res = await fetch(
//           `http://localhost:5050/api/students?class_id=${classObj.class_id}&section=${section}`
//         );
//         const data = await res.json();
//         setStudents((prev) => ({ ...prev, [key]: data }));
//       } catch (err) {
//         console.error("Error fetching students:", err);
//         setStudents((prev) => ({ ...prev, [key]: [] }));
//       }
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const payload = {
//       admissionNo: formData.admissionNo,
//       firstName: formData.firstName,
//       lastName: formData.lastName,
//       dob: formData.dob || null,
//       gender: formData.gender,
//       address: formData.address,
//       contactInfo: formData.contactInfo,
//       photoPath: formData.photoPath,
//       classId: formData.classId || null,
//       section: formData.section || null,
//       specialNeeds: formData.specialNeeds,
//       iepDetails: formData.iepDetails,
//       loginId: formData.loginId,
//       passwordHash: formData.password, // hash on server in production
//     };

//     try {
//       const res = await fetch("http://localhost:5050/api/students", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const errBody = await res.text().catch(() => null);
//         throw new Error(`Failed to add student: ${res.status} ${errBody || ""}`);
//       }

//       await res.json();
//       alert("✅ Student added successfully!");

//       // refresh students list for the current section if it matches
//       if (payload.classId && payload.section) {
//         const targetClass = classes.find(c => c.class_id == payload.classId);
//         if (targetClass) {
//           const key = `${targetClass.class_name}-${payload.section}`;
          
//           // refresh the student list for this section
//           try {
//             const resStudents = await fetch(
//               `http://localhost:5050/api/students?class_id=${payload.classId}&section=${payload.section}`
//             );
//             const updatedStudents = await resStudents.json();
//             setStudents((prev) => ({ ...prev, [key]: updatedStudents }));
//           } catch (err) {
//             console.error("Error refreshing student list:", err);
//           }
//         }
//       }

//       // reset form and close panel
//       setFormData({
//         admissionNo: "",
//         firstName: "",
//         lastName: "",
//         dob: "",
//         gender: "M",
//         address: "",
//         contactInfo: "",
//         photoPath: "",
//         classId: "",
//         section: "A",
//         specialNeeds: false,
//         iepDetails: "",
//         loginId: "",
//         password: "",
//       });
//       setShowForm(false);
      
//     } catch (err) {
//       console.error("Error adding student:", err);
//       alert("❌ Failed to add student. See console for details.");
//     }
//   };

//   return (
//     <div className="container-fluid p-3">
//       {/* Row 1: Summary Panels */}
//       <div className="row mb-4">
//         <div className="col-md-4">
//           <div className="card shadow-sm p-3 h-100">
//             <h6>Total Classes</h6>
//             <h3>{classesWithSections.length}</h3>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card shadow-sm p-3 h-100">
//             <h6>Total Students</h6>
//             <h3>{Object.values(students).flat().length}</h3>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card shadow-sm p-3 h-100">
//             <h6>Total Teachers</h6>
//             <h3>28</h3>
//           </div>
//         </div>
//       </div>

//       {/* Row 2: Slide-in Add Student Form */}
//       <div className={`slide-panel ${showForm ? "open" : ""}`}>
//         <div className="card shadow-sm p-4 form-scrollable">
//           <h5>Add Student</h5>
//           <form onSubmit={handleSubmit} className="row g-3">
//             {/* Admission No */}
//             <div className="col-md-4">
//               <label className="form-label">Admission No</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="admissionNo"
//                 value={formData.admissionNo}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             {/* First / Last */}
//             <div className="col-md-4">
//               <label className="form-label">First Name</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="firstName"
//                 value={formData.firstName}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="col-md-4">
//               <label className="form-label">Last Name</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="lastName"
//                 value={formData.lastName}
//                 onChange={handleChange}
//               />
//             </div>
//             {/* DOB / Gender */}
//             <div className="col-md-4">
//               <label className="form-label">Date of Birth</label>
//               <input
//                 type="date"
//                 className="form-control"
//                 name="dob"
//                 value={formData.dob}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="col-md-4">
//               <label className="form-label">Gender</label>
//               <select
//                 className="form-select"
//                 name="gender"
//                 value={formData.gender}
//                 onChange={handleChange}
//               >
//                 <option value="M">Male</option>
//                 <option value="F">Female</option>
//                 <option value="O">Other</option>
//               </select>
//             </div>
//             {/* Contact / Photo */}
//             <div className="col-md-4">
//               <label className="form-label">Contact Info</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="contactInfo"
//                 value={formData.contactInfo}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="col-md-6">
//               <label className="form-label">Photo Path</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="photoPath"
//                 value={formData.photoPath}
//                 onChange={handleChange}
//                 placeholder="e.g., /uploads/student1.jpg"
//               />
//             </div>
//             {/* Class select */}
//             <div className="col-md-6">
//               <label className="form-label">Class</label>
//               <select
//                 className="form-select"
//                 name="classId"
//                 value={formData.classId}
//                 onChange={handleChange}
//               >
//                 <option value="">Select Class</option>
//                 {classes.map((c) => (
//                   <option key={c.class_id} value={c.class_id}>
//                     {c.class_name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             {/* Section */}
//             <div className="col-md-3">
//               <label className="form-label">Section</label>
//               <select
//                 className="form-select"
//                 name="section"
//                 value={formData.section}
//                 onChange={handleChange}
//               >
//                 {["A","B","C","D","E","F"].map((s) => (
//                   <option key={s} value={s}>{s}</option>
//                 ))}
//               </select>
//             </div>
//             {/* Special Needs */}
//             <div className="col-md-3 d-flex align-items-center">
//               <div className="form-check">
//                 <input
//                   id="specialNeeds"
//                   type="checkbox"
//                   className="form-check-input"
//                   name="specialNeeds"
//                   checked={formData.specialNeeds}
//                   onChange={handleChange}
//                 />
//                 <label htmlFor="specialNeeds" className="form-check-label ms-2">
//                   Special Needs
//                 </label>
//               </div>
//             </div>
//             {/* IEP Details */}
//             <div className="col-12">
//               <label className="form-label">IEP Details</label>
//               <textarea
//                 className="form-control"
//                 name="iepDetails"
//                 value={formData.iepDetails}
//                 onChange={handleChange}
//                 rows={3}
//               />
//             </div>
//             {/* Login / Password */}
//             <div className="col-md-6">
//               <label className="form-label">Login ID</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="loginId"
//                 value={formData.loginId}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="col-md-6">
//               <label className="form-label">Password</label>
//               <input
//                 type="password"
//                 className="form-control"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//               />
//             </div>
//             {/* Actions */}
//             <div className="col-12 mt-3">
//               <button type="submit" className="btn btn-success me-2">
//                 Save
//               </button>
//               <button
//                 type="button"
//                 className="btn btn-secondary"
//                 onClick={() => setShowForm(false)}
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* Row 3: Classes Display */}
//       <div className="card shadow-sm p-3 mt-3">
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <h4>Classes</h4>
//           <button
//             className="btn btn-primary btn-sm"
//             onClick={() => setShowForm(!showForm)}
//           >
//             + Add Student
//           </button>
//         </div>

//         {/* Display classes from backend */}
//         {classesWithSections.length > 0 ? (
//           classesWithSections.map((classObj, idx) => (
//             <div key={classObj.class_id} className="mb-4">
//               <h5 className="border-bottom pb-1">{classObj.class_name}</h5>
//               <div className="d-flex flex-wrap gap-2">
//                 {/* Show only sections that exist in database */}
//                 {classObj.sections && classObj.sections.length > 0 ? (
//                   classObj.sections.map((section) => {
//                     const key = `${classObj.class_name}-${section}`;
//                     return (
//                       <button
//                         key={key}
//                         className={`btn ${
//                           selectedSection === key ? "btn-success" : "btn-outline-secondary"
//                         }`}
//                         onClick={() => handleSectionClick(classObj, section)}
//                       >
//                         Section {section}
//                       </button>
//                     );
//                   })
//                 ) : (
//                   <p className="text-muted">No sections available</p>
//                 )}
//               </div>

//               {/* Show student table if this class's section is selected */}
//               {selectedSection?.startsWith(classObj.class_name) && (
//                 <div className="mt-3 ps-3">
//                   <h6>Students in {selectedSection}</h6>
//                   <table className="table table-sm table-bordered mt-2">
//                     <thead>
//                       <tr>
//                         <th>Admission No</th>
//                         <th>Name</th>
//                         <th>DOB</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {(students[selectedSection] || []).map((student) => (
//                         <tr key={student.student_id}>
//                           <td>{student.admission_no}</td>
//                           <td>{`${student.first_name} ${student.last_name}`}</td>
//                           <td>{student.dob ? new Date(student.dob).toLocaleDateString() : "N/A"}</td>
//                         </tr>
//                       ))}
//                       {!(students[selectedSection] || []).length && (
//                         <tr>
//                           <td colSpan={3} className="text-center text-muted">
//                             No students yet
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           ))
//         ) : (
//           <div className="text-center text-muted py-4">
//             <p>Loading classes...</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AddStudent;








// Good But Error


// import React, { useState, useEffect } from "react";
// import "./AddStudent.css";

// const AddStudent = () => {
//   const [selectedSection, setSelectedSection] = useState(null);
//   const [showForm, setShowForm] = useState(false);

//   // Form state (maps to your students table)
//   const [formData, setFormData] = useState({
//     admissionNo: "",
//     firstName: "",
//     lastName: "",
//     dob: "",
//     gender: "M",
//     address: "",
//     contactInfo: "",
//     photoPath: "",
//     classId: "",      // maps to class_id
//     section: "A",     // single char
//     specialNeeds: false,
//     iepDetails: "",
//     loginId: "",
//     password: "",
//   });

//   const [classes, setClasses] = useState([]); // fetched from backend
//   const [students, setStudents] = useState({}); // { "Grade 1-A": [{...}, ...] }

//   // Fetch classes from backend
//   useEffect(() => {
//     const fetchClasses = async () => {
//       try {
//         const res = await fetch("http://localhost:5050/api/classes");
//         if (!res.ok) throw new Error("Failed to fetch classes");
//         const data = await res.json();
//         setClasses(data || []);
//       } catch (err) {
//         console.error("Error fetching classes:", err.message);
//       }
//     };
//     fetchClasses();
//   }, []);

//   // handle inputs including checkbox
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   // Clicking a Section button: toggle selection, fetch students
//   const handleSectionClick = async (classObj, section) => {
//     const key = `${classObj.class_name}-${section}`;
//     const newSelected = selectedSection === key ? null : key;
//     setSelectedSection(newSelected);

//     if (newSelected) {
//       setFormData((prev) => ({ ...prev, section, classId: classObj.class_id }));

//       // fetch students for this class + section
//       try {
//         const res = await fetch(
//           `http://localhost:5050/api/students?class_id=${classObj.class_id}&section=${section}`
//         );
//         const data = await res.json();
//         setStudents((prev) => ({ ...prev, [key]: data }));
//       } catch (err) {
//         console.error("Error fetching students:", err);
//         setStudents((prev) => ({ ...prev, [key]: [] }));
//       }
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const payload = {
//       admissionNo: formData.admissionNo,
//       firstName: formData.firstName,
//       lastName: formData.lastName,
//       dob: formData.dob || null,
//       gender: formData.gender,
//       address: formData.address,
//       contactInfo: formData.contactInfo,
//       photoPath: formData.photoPath,
//       classId: formData.classId || null,
//       section: formData.section || null,
//       specialNeeds: formData.specialNeeds,
//       iepDetails: formData.iepDetails,
//       loginId: formData.loginId,
//       passwordHash: formData.password, // hash on server in production
//     };

//     try {
//       const res = await fetch("http://localhost:5050/api/students", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const errBody = await res.text().catch(() => null);
//         throw new Error(`Failed to add student: ${res.status} ${errBody || ""}`);
//       }

//       await res.json();
//       alert("✅ Student added successfully!");

//       // refresh students list for the current section if it matches
//       if (payload.classId && payload.section) {
//         const targetClass = classes.find(c => c.class_id == payload.classId);
//         if (targetClass) {
//           const key = `${targetClass.class_name}-${payload.section}`;
          
//           // refresh the student list for this section
//           try {
//             const resStudents = await fetch(
//               `http://localhost:5050/api/students?class_id=${payload.classId}&section=${payload.section}`
//             );
//             const updatedStudents = await resStudents.json();
//             setStudents((prev) => ({ ...prev, [key]: updatedStudents }));
//           } catch (err) {
//             console.error("Error refreshing student list:", err);
//           }
//         }
//       }

//       // reset form and close panel
//       setFormData({
//         admissionNo: "",
//         firstName: "",
//         lastName: "",
//         dob: "",
//         gender: "M",
//         address: "",
//         contactInfo: "",
//         photoPath: "",
//         classId: "",
//         section: "A",
//         specialNeeds: false,
//         iepDetails: "",
//         loginId: "",
//         password: "",
//       });
//       setShowForm(false);
      
//     } catch (err) {
//       console.error("Error adding student:", err);
//       alert("❌ Failed to add student. See console for details.");
//     }
//   };

//   return (
//     <div className="container-fluid p-3">
//       {/* Row 1: Summary Panels */}
//       <div className="row mb-4">
//         <div className="col-md-4">
//           <div className="card shadow-sm p-3 h-100">
//             <h6>Total Classes</h6>
//             <h3>{classes.length}</h3>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card shadow-sm p-3 h-100">
//             <h6>Total Students</h6>
//             <h3>{Object.values(students).flat().length}</h3>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card shadow-sm p-3 h-100">
//             <h6>Total Teachers</h6>
//             <h3>28</h3>
//           </div>
//         </div>
//       </div>

//       {/* Row 2: Slide-in Add Student Form */}
//       <div className={`slide-panel ${showForm ? "open" : ""}`}>
//         <div className="card shadow-sm p-4 form-scrollable">
//           <h5>Add Student</h5>
//           <form onSubmit={handleSubmit} className="row g-3">
//             {/* Admission No */}
//             <div className="col-md-4">
//               <label className="form-label">Admission No</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="admissionNo"
//                 value={formData.admissionNo}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             {/* First / Last */}
//             <div className="col-md-4">
//               <label className="form-label">First Name</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="firstName"
//                 value={formData.firstName}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="col-md-4">
//               <label className="form-label">Last Name</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="lastName"
//                 value={formData.lastName}
//                 onChange={handleChange}
//               />
//             </div>
//             {/* DOB / Gender */}
//             <div className="col-md-4">
//               <label className="form-label">Date of Birth</label>
//               <input
//                 type="date"
//                 className="form-control"
//                 name="dob"
//                 value={formData.dob}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="col-md-4">
//               <label className="form-label">Gender</label>
//               <select
//                 className="form-select"
//                 name="gender"
//                 value={formData.gender}
//                 onChange={handleChange}
//               >
//                 <option value="M">Male</option>
//                 <option value="F">Female</option>
//                 <option value="O">Other</option>
//               </select>
//             </div>
//             {/* Contact / Photo */}
//             <div className="col-md-4">
//               <label className="form-label">Contact Info</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="contactInfo"
//                 value={formData.contactInfo}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="col-md-6">
//               <label className="form-label">Photo Path</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="photoPath"
//                 value={formData.photoPath}
//                 onChange={handleChange}
//                 placeholder="e.g., /uploads/student1.jpg"
//               />
//             </div>
//             {/* Class select */}
//             <div className="col-md-6">
//               <label className="form-label">Class</label>
//               <select
//                 className="form-select"
//                 name="classId"
//                 value={formData.classId}
//                 onChange={handleChange}
//               >
//                 <option value="">Select Class</option>
//                 {classes.map((c) => (
//                   <option key={c.class_id} value={c.class_id}>
//                     {c.class_name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             {/* Section */}
//             <div className="col-md-3">
//               <label className="form-label">Section</label>
//               <select
//                 className="form-select"
//                 name="section"
//                 value={formData.section}
//                 onChange={handleChange}
//               >
//                 {["A","B","C","D","E","F"].map((s) => (
//                   <option key={s} value={s}>{s}</option>
//                 ))}
//               </select>
//             </div>
//             {/* Special Needs */}
//             <div className="col-md-3 d-flex align-items-center">
//               <div className="form-check">
//                 <input
//                   id="specialNeeds"
//                   type="checkbox"
//                   className="form-check-input"
//                   name="specialNeeds"
//                   checked={formData.specialNeeds}
//                   onChange={handleChange}
//                 />
//                 <label htmlFor="specialNeeds" className="form-check-label ms-2">
//                   Special Needs
//                 </label>
//               </div>
//             </div>
//             {/* IEP Details */}
//             <div className="col-12">
//               <label className="form-label">IEP Details</label>
//               <textarea
//                 className="form-control"
//                 name="iepDetails"
//                 value={formData.iepDetails}
//                 onChange={handleChange}
//                 rows={3}
//               />
//             </div>
//             {/* Login / Password */}
//             <div className="col-md-6">
//               <label className="form-label">Login ID</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="loginId"
//                 value={formData.loginId}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="col-md-6">
//               <label className="form-label">Password</label>
//               <input
//                 type="password"
//                 className="form-control"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//               />
//             </div>
//             {/* Actions */}
//             <div className="col-12 mt-3">
//               <button type="submit" className="btn btn-success me-2">
//                 Save
//               </button>
//               <button
//                 type="button"
//                 className="btn btn-secondary"
//                 onClick={() => setShowForm(false)}
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* Row 3: Classes Display */}
//       <div className="card shadow-sm p-3 mt-3">
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <h4>Classes</h4>
//           <button
//             className="btn btn-primary btn-sm"
//             onClick={() => setShowForm(!showForm)}
//           >
//             + Add Student
//           </button>
//         </div>

//         {/* Display classes from backend */}
//         {classes.length > 0 ? (
//           classes.map((classObj, idx) => (
//             <div key={classObj.class_id} className="mb-4">
//               <h5 className="border-bottom pb-1">{classObj.class_name}</h5>
//               <div className="d-flex flex-wrap gap-2">
//                 {/* Generate sections A-F for each class */}
//                 {["A", "B", "C", "D", "E", "F"].map((section) => {
//                   const key = `${classObj.class_name}-${section}`;
//                   return (
//                     <button
//                       key={key}
//                       className={`btn ${
//                         selectedSection === key ? "btn-success" : "btn-outline-secondary"
//                       }`}
//                       onClick={() => handleSectionClick(classObj, section)}
//                     >
//                       Section {section}
//                     </button>
//                   );
//                 })}
//               </div>

//               {/* Show student table if this class's section is selected */}
//               {selectedSection?.startsWith(classObj.class_name) && (
//                 <div className="mt-3 ps-3">
//                   <h6>Students in {selectedSection}</h6>
//                   <table className="table table-sm table-bordered mt-2">
//                     <thead>
//                       <tr>
//                         <th>Admission No</th>
//                         <th>Name</th>
//                         <th>DOB</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {(students[selectedSection] || []).map((student) => (
//                         <tr key={student.student_id}>
//                           <td>{student.admission_no}</td>
//                           <td>{`${student.first_name} ${student.last_name}`}</td>
//                           <td>{student.dob ? new Date(student.dob).toLocaleDateString() : "N/A"}</td>
//                         </tr>
//                       ))}
//                       {!(students[selectedSection] || []).length && (
//                         <tr>
//                           <td colSpan={3} className="text-center text-muted">
//                             No students yet
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           ))
//         ) : (
//           <div className="text-center text-muted py-4">
//             <p>Loading classes...</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AddStudent;





// self attemt at making it

// import React, { useState, useEffect } from "react";
// import "./AddStudent.css";

// const AddStudent = () => {
//   const [selectedSection, setSelectedSection] = useState(null);
//   const [showForm, setShowForm] = useState(false);

//   // Form state (maps to your students table)
//   const [formData, setFormData] = useState({
//     admissionNo: "",
//     firstName: "",
//     lastName: "",
//     dob: "",
//     gender: "M",
//     address: "",
//     contactInfo: "",
//     photoPath: "",
//     classId: "",      // maps to class_id
//     section: "A",     // single char
//     specialNeeds: false,
//     iepDetails: "",
//     loginId: "",
//     password: "",
//   });

//   const [classes, setClasses] = useState([]); // fetched from backend
//   const [students, setStudents] = useState({}); // { "Grade 1-A": [{...}, ...] }

//   // Fetch classes from backend
//   useEffect(() => {
//     const fetchClasses = async () => {
//       try {
//         const res = await fetch("http://localhost:5050/api/classes");
//         if (!res.ok) throw new Error("Failed to fetch classes");
//         const data = await res.json();
//         setClasses(data || []);
//       } catch (err) {
//         console.error("Error fetching classes:", err.message);
//       }
//     };
//     fetchClasses();
//   }, []);

//   // handle inputs including checkbox
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   // Clicking a Section button: toggle selection, fetch students
//   const handleSectionClick = async (classObj, section) => {
//     const key = `${classObj.class_name}-${section}`;
//     const newSelected = selectedSection === key ? null : key;
//     setSelectedSection(newSelected);

//     if (newSelected) {
//       setFormData((prev) => ({ ...prev, section, classId: classObj.class_id }));

//       // fetch students for this class + section
//       try {
//         const res = await fetch(
//           `http://localhost:5050/api/students?class_id=${classObj.class_id}&section=${section}`
//         );
//         const data = await res.json();
//         setStudents((prev) => ({ ...prev, [key]: data }));
//       } catch (err) {
//         console.error("Error fetching students:", err);
//         setStudents((prev) => ({ ...prev, [key]: [] }));
//       }
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const payload = {
//       admission_no: formData.admissionNo,
//       first_name: formData.firstName,
//       last_name: formData.lastName,
//       dob: formData.dob || null,
//       gender: formData.gender,
//       address: formData.address,
//       contact_info: formData.contactInfo,
//       photo_path: formData.photoPath,
//       class_id: formData.classId || null,
//       section: formData.section || null,
//       special_needs: formData.specialNeeds,
//       iep_details: formData.iepDetails,
//       login_id: formData.loginId,
//       password_hash: formData.password, // hash on server in production
//     };

//     try {
//       const res = await fetch("http://localhost:5050/api/students", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const errBody = await res.text().catch(() => null);
//         throw new Error(`Failed to add student: ${res.status} ${errBody || ""}`);
//       }

//       await res.json();
//       alert("✅ Student added successfully!");

//       // reset form and close panel
//       setFormData({
//         admissionNo: "",
//         firstName: "",
//         lastName: "",
//         dob: "",
//         gender: "M",
//         address: "",
//         contactInfo: "",
//         photoPath: "",
//         classId: "",
//         section: "A",
//         specialNeeds: false,
//         iepDetails: "",
//         loginId: "",
//         password: "",
//       });
//       setShowForm(false);
//       setSelectedSection(null);

//       // refresh students list for this section
//       if (payload.class_id && payload.section) {
//         const key = `${classes.find(c => c.class_id === payload.class_id).class_name}-${payload.section}`;
//         const resStudents = await fetch(
//           `http://localhost:5050/api/students?class_id=${payload.class_id}&section=${payload.section}`
//         );
//         const updatedStudents = await resStudents.json();
//         setStudents((prev) => ({ ...prev, [key]: updatedStudents }));
//       }
//     } catch (err) {
//       console.error("Error adding student:", err);
//       alert("❌ Failed to add student. See console for details.");
//     }
//   };

//   return (
//     <div className="container-fluid p-3">
//       {/* Row 1: Summary Panels */}
//       <div className="row mb-4">
//         <div className="col-md-4">
//           <div className="card shadow-sm p-3 h-100">
//             <h6>Total Classes</h6>
//             <h3>{classes.length}</h3>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card shadow-sm p-3 h-100">
//             <h6>Total Students</h6>
//             <h3>{Object.values(students).flat().length}</h3>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card shadow-sm p-3 h-100">
//             <h6>Total Teachers</h6>
//             <h3>28</h3>
//           </div>
//         </div>
//       </div>

//       {/* Row 2: Slide-in Add Student Form */}
//       <div className={`slide-panel ${showForm ? "open" : ""}`}>
//         <div className="card shadow-sm p-4 form-scrollable">
//           <h5>Add Student</h5>
//           <form onSubmit={handleSubmit} className="row g-3">
//             {/* Admission No */}
//             <div className="col-md-4">
//               <label className="form-label">Admission No</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="admissionNo"
//                 value={formData.admissionNo}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             {/* First / Last */}
//             <div className="col-md-4">
//               <label className="form-label">First Name</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="firstName"
//                 value={formData.firstName}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="col-md-4">
//               <label className="form-label">Last Name</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="lastName"
//                 value={formData.lastName}
//                 onChange={handleChange}
//               />
//             </div>
//             {/* DOB / Gender */}
//             <div className="col-md-4">
//               <label className="form-label">Date of Birth</label>
//               <input
//                 type="date"
//                 className="form-control"
//                 name="dob"
//                 value={formData.dob}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="col-md-4">
//               <label className="form-label">Gender</label>
//               <select
//                 className="form-select"
//                 name="gender"
//                 value={formData.gender}
//                 onChange={handleChange}
//               >
//                 <option value="M">Male</option>
//                 <option value="F">Female</option>
//                 <option value="O">Other</option>
//               </select>
//             </div>
//             {/* Contact / Photo */}
//             <div className="col-md-4">
//               <label className="form-label">Contact Info</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="contactInfo"
//                 value={formData.contactInfo}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="col-md-6">
//               <label className="form-label">Photo Path</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="photoPath"
//                 value={formData.photoPath}
//                 onChange={handleChange}
//                 placeholder="e.g., /uploads/student1.jpg"
//               />
//             </div>
//             {/* Class select */}
//             <div className="col-md-6">
//               <label className="form-label">Class</label>
//               <select
//                 className="form-select"
//                 name="classId"
//                 value={formData.classId}
//                 onChange={handleChange}
//               >
//                 <option value="">Select Class</option>
//                 {classes.map((c) => (
//                   <option key={c.class_id} value={c.class_id}>
//                     {c.class_name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             {/* Section */}
//             <div className="col-md-3">
//               <label className="form-label">Section</label>
//               <select
//                 className="form-select"
//                 name="section"
//                 value={formData.section}
//                 onChange={handleChange}
//               >
//                 {["A","B","C","D","E","F"].map((s) => (
//                   <option key={s} value={s}>{s}</option>
//                 ))}
//               </select>
//             </div>
//             {/* Special Needs */}
//             <div className="col-md-3 d-flex align-items-center">
//               <div className="form-check">
//                 <input
//                   id="specialNeeds"
//                   type="checkbox"
//                   className="form-check-input"
//                   name="specialNeeds"
//                   checked={formData.specialNeeds}
//                   onChange={handleChange}
//                 />
//                 <label htmlFor="specialNeeds" className="form-check-label ms-2">
//                   Special Needs
//                 </label>
//               </div>
//             </div>
//             {/* IEP Details */}
//             <div className="col-12">
//               <label className="form-label">IEP Details</label>
//               <textarea
//                 className="form-control"
//                 name="iepDetails"
//                 value={formData.iepDetails}
//                 onChange={handleChange}
//                 rows={3}
//               />
//             </div>
//             {/* Login / Password */}
//             <div className="col-md-6">
//               <label className="form-label">Login ID</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="loginId"
//                 value={formData.loginId}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="col-md-6">
//               <label className="form-label">Password</label>
//               <input
//                 type="password"
//                 className="form-control"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//               />
//             </div>
//             {/* Actions */}
//             <div className="col-12 mt-3">
//               <button type="submit" className="btn btn-success me-2">
//                 Save
//               </button>
//               <button
//                 type="button"
//                 className="btn btn-secondary"
//                 onClick={() => setShowForm(false)}
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* Row 3: Classes Display */}
//       <div className="card shadow-sm p-3 mt-3">
        
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <h4>Classes</h4>
//           <button
//             className="btn btn-primary btn-sm"
//             onClick={() => setShowForm(!showForm)}
//           >
//             + Add Student
//           </button>
//         </div>
        
        

//       </div>
      
//     </div>
//   );
// };

// export default AddStudent;



{/* Row 3: Classes Display
      <div className="card shadow-sm p-3 mt-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Classes</h4>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowForm(!showForm)}
          >
            + Add Student
          </button>
        </div>

        {classes.map((c) => (
          <div key={c.class_id} className="mb-4">
            <h5 className="border-bottom pb-1">{c.class_name}</h5>
            <div className="d-flex flex-wrap gap-2">
              {["A","B","C","D","E","F"].map((section) => (
                <button
                  key={`${c.class_name}-${section}`}
                  className={`btn ${
                    selectedSection === `${c.class_name}-${section}` ? "btn-success" : "btn-outline-secondary"
                  }`}
                  onClick={() => handleSectionClick(c, section)}
                >
                  Section {section}
                </button>
              ))}
            </div>

            {selectedSection?.startsWith(c.class_name) && (
              <div className="mt-3 ps-3">
                <h6>Students in {selectedSection}</h6>
                <table className="table table-sm table-bordered mt-2">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(students[selectedSection] || []).map((s) => (
                      <tr key={s.student_id}>
                        <td>{s.admission_no}</td>
                        <td>{s.first_name} {s.last_name}</td>
                      </tr>
                    ))}
                    {!(students[selectedSection] || []).length && (
                      <tr>
                        <td colSpan={2} className="text-center text-muted">
                          No students yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div> */}






// Good not connected to the backend

// import React, { useState, useEffect } from "react";
// import "./AddStudent.css";

// const AddStudent = () => {
//   const [selectedSection, setSelectedSection] = useState(null);
//   const [showForm, setShowForm] = useState(false);

//   // Form state (maps to your students table)
//   const [formData, setFormData] = useState({
//     admissionNo: "",
//     firstName: "",
//     lastName: "",
//     dob: "",
//     gender: "M",
//     address: "",
//     contactInfo: "",
//     photoPath: "",
//     classId: "",      // maps to class_id
//     section: "A",     // single char
//     specialNeeds: false,
//     iepDetails: "",
//     loginId: "",
//     password: "",
//   });

//   const [classes, setClasses] = useState([]); // fetched from backend
//   // fallback grade/section UI if /api/classes isn't available
//   const grades = [
//     { grade: "Grade 1", sections: ["A", "B", "C", "D"] },
//     { grade: "Grade 2", sections: ["A", "B", "C", "D", "E", "F"] },
//     { grade: "Grade 3", sections: ["A", "B", "C", "D"] },
//   ];

//   const students = {
//     "Grade 1-A": [
//       { id: 1, name: "John Doe", roll: "101" },
//       { id: 2, name: "Jane Smith", roll: "102" },
//     ],
//   };

//   // Fetch classes for the class select dropdown (optional backend route)
//   useEffect(() => {
//     const fetchClasses = async () => {
//       try {
//         const res = await fetch("http://localhost:5050/api/classes");
//         if (!res.ok) throw new Error("No classes endpoint");
//         const data = await res.json();
//         setClasses(data || []);
//       } catch (err) {
//         console.warn("Could not fetch classes, using fallback grades:", err.message);
//         setClasses([]); // keep empty, fallback to grades UI
//       }
//     };
//     fetchClasses();
//   }, []);

//   // handle inputs including checkbox
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   // Clicking a Section button: toggle selection, set section + try to set classId
//   const handleSectionClick = (grade, section) => {
//     const key = `${grade}-${section}`;
//     const newSelected = selectedSection === key ? null : key;
//     setSelectedSection(newSelected);

//     if (newSelected) {
//       // set section in the form
//       setFormData((prev) => ({ ...prev, section }));

//       // try to auto-select classId if classes include matching class_name
//       const match = classes.find((c) => String(c.class_name).trim() === String(grade).trim());
//       if (match) {
//         setFormData((prev) => ({ ...prev, classId: match.class_id }));
//       }
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const payload = {
//       admissionNo: formData.admissionNo,
//       firstName: formData.firstName,
//       lastName: formData.lastName,
//       dob: formData.dob || null,
//       gender: formData.gender,
//       address: formData.address,
//       contactInfo: formData.contactInfo,
//       photoPath: formData.photoPath,
//       classId: formData.classId || null,
//       section: formData.section || null,
//       specialNeeds: formData.specialNeeds,
//       iepDetails: formData.iepDetails,
//       loginId: formData.loginId,
//       passwordHash: formData.password, // hash on server in production
//     };

//     try {
//       const res = await fetch("http://localhost:5050/api/students", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const errBody = await res.text().catch(() => null);
//         throw new Error(`Failed to add student: ${res.status} ${errBody || ""}`);
//       }

//       await res.json();
//       alert("✅ Student added successfully!");
//       // reset form and close panel
//       setFormData({
//         admissionNo: "",
//         firstName: "",
//         lastName: "",
//         dob: "",
//         gender: "M",
//         address: "",
//         contactInfo: "",
//         photoPath: "",
//         classId: "",
//         section: "A",
//         specialNeeds: false,
//         iepDetails: "",
//         loginId: "",
//         password: "",
//       });
//       setShowForm(false);
//       setSelectedSection(null);
//     } catch (err) {
//       console.error("Error adding student:", err);
//       alert("❌ Failed to add student. See console for details.");
//     }
//   };

//   return (
//     <div className="container-fluid p-3">
//       {/* Row 1: Summary Panels */}
//       <div className="row mb-4">
//         <div className="col-md-4">
//           <div className="card shadow-sm p-3 h-100">
//             <h6>Total Classes</h6>
//             <h3>12</h3>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card shadow-sm p-3 h-100">
//             <h6>Total Students</h6>
//             <h3>375</h3>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card shadow-sm p-3 h-100">
//             <h6>Total Teachers</h6>
//             <h3>28</h3>
//           </div>
//         </div>
//       </div>

//       {/* Row 2: Slide-in Add Student Form (scrollable) */}
//       <div className={`slide-panel ${showForm ? "open" : ""}`}>
//         <div className="card shadow-sm p-4 form-scrollable">
//           <h5>Add Student</h5>
//           <form onSubmit={handleSubmit} className="row g-3">
//             {/* Admission No */}
//             <div className="col-md-4">
//               <label className="form-label">Admission No</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="admissionNo"
//                 value={formData.admissionNo}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             {/* First / Last */}
//             <div className="col-md-4">
//               <label className="form-label">First Name</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="firstName"
//                 value={formData.firstName}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="col-md-4">
//               <label className="form-label">Last Name</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="lastName"
//                 value={formData.lastName}
//                 onChange={handleChange}
//               />
//             </div>

//             {/* DOB / Gender */}
//             <div className="col-md-4">
//               <label className="form-label">Date of Birth</label>
//               <input
//                 type="date"
//                 className="form-control"
//                 name="dob"
//                 value={formData.dob}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="col-md-4">
//               <label className="form-label">Gender</label>
//               <select
//                 className="form-select"
//                 name="gender"
//                 value={formData.gender}
//                 onChange={handleChange}
//               >
//                 <option value="M">Male</option>
//                 <option value="F">Female</option>
//                 <option value="O">Other</option>
//               </select>
//             </div>

//             {/* Contact / Photo */}
//             <div className="col-md-4">
//               <label className="form-label">Contact Info</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="contactInfo"
//                 value={formData.contactInfo}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="col-md-6">
//               <label className="form-label">Photo Path</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="photoPath"
//                 value={formData.photoPath}
//                 onChange={handleChange}
//                 placeholder="e.g., /uploads/student1.jpg"
//               />
//             </div>

//             {/* Class select (uses /api/classes if available) */}
//             <div className="col-md-6">
//               <label className="form-label">Class</label>
//               <select
//                 className="form-select"
//                 name="classId"
//                 value={formData.classId}
//                 onChange={handleChange}
//               >
//                 <option value="">Select Class</option>
//                 {classes.length > 0 ? (
//                   classes.map((c) => (
//                     <option key={c.class_id} value={c.class_id}>
//                       {c.class_name}
//                     </option>
//                   ))
//                 ) : (
//                   // fallback: show grade names as non-value options
//                   grades.map((g, i) => (
//                     <option key={`g-${i}`} value="">
//                       {g.grade}
//                     </option>
//                   ))
//                 )}
//               </select>
//             </div>

//             {/* Section */}
//             <div className="col-md-3">
//               <label className="form-label">Section</label>
//               <select
//                 className="form-select"
//                 name="section"
//                 value={formData.section}
//                 onChange={handleChange}
//               >
//                 <option value="A">A</option>
//                 <option value="B">B</option>
//                 <option value="C">C</option>
//                 <option value="D">D</option>
//                 <option value="E">E</option>
//                 <option value="F">F</option>
//               </select>
//             </div>

//             {/* Special Needs */}
//             <div className="col-md-3 d-flex align-items-center">
//               <div className="form-check">
//                 <input
//                   id="specialNeeds"
//                   type="checkbox"
//                   className="form-check-input"
//                   name="specialNeeds"
//                   checked={formData.specialNeeds}
//                   onChange={handleChange}
//                 />
//                 <label htmlFor="specialNeeds" className="form-check-label ms-2">
//                   Special Needs
//                 </label>
//               </div>
//             </div>

//             {/* IEP Details */}
//             <div className="col-12">
//               <label className="form-label">IEP Details</label>
//               <textarea
//                 className="form-control"
//                 name="iepDetails"
//                 value={formData.iepDetails}
//                 onChange={handleChange}
//                 rows={3}
//               />
//             </div>

//             {/* Login / Password */}
//             <div className="col-md-6">
//               <label className="form-label">Login ID</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="loginId"
//                 value={formData.loginId}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="col-md-6">
//               <label className="form-label">Password</label>
//               <input
//                 type="password"
//                 className="form-control"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//               />
//             </div>

//             {/* Actions */}
//             <div className="col-12 mt-3">
//               <button type="submit" className="btn btn-success me-2">
//                 Save
//               </button>
//               <button
//                 type="button"
//                 className="btn btn-secondary"
//                 onClick={() => setShowForm(false)}
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* Row 3: Classes Display */}
//       <div className="card shadow-sm p-3 mt-3">
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <h4>Classes</h4>
//           <button
//             className="btn btn-primary btn-sm"
//             onClick={() => setShowForm(!showForm)}
//           >
//             + Add Student
//           </button>
//         </div>

//         {grades.map((g, idx) => (
//           <div key={idx} className="mb-4">
//             <h5 className="border-bottom pb-1">{g.grade}</h5>
//             <div className="d-flex flex-wrap gap-2">
//               {g.sections.map((section) => {
//                 const key = `${g.grade}-${section}`;
//                 return (
//                   <button
//                     key={key}
//                     className={`btn ${
//                       selectedSection === key ? "btn-success" : "btn-outline-secondary"
//                     }`}
//                     onClick={() => handleSectionClick(g.grade, section)}
//                   >
//                     Section {section}
//                   </button>
//                 );
//               })}
//             </div>

//             {selectedSection?.startsWith(g.grade) && (
//               <div className="mt-3 ps-3">
//                 <h6>Students in {selectedSection}</h6>
//                 <table className="table table-sm table-bordered mt-2">
//                   <thead>
//                     <tr>
//                       <th>Roll No</th>
//                       <th>Name</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {(students[selectedSection] || []).map((s) => (
//                       <tr key={s.id}>
//                         <td>{s.roll}</td>
//                         <td>{s.name}</td>
//                       </tr>
//                     ))}
//                     {!(students[selectedSection] || []).length && (
//                       <tr>
//                         <td colSpan={2} className="text-center text-muted">
//                           No students yet
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default AddStudent;






// // src/components/students/AddStudent.jsx
// import React, { useState } from "react";
// import "./AddStudent.css"; // keep CSS for slide animation

// const AddStudent = () => {
//   const [selectedSection, setSelectedSection] = useState(null);
//   const [showForm, setShowForm] = useState(false);

//   // Dummy data
//   const grades = [
//     { grade: "Grade 1", sections: ["A", "B", "C", "D"] },
//     { grade: "Grade 2", sections: ["A", "B", "C", "D", "E", "F"] },
//     { grade: "Grade 3", sections: ["A", "B", "C", "D"] },
//   ];

//   const students = {
//     "Grade 1-A": [
//       { id: 1, name: "John Doe", roll: "101" },
//       { id: 2, name: "Jane Smith", roll: "102" },
//     ],
//   };

//   return (
//     <div className="container-fluid p-3">
//       {/* Row 1: Summary Panels */}
//       <div className="row mb-4">
//         <div className="col-md-4">
//           <div className="card shadow-sm p-3 h-100">
//             <h6>Total Classes</h6>
//             <h3>12</h3>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card shadow-sm p-3 h-100">
//             <h6>Total Students</h6>
//             <h3>375</h3>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card shadow-sm p-3 h-100">
//             <h6>Total Teachers</h6>
//             <h3>28</h3>
//           </div>
//         </div>
//       </div>

//       {/* Row 2: Animated Add Student Form */}
//       <div className={`slide-panel ${showForm ? "open" : ""}`}>
//         <div
//           className="card shadow-sm p-4"
//           style={{ maxHeight: "70vh", overflowY: "auto" }} // 👈 scrollable
//         >
//           <h5>Add Student</h5>
//           <form>
//             <div className="row g-3">
//               <div className="col-md-6">
//                 <input type="text" className="form-control" placeholder="First Name" />
//               </div>
//               <div className="col-md-6">
//                 <input type="text" className="form-control" placeholder="Last Name" />
//               </div>
//               <div className="col-md-6">
//                 <input type="date" className="form-control" placeholder="Date of Birth" />
//               </div>
//               <div className="col-md-6">
//                 <select className="form-select">
//                   <option>Gender</option>
//                   <option value="M">Male</option>
//                   <option value="F">Female</option>
//                   <option value="O">Other</option>
//                 </select>
//               </div>
//               <div className="col-md-12">
//                 <input type="text" className="form-control" placeholder="Admission No." />
//               </div>
//               <div className="col-md-12">
//                 <input type="text" className="form-control" placeholder="Address" />
//               </div>
//               <div className="col-md-6">
//                 <input type="text" className="form-control" placeholder="Contact Info" />
//               </div>
//               <div className="col-md-6">
//                 <input type="file" className="form-control" placeholder="Photo" />
//               </div>
//               <div className="col-md-6">
//                 <input type="text" className="form-control" placeholder="Login ID" />
//               </div>
//               <div className="col-md-6">
//                 <input type="password" className="form-control" placeholder="Password" />
//               </div>
//             </div>
//             <div className="mt-3">
//               <button type="submit" className="btn btn-success me-2">Save</button>
//               <button
//                 type="button"
//                 className="btn btn-secondary"
//                 onClick={() => setShowForm(false)}
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* Row 3: Classes Display */}
//       <div className="card shadow-sm p-3 mt-3">
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <h4>Classes</h4>
//           <button
//             className="btn btn-primary btn-sm"
//             onClick={() => setShowForm(!showForm)}
//           >
//             + Add Student
//           </button>
//         </div>

//         {grades.map((g, idx) => (
//           <div key={idx} className="mb-4">
//             <h5 className="border-bottom pb-1">{g.grade}</h5>
//             <div className="d-flex flex-wrap gap-2">
//               {g.sections.map((section) => {
//                 const key = `${g.grade}-${section}`;
//                 return (
//                   <button
//                     key={key}
//                     className={`btn ${
//                       selectedSection === key ? "btn-success" : "btn-outline-secondary"
//                     }`}
//                     onClick={() =>
//                       setSelectedSection(selectedSection === key ? null : key)
//                     }
//                   >
//                     Section {section}
//                   </button>
//                 );
//               })}
//             </div>

//             {selectedSection?.startsWith(g.grade) && (
//               <div className="mt-3 ps-3">
//                 <h6>Students in {selectedSection}</h6>
//                 <table className="table table-sm table-bordered mt-2">
//                   <thead>
//                     <tr>
//                       <th>Roll No</th>
//                       <th>Name</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {(students[selectedSection] || []).map((s) => (
//                       <tr key={s.id}>
//                         <td>{s.roll}</td>
//                         <td>{s.name}</td>
//                       </tr>
//                     ))}
//                     {!(students[selectedSection] || []).length && (
//                       <tr>
//                         <td colSpan={2} className="text-center text-muted">
//                           No students yet
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default AddStudent;





// Has some problems

// // src/components/students/AddStudent.jsx
// import React, { useState, useEffect } from "react";
// import "./AddStudent.css"; // keep your slide animation styles

// const AddStudent = () => {
//   const [selectedSection, setSelectedSection] = useState(null);
//   const [showForm, setShowForm] = useState(false);

//   // Form state
//   const [formData, setFormData] = useState({
//     admissionNo: "",
//     firstName: "",
//     lastName: "",
//     dob: "",
//     gender: "M",
//     address: "",
//     contactInfo: "",
//     photoPath: "",
//     classId: "",
//     section: "A",
//     specialNeeds: false,
//     iepDetails: "",
//     loginId: "",
//     password: "",
//   });

//   const [classes, setClasses] = useState([]);

//   // Dummy data (replace with backend later)
//   const grades = [
//     { grade: "Grade 1", sections: ["A", "B", "C", "D"] },
//     { grade: "Grade 2", sections: ["A", "B", "C", "D", "E", "F"] },
//     { grade: "Grade 3", sections: ["A", "B", "C", "D"] },
//   ];

//   const students = {
//     "Grade 1-A": [
//       { id: 1, name: "John Doe", roll: "101" },
//       { id: 2, name: "Jane Smith", roll: "102" },
//     ],
//   };

//   useEffect(() => {
//     const fetchClasses = async () => {
//       try {
//         const res = await fetch("http://localhost:5050/api/classes");
//         const data = await res.json();
//         setClasses(data);
//       } catch (err) {
//         console.error("Error fetching classes:", err);
//       }
//     };
//     fetchClasses();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const payload = {
//       ...formData,
//       passwordHash: formData.password,
//     };

//     try {
//       const res = await fetch("http://localhost:5050/api/students", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) throw new Error("Failed to add student");
//       await res.json();

//       alert("✅ Student added successfully!");
//       setFormData({
//         admissionNo: "",
//         firstName: "",
//         lastName: "",
//         dob: "",
//         gender: "M",
//         address: "",
//         contactInfo: "",
//         photoPath: "",
//         classId: "",
//         section: "A",
//         specialNeeds: false,
//         iepDetails: "",
//         loginId: "",
//         password: "",
//       });
//       setShowForm(false);
//     } catch (err) {
//       console.error("Error adding student:", err);
//       alert("❌ Failed to add student.");
//     }
//   };

//   return (
//     <div className="container-fluid p-3">
//       {/* Row 1: Summary Panels */}
//       <div className="row mb-4">
//         <div className="col-md-4">
//           <div className="card shadow-sm p-3 h-100">
//             <h6>Total Classes</h6>
//             <h3>12</h3>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card shadow-sm p-3 h-100">
//             <h6>Total Students</h6>
//             <h3>375</h3>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card shadow-sm p-3 h-100">
//             <h6>Total Teachers</h6>
//             <h3>28</h3>
//           </div>
//         </div>
//       </div>

//       {/* Row 2: Slide-in Add Student Form */}
//       <div className={`slide-panel ${showForm ? "open" : ""}`}>
//         <div className="card shadow-sm p-4">
//           <h5>Add Student</h5>
//           <form onSubmit={handleSubmit} className="row g-3">
//             <div className="col-md-6">
//               <input
//                 type="text"
//                 className="form-control"
//                 name="firstName"
//                 placeholder="First Name"
//                 value={formData.firstName}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="col-md-6">
//               <input
//                 type="text"
//                 className="form-control"
//                 name="lastName"
//                 placeholder="Last Name"
//                 value={formData.lastName}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="col-md-6">
//               <input
//                 type="date"
//                 className="form-control"
//                 name="dob"
//                 value={formData.dob}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="col-md-6">
//               <select
//                 className="form-select"
//                 name="gender"
//                 value={formData.gender}
//                 onChange={handleChange}
//               >
//                 <option value="M">Male</option>
//                 <option value="F">Female</option>
//                 <option value="O">Other</option>
//               </select>
//             </div>
//             <div className="col-md-12">
//               <input
//                 type="text"
//                 className="form-control"
//                 name="admissionNo"
//                 placeholder="Admission No."
//                 value={formData.admissionNo}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="col-md-12">
//               <textarea
//                 className="form-control"
//                 name="address"
//                 placeholder="Address"
//                 value={formData.address}
//                 onChange={handleChange}
//               ></textarea>
//             </div>
//             <div className="col-md-6">
//               <input
//                 type="text"
//                 className="form-control"
//                 name="contactInfo"
//                 placeholder="Contact Info"
//                 value={formData.contactInfo}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="col-md-6">
//               <select
//                 className="form-select"
//                 name="classId"
//                 value={formData.classId}
//                 onChange={handleChange}
//               >
//                 <option value="">Select Class</option>
//                 {classes.map((cls) => (
//                   <option key={cls.class_id} value={cls.class_id}>
//                     {cls.class_name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="col-md-6">
//               <select
//                 className="form-select"
//                 name="section"
//                 value={formData.section}
//                 onChange={handleChange}
//               >
//                 <option value="A">Section A</option>
//                 <option value="B">Section B</option>
//                 <option value="C">Section C</option>
//                 <option value="D">Section D</option>
//               </select>
//             </div>
//             <div className="col-md-6 form-check mt-2">
//               <input
//                 type="checkbox"
//                 className="form-check-input"
//                 name="specialNeeds"
//                 checked={formData.specialNeeds}
//                 onChange={handleChange}
//               />
//               <label className="form-check-label">Special Needs</label>
//             </div>
//             <div className="col-md-12">
//               <textarea
//                 className="form-control"
//                 name="iepDetails"
//                 placeholder="IEP Details"
//                 value={formData.iepDetails}
//                 onChange={handleChange}
//               ></textarea>
//             </div>
//             <div className="col-md-6">
//               <input
//                 type="text"
//                 className="form-control"
//                 name="loginId"
//                 placeholder="Login ID"
//                 value={formData.loginId}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="col-md-6">
//               <input
//                 type="password"
//                 className="form-control"
//                 name="password"
//                 placeholder="Password"
//                 value={formData.password}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="col-12 mt-3">
//               <button type="submit" className="btn btn-success me-2">
//                 Save
//               </button>
//               <button
//                 type="button"
//                 className="btn btn-secondary"
//                 onClick={() => setShowForm(false)}
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* Row 3: Classes Display */}
//       <div className="card shadow-sm p-3 mt-3">
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <h4>Classes</h4>
//           <button
//             className="btn btn-primary btn-sm"
//             onClick={() => setShowForm(!showForm)}
//           >
//             + Add Student
//           </button>
//         </div>

//         {grades.map((g, idx) => (
//           <div key={idx} className="mb-4">
//             <h5 className="border-bottom pb-1">{g.grade}</h5>
//             <div className="d-flex flex-wrap gap-2">
//               {g.sections.map((section) => {
//                 const key = `${g.grade}-${section}`;
//                 return (
//                   <button
//                     key={key}
//                     className={`btn ${
//                       selectedSection === key ? "btn-success" : "btn-outline-secondary"
//                     }`}
//                     onClick={() =>
//                       setSelectedSection(selectedSection === key ? null : key)
//                     }
//                   >
//                     Section {section}
//                   </button>
//                 );
//               })}
//             </div>

//             {selectedSection?.startsWith(g.grade) && (
//               <div className="mt-3 ps-3">
//                 <h6>Students in {selectedSection}</h6>
//                 <table className="table table-sm table-bordered mt-2">
//                   <thead>
//                     <tr>
//                       <th>Roll No</th>
//                       <th>Name</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {(students[selectedSection] || []).map((s) => (
//                       <tr key={s.id}>
//                         <td>{s.roll}</td>
//                         <td>{s.name}</td>
//                       </tr>
//                     ))}
//                     {!(students[selectedSection] || []).length && (
//                       <tr>
//                         <td colSpan={2} className="text-center text-muted">
//                           No students yet
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default AddStudent;





// Animated

// // src/components/students/AddStudent.jsx
// import React, { useState } from "react";
// import "./AddStudent.css"; // 👈 new CSS file for animation

// const AddStudent = () => {
//   const [selectedSection, setSelectedSection] = useState(null);
//   const [showForm, setShowForm] = useState(false);

//   // Dummy data
//   const grades = [
//     { grade: "Grade 1", sections: ["A", "B", "C", "D"] },
//     { grade: "Grade 2", sections: ["A", "B", "C", "D", "E", "F"] },
//     { grade: "Grade 3", sections: ["A", "B", "C", "D"] },
//   ];

//   const students = {
//     "Grade 1-A": [
//       { id: 1, name: "John Doe", roll: "101" },
//       { id: 2, name: "Jane Smith", roll: "102" },
//     ],
//   };

//   return (
//     <div className="container-fluid p-3">
//       {/* Row 1: Summary Panels */}
//       <div className="row mb-4">
//         <div className="col-md-4">
//           <div className="card shadow-sm p-3 h-100">
//             <h6>Total Classes</h6>
//             <h3>12</h3>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card shadow-sm p-3 h-100">
//             <h6>Total Students</h6>
//             <h3>375</h3>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card shadow-sm p-3 h-100">
//             <h6>Total Teachers</h6>
//             <h3>28</h3>
//           </div>
//         </div>
//       </div>

//       {/* Row 2: Animated Add Student Form */}
//       <div className={`slide-panel ${showForm ? "open" : ""}`}>
//         <div className="card shadow-sm p-4">
//           <h5>Add Student</h5>
//           <form>
//             <div className="row g-3">
//               <div className="col-md-6">
//                 <input type="text" className="form-control" placeholder="First Name" />
//               </div>
//               <div className="col-md-6">
//                 <input type="text" className="form-control" placeholder="Last Name" />
//               </div>
//               <div className="col-md-6">
//                 <input type="date" className="form-control" placeholder="Date of Birth" />
//               </div>
//               <div className="col-md-6">
//                 <select className="form-select">
//                   <option>Gender</option>
//                   <option value="M">Male</option>
//                   <option value="F">Female</option>
//                   <option value="O">Other</option>
//                 </select>
//               </div>
//               <div className="col-md-12">
//                 <input type="text" className="form-control" placeholder="Admission No." />
//               </div>
//             </div>
//             <div className="mt-3">
//               <button type="submit" className="btn btn-success me-2">Save</button>
//               <button
//                 type="button"
//                 className="btn btn-secondary"
//                 onClick={() => setShowForm(false)}
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* Row 3: Classes Display */}
//       <div className="card shadow-sm p-3 mt-3">
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <h4>Classes</h4>
//           <button
//             className="btn btn-primary btn-sm"
//             onClick={() => setShowForm(!showForm)}
//           >
//             + Add Student
//           </button>
//         </div>

//         {grades.map((g, idx) => (
//           <div key={idx} className="mb-4">
//             <h5 className="border-bottom pb-1">{g.grade}</h5>
//             <div className="d-flex flex-wrap gap-2">
//               {g.sections.map((section) => {
//                 const key = `${g.grade}-${section}`;
//                 return (
//                   <button
//                     key={key}
//                     className={`btn ${
//                       selectedSection === key ? "btn-success" : "btn-outline-secondary"
//                     }`}
//                     onClick={() =>
//                       setSelectedSection(selectedSection === key ? null : key)
//                     }
//                   >
//                     Section {section}
//                   </button>
//                 );
//               })}
//             </div>

//             {selectedSection?.startsWith(g.grade) && (
//               <div className="mt-3 ps-3">
//                 <h6>Students in {selectedSection}</h6>
//                 <table className="table table-sm table-bordered mt-2">
//                   <thead>
//                     <tr>
//                       <th>Roll No</th>
//                       <th>Name</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {(students[selectedSection] || []).map((s) => (
//                       <tr key={s.id}>
//                         <td>{s.roll}</td>
//                         <td>{s.name}</td>
//                       </tr>
//                     ))}
//                     {!(students[selectedSection] || []).length && (
//                       <tr>
//                         <td colSpan={2} className="text-center text-muted">
//                           No students yet
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default AddStudent;



// Basic
// // src/components/students/AddStudent.jsx
// import React, { useState } from "react";

// const AddStudent = () => {
//   const [selectedSection, setSelectedSection] = useState(null);
//   const [showForm, setShowForm] = useState(false);

//   // Dummy data
//   const grades = [
//     { grade: "Grade 1", sections: ["A", "B", "C", "D"] },
//     { grade: "Grade 2", sections: ["A", "B", "C", "D", "E", "F"] },
//     { grade: "Grade 3", sections: ["A", "B", "C", "D"] },
//   ];

//   const students = {
//     "Grade 1-A": [
//       { id: 1, name: "John Doe", roll: "101" },
//       { id: 2, name: "Jane Smith", roll: "102" },
//     ],
//     "Grade 2-B": [
//       { id: 1, name: "Michael Lee", roll: "201" },
//       { id: 2, name: "Sara Khan", roll: "202" },
//     ],
//   };

//   return (
//     <div className="container-fluid p-3">
//       {/* Row 1: Summary Panels */}
//       <div className="row mb-4">
//         <div className="col-md-4">
//           <div className="card shadow-sm p-3 h-100">
//             <h6>Total Classes</h6>
//             <h3>12</h3>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card shadow-sm p-3 h-100">
//             <h6>Total Students</h6>
//             <h3>375</h3>
//           </div>
//         </div>
//         <div className="col-md-4">
//           <div className="card shadow-sm p-3 h-100">
//             <h6>Total Teachers</h6>
//             <h3>28</h3>
//           </div>
//         </div>
//       </div>

//       {/* Row 2: Hidden Add Student Form */}
//       {showForm && (
//         <div className="card shadow-sm p-4 mb-4">
//           <h5>Add Student</h5>
//           <form>
//             <div className="row g-3">
//               <div className="col-md-6">
//                 <input type="text" className="form-control" placeholder="First Name" />
//               </div>
//               <div className="col-md-6">
//                 <input type="text" className="form-control" placeholder="Last Name" />
//               </div>
//               <div className="col-md-6">
//                 <input type="date" className="form-control" placeholder="Date of Birth" />
//               </div>
//               <div className="col-md-6">
//                 <select className="form-select">
//                   <option>Gender</option>
//                   <option value="M">Male</option>
//                   <option value="F">Female</option>
//                   <option value="O">Other</option>
//                 </select>
//               </div>
//               <div className="col-md-12">
//                 <input type="text" className="form-control" placeholder="Admission No." />
//               </div>
//             </div>
//             <div className="mt-3">
//               <button type="submit" className="btn btn-success me-2">Save</button>
//               <button
//                 type="button"
//                 className="btn btn-secondary"
//                 onClick={() => setShowForm(false)}
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* Row 3: Classes Display */}
//       <div className="card shadow-sm p-3">
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <h4>Classes</h4>
//           <button
//             className="btn btn-primary btn-sm"
//             onClick={() => setShowForm(!showForm)}
//           >
//             + Add Student
//           </button>
//         </div>

//         {grades.map((g, idx) => (
//           <div key={idx} className="mb-4">
//             <h5 className="border-bottom pb-1">{g.grade}</h5>
//             <div className="d-flex flex-wrap gap-2">
//               {g.sections.map((section) => {
//                 const key = `${g.grade}-${section}`;
//                 return (
//                   <button
//                     key={key}
//                     className={`btn ${
//                       selectedSection === key
//                         ? "btn-success"
//                         : "btn-outline-secondary"
//                     }`}
//                     onClick={() =>
//                       setSelectedSection(
//                         selectedSection === key ? null : key
//                       )
//                     }
//                   >
//                     Section {section}
//                   </button>
//                 );
//               })}
//             </div>

//             {/* Show student list if section clicked */}
//             {selectedSection?.startsWith(g.grade) && (
//               <div className="mt-3 ps-3">
//                 <h6>Students in {selectedSection}</h6>
//                 <table className="table table-sm table-bordered mt-2">
//                   <thead>
//                     <tr>
//                       <th>Roll No</th>
//                       <th>Name</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {(students[selectedSection] || []).map((s) => (
//                       <tr key={s.id}>
//                         <td>{s.roll}</td>
//                         <td>{s.name}</td>
//                       </tr>
//                     ))}
//                     {!(students[selectedSection] || []).length && (
//                       <tr>
//                         <td colSpan={2} className="text-center text-muted">
//                           No students yet
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default AddStudent;



// const AddStudent = () => (
//     <div className="p-4">
//       <h2>Add Student</h2>
//       <p>Placeholder content for adding a student.</p>
//     </div>
//   );
  
//   export default AddStudent;
  
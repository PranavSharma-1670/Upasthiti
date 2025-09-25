// self attemt at making it
import React, { useState, useEffect } from "react";
import "./AddStudent.css";

const AddStudent = () => {
  const [classesWithSections, setClassesWithSections] = useState({});
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [studentsList, setStudentsList] = useState([]);

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
  // const [students, setStudents] = useState({}); // { "Grade 1-A": [{...}, ...] }
  const [students, setStudents] = useState([]);

  // Fetch classes from backend
  // useEffect(() => {
  //   const fetchClasses = async () => {
  //     try {
  //       const res = await fetch("http://localhost:5050/api/students/classes");
  //       if (!res.ok) throw new Error("Failed to fetch classes");
  //       const data = await res.json();
  //       setClasses(data || []);
  //     } catch (err) {
  //       console.error("Error fetching classes:", err.message);
  //     }
  //   };
  //   fetchClasses();
  // }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("http://localhost:5050/api/students/classes");
        const data = await res.json();
        setClassesWithSections(data);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    fetchClasses();
  }, []);

  // handle inputs including checkbox
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Clicking a Section button: toggle selection, fetch students
  const handleSectionClick = async (classObj, section) => {
    const key = `${classObj.class_name}-${section}`;
    const newSelected = selectedSection === key ? null : key;
    setSelectedSection(newSelected);

    if (newSelected) {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      admission_no: formData.admissionNo,
      first_name: formData.firstName,
      last_name: formData.lastName,
      dob: formData.dob || null,
      gender: formData.gender,
      address: formData.address,
      contact_info: formData.contactInfo,
      photo_path: formData.photoPath,
      class_id: formData.classId || null,
      section: formData.section || null,
      special_needs: formData.specialNeeds,
      iep_details: formData.iepDetails,
      login_id: formData.loginId,
      password_hash: formData.password, // hash on server in production
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
      setSelectedSection(null);

      // refresh students list for this section
      if (payload.class_id && payload.section) {
        const key = `${classes.find(c => c.class_id === payload.class_id).class_name}-${payload.section}`;
        const resStudents = await fetch(
          `http://localhost:5050/api/students?class_id=${payload.class_id}&section=${payload.section}`
        );
        const updatedStudents = await resStudents.json();
        setStudents((prev) => ({ ...prev, [key]: updatedStudents }));
      }
    } catch (err) {
      console.error("Error adding student:", err);
      alert("❌ Failed to add student. See console for details.");
    }
  };

  const handleSearch = async () => {
    if (!selectedGrade || !selectedSection) {
      alert("Please select both grade and section");
      return;
    }
  
    try {
      const res = await fetch(
        `http://localhost:5050/api/students/${selectedGrade}/${selectedSection}`
      );
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  // const handleSearch = async () => {
  //   if (!selectedGrade || !selectedSection) return;
  
  //   try {
  //     // find the class_id corresponding to the selected grade
  //     const classEntry = classes.find((c) => c.class_name === selectedGrade);
  //     if (!classEntry) return;
  
  //     const res = await fetch(
  //       `http://localhost:5050/api/students?class_id=${classEntry.class_id}&section=${selectedSection}`
  //     );
  //     if (!res.ok) throw new Error("Failed to fetch students");
  //     const data = await res.json();
  //     setStudentsList(data);
  //   } catch (err) {
  //     console.error("Error fetching students:", err);
  //     setStudentsList([]);
  //   }
  // };
  

  return (
    <div className="container-fluid p-3">
      {/* Row 1: Summary Panels */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm p-3 h-100">
            <h6>Total Classes</h6>
            <h3>{classes.length}</h3>
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

        {/* Filters Row */}
        <div className="row g-3 align-items-center mb-3">
          {/* Grade Dropdown */}
          <div className="col-md-4">
            <label className="form-label">Select Grade</label>
            <select
              className="form-select"
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedSection("");
              }}
            >
              <option value="">-- Select Grade --</option>
              {Object.keys(classesWithSections).map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>

          {/* Section Dropdown */}
          <div className="col-md-4">
            <label className="form-label">Select Section</label>
            <select
              className="form-select"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={!selectedGrade}
            >
              <option value="">-- Select Section --</option>
              {selectedGrade &&
                classesWithSections[selectedGrade]?.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
            </select>
          </div>

          {/* Search Button */}
          <div className="col-md-4 d-flex align-items-end">
            <button className="btn btn-success w-100" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>

        <div className="mt-3">
          <h5>Students in {selectedGrade} - {selectedSection}</h5>
          {students.length === 0 ? (
            <p>No students found.</p>
          ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Admission No</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>DOB</th>
                  <th>Gender</th>
                  <th>Contact</th>
                  <th>Grade</th>
                  <th>Section</th>
                  <th>Class Teacher</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.student_id}>
                    <td>{s.admission_no}</td>
                    <td>{s.first_name}</td>
                    <td>{s.last_name}</td>
                    <td>{s.dob}</td>
                    <td>{s.gender}</td>
                    <td>{s.contact_info}</td>
                    <td>{s.class_name}</td>
                    <td>{s.class_section}</td>
                    <td>{s.class_teacher}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>


        {/* {studentsList.length > 0 && (
          <div className="mt-3">
            <h5>Students in {selectedGrade} - {selectedSection}</h5>
            <div className="table-responsive">
              <table className="table table-striped table-bordered">
                <thead>
                  <tr>
                    <th>Admission No</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>DOB</th>
                    <th>Gender</th>
                    <th>Contact</th>
                    <th>Section</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsList.map((student) => (
                    <tr key={student.admission_no}>
                      <td>{student.admission_no}</td>
                      <td>{student.first_name}</td>
                      <td>{student.last_name}</td>
                      <td>{student.dob}</td>
                      <td>{student.gender}</td>
                      <td>{student.contact_info}</td>
                      <td>{student.section}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )} */}


      </div>

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

      </div> */}
      
    </div>
  );
};

export default AddStudent;





// const AddStudent = () => (
//   <div className="p-4">
//     <h2>Add Student</h2>
//     <p>Placeholder content for adding a student.</p>
//   </div>
// );

// export default AddStudent;


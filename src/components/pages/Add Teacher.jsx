import React, { useState, useEffect } from 'react';
import './AddStudent.css'; // We can reuse the same CSS for a consistent look

const AddTeacher = () => {
  const [teachersList, setTeachersList] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Form state for adding a new teacher
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    subjects: '', // Will be handled as a comma-separated string
    contactInfo: '',
    role: 'Subject Teacher', // Default role
  });

  // Fetch all teachers when the component mounts
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        // We will create this API endpoint in the next step
        const res = await fetch('http://localhost:5050/api/teachers');
        if (!res.ok) throw new Error('Failed to fetch teachers');
        const data = await res.json();
        setTeachersList(data);
      } catch (err) {
        console.error(err.message);
        // Handle error state in a real app (e.g., show a notification)
      }
    };
    fetchTeachers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // The backend will expect subjects as an array, so we format it here
    const payload = {
      ...formData,
      // Split the string by commas and trim whitespace from each subject
      subjects: formData.subjects.split(',').map(subject => subject.trim()),
    };
    
    try {
      // We will also create this POST endpoint in the next step
      const res = await fetch('http://localhost:5050/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Failed to add teacher: ${res.status}`);
      }

      const newTeacher = await res.json();
      
      // Add the new teacher to the list and reset the form
      setTeachersList((prev) => [...prev, newTeacher]);
      alert('✅ Teacher added successfully!');
      
      setFormData({
        firstName: '',
        lastName: '',
        subjects: '',
        contactInfo: '',
        role: 'Subject Teacher',
      });
      setShowForm(false);

    } catch (err) {
      console.error('Error adding teacher:', err);
      alert('❌ Failed to add teacher. See console for details.');
    }
  };

  return (
    <div className="container-fluid p-3">
      {/* Row 1: Summary Panels */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm p-3 h-100">
            <h6>Total Teachers</h6>
            <h3>{teachersList.length}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm p-3 h-100">
            {/* Placeholder Stat */}
            <h6>Class Teachers</h6>
            <h3>{teachersList.filter(t => t.role === 'Class Teacher').length}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm p-3 h-100">
            {/* Placeholder Stat */}
            <h6>Subject Teachers</h6>
            <h3>{teachersList.filter(t => t.role === 'Subject Teacher').length}</h3>
          </div>
        </div>
      </div>

      {/* Row 2: Slide-in Add Teacher Form */}
      <div className={`slide-panel ${showForm ? 'open' : ''}`}>
        <div className="card shadow-sm p-4 form-scrollable">
          <h5>Add New Teacher</h5>
          <form onSubmit={handleSubmit} className="row g-3">
            {/* First Name / Last Name */}
            <div className="col-md-6">
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
            <div className="col-md-6">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-control"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            {/* Role */}
            <div className="col-md-6">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Subject Teacher">Subject Teacher</option>
                <option value="Class Teacher">Class Teacher</option>
                <option value="Non-Teaching Staff">Non-Teaching Staff</option>
              </select>
            </div>

            {/* Contact Info */}
            <div className="col-md-6">
              <label className="form-label">Contact Info (Email or Phone)</label>
              <input
                type="text"
                className="form-control"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleChange}
              />
            </div>

            {/* Subjects */}
            <div className="col-12">
              <label className="form-label">Subjects Taught</label>
              <input
                type="text"
                className="form-control"
                name="subjects"
                value={formData.subjects}
                onChange={handleChange}
                placeholder="e.g., Math, Science, English"
              />
              <div className="form-text">
                Enter subjects separated by a comma.
              </div>
            </div>

            {/* Login ID and Password Info */}
            <div className='col-12 mt-3'>
                <div className="alert alert-info py-2">
                    <strong>Note:</strong> A Login ID and a temporary password will be auto-generated upon saving.
                </div>
            </div>

            {/* Actions */}
            <div className="col-12 mt-3">
              <button type="submit" className="btn btn-success me-2">
                Save Teacher
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
      
      {/* Row 3: Teachers List Display */}
      <div className="card shadow-sm p-3 mt-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Teacher Records</h4>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowForm(!showForm)}
          >
            + Add Teacher
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-light">
              <tr>
                <th>Login ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Role</th>
                <th>Subjects</th>
                <th>Contact Info</th>
              </tr>
            </thead>
            <tbody>
              {teachersList.length > 0 ? (
                teachersList.map((teacher) => (
                  <tr key={teacher.teacher_id}>
                    <td>{teacher.login_id}</td>
                    <td>{teacher.first_name}</td>
                    <td>{teacher.last_name}</td>
                    <td>{teacher.role}</td>
                    <td>{teacher.subjects.join(', ')}</td>
                    <td>{teacher.contact_info}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">No teachers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AddTeacher;




// const AddTeacher = () => (
//     <div className="p-4">
//       <h2>Add Teachert</h2>
//       <p>Placeholder content for Adding a Teacher.</p>
//     </div>
//   );
  
//   export default AddTeacher;
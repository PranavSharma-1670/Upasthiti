import React, { useState, useEffect } from 'react';
import './AddStudent.css';

const ModifyClassRecords = () => {
    // --- EXISTING STATE ---
    const [stats, setStats] = useState({ classCount: 0, studentCount: 0, teacherCount: 0 });
    const [viewMode, setViewMode] = useState('class');
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = [1, 2, 3, 4, 5, 6, 7, 8];
    const [showModifier, setShowModifier] = useState(false);
    const [classesList, setClassesList] = useState([]);
    const [teachersList, setTeachersList] = useState([]);
    const [subjectsList, setSubjectsList] = useState([]);
    const [modifierData, setModifierData] = useState({
        class_id: '',
        teacher_id: '',
        subject_id: '',
        day_of_week: '1',
        period_number: '1'
    });
    // --- NEW STATE for dynamic grid ---
    const [selectedId, setSelectedId] = useState(''); // ID of the selected class or teacher
    const [timetableData, setTimetableData] = useState({}); // Holds the fetched schedule
    // --- NEW STATE for Promotion Modal ---
    const [showPromotionModal, setShowPromotionModal] = useState(false);
    const [sourceClassId, setSourceClassId] = useState('');
    const [destClassId, setDestClassId] = useState('');

    // --- useEffect to fetch all lists ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, classesRes, teachersRes, subjectsRes] = await Promise.all([
                    fetch('http://localhost:5050/api/records/stats'),
                    fetch('http://localhost:5050/api/records/classes-list'),
                    fetch('http://localhost:5050/api/records/teachers-list'),
                    fetch('http://localhost:5050/api/records/subjects-list')
                ]);
                setStats(await statsRes.json());
                setClassesList(await classesRes.json());
                setTeachersList(await teachersRes.json());
                setSubjectsList(await subjectsRes.json());
            } catch (err) {
                console.error("Failed to fetch page data:", err);
            }
        };
        fetchData();
    }, []);

    // --- NEW: useEffect to fetch timetable when selection changes ---
    useEffect(() => {
        const fetchTimetable = async () => {
            if (!selectedId) {
                setTimetableData({}); // Clear the grid if nothing is selected
                return;
            }
            try {
                const res = await fetch(`http://localhost:5050/api/records/timetable?view=${viewMode}&id=${selectedId}`);
                const data = await res.json();
                
                // Convert the array of entries into an object for easy lookup
                const scheduleMap = {};
                for (const entry of data) {
                    const key = `${entry.day_of_week}_${entry.period_number}`;
                    scheduleMap[key] = entry;
                }
                setTimetableData(scheduleMap);
            } catch (err) {
                console.error("Failed to fetch timetable:", err);
            }
        };
        fetchTimetable();
    }, [selectedId, viewMode]); // Re-run this effect when selectedId or viewMode changes

    const handleViewSelectionChange = (e) => {
        setSelectedId(e.target.value);
    };
    
    // --- UPDATED: handleSubmit now refreshes the grid ---
    const handleModifierSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5050/api/records/timetable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(modifierData)
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed to add entry');
            
            alert('✅ Timetable entry added successfully!');
            setShowModifier(false);

            // --- REFRESH GRID: Re-fetch timetable data after adding an entry ---
            if (selectedId) {
                const timetableRes = await fetch(`http://localhost:5050/api/records/timetable?view=${viewMode}&id=${selectedId}`);
                const data = await timetableRes.json();
                const scheduleMap = {};
                for (const entry of data) {
                    const key = `${entry.day_of_week}_${entry.period_number}`;
                    scheduleMap[key] = entry;
                }
                setTimetableData(scheduleMap);
            }
            
        } catch (err) {
            console.error(err.message);
            alert(`❌ Error: ${err.message}`);
        }
    };
    
    // (Other handlers like handleModifierChange remain the same)
    const handleModifierChange = (e) => {
        const { name, value } = e.target;
        setModifierData(prev => ({ ...prev, [name]: value }));
    };

    // --- NEW: Handler for submitting the promotion ---
    const handlePromotionSubmit = async (e) => {
      e.preventDefault();
      if (!sourceClassId || !destClassId) {
          alert("Please select both a source and a destination class.");
          return;
      }
      if (sourceClassId === destClassId) {
          alert("Source and destination classes cannot be the same.");
          return;
      }

      // Confirmation dialog
      if (!window.confirm("Are you sure you want to promote all students from the selected class? This action cannot be undone.")) {
          return;
      }

      try {
          const res = await fetch('http://localhost:5050/api/records/promote-class', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sourceClassId, destClassId })
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.error || 'Promotion failed');

          alert(`✅ Success! ${result.studentsMoved} students were promoted.`);
          setShowPromotionModal(false);
          setSourceClassId('');
          setDestClassId('');

      } catch (err) {
          alert(`❌ Error: ${err.message}`);
          console.error(err);
      }
    };

    return (
        <div className="container-fluid p-3">
            {/* Summary Panels */}
            <div className="row mb-4">
                <div className="col-md-4"><div className="card shadow-sm p-3 h-100"><h6>Total Classes</h6><h3>{stats.classCount}</h3></div></div>
                <div className="col-md-4"><div className="card shadow-sm p-3 h-100"><h6>Total Students</h6><h3>{stats.studentCount}</h3></div></div>
                <div className="col-md-4"><div className="card shadow-sm p-3 h-100"><h6>Total Teachers</h6><h3>{stats.teacherCount}</h3></div></div>
            </div>

            {/* Slide-in Timetable Modifier */}
            <div className={`slide-panel ${showModifier ? 'open' : ''}`}>
                <div className="card shadow-sm p-4 form-scrollable">
                    {/* ... Modifier Form JSX is unchanged ... */}
                    <h5>Add/Edit Timetable Slot</h5>
                    <form onSubmit={handleModifierSubmit} className="row g-3">
                        <div className="col-md-12"><label className="form-label">Class</label><select name="class_id" value={modifierData.class_id} onChange={handleModifierChange} className="form-select" required><option value="">Select a Class</option>{classesList.map(c => <option key={c.class_id} value={c.class_id}>{c.class_name} - {c.section}</option>)}</select></div>
                        <div className="col-md-12"><label className="form-label">Teacher</label><select name="teacher_id" value={modifierData.teacher_id} onChange={handleModifierChange} className="form-select" required><option value="">Select a Teacher</option>{teachersList.map(t => <option key={t.teacher_id} value={t.teacher_id}>{t.first_name} {t.last_name}</option>)}</select></div>
                        <div className="col-md-12"><label className="form-label">Subject</label><select name="subject_id" value={modifierData.subject_id} onChange={handleModifierChange} className="form-select" required><option value="">Select a Subject</option>{subjectsList.map(s => <option key={s.subject_id} value={s.subject_id}>{s.name}</option>)}</select></div>
                        <div className="col-md-6"><label className="form-label">Day of Week</label><select name="day_of_week" value={modifierData.day_of_week} onChange={handleModifierChange} className="form-select" required><option value="1">Monday</option><option value="2">Tuesday</option><option value="3">Wednesday</option><option value="4">Thursday</option><option value="5">Friday</option></select></div>
                        <div className="col-md-6"><label className="form-label">Period</label><select name="period_number" value={modifierData.period_number} onChange={handleModifierChange} className="form-select" required>{periods.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                        <div className="col-12 mt-4"><button type="submit" className="btn btn-success me-2">Save Slot</button><button type="button" className="btn btn-secondary" onClick={() => setShowModifier(false)}>Cancel</button></div>
                    </form>
                </div>
            </div>

            {/* Timetable Management Section */}
            <div className="card shadow-sm p-3 mt-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4>Timetable Management</h4>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowModifier(true)}>+ Modify Timetable</button>
                </div>

                {/* --- UPDATED: Filters are now functional --- */}
                <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                    <div className="btn-group">
                        <button className={`btn btn-sm ${viewMode === 'class' ? 'btn-success' : 'btn-outline-secondary'}`} onClick={() => { setViewMode('class'); setSelectedId(''); }}>Class-wise View</button>
                        <button className={`btn btn-sm ${viewMode === 'teacher' ? 'btn-success' : 'btn-outline-secondary'}`} onClick={() => { setViewMode('teacher'); setSelectedId(''); }}>Teacher-wise View</button>
                    </div>
                    <div className="w-50">
                        <select className="form-select form-select-sm" value={selectedId} onChange={handleViewSelectionChange}>
                            <option value="">{viewMode === 'class' ? '-- Select a Class --' : '-- Select a Teacher --'}</option>
                            {viewMode === 'class'
                                ? classesList.map(c => <option key={c.class_id} value={c.class_id}>{c.class_name} - {c.section}</option>)
                                : teachersList.map(t => <option key={t.teacher_id} value={t.teacher_id}>{t.first_name} {t.last_name}</option>)
                            }
                        </select>
                    </div>
                </div>

                {/* --- UPDATED: Timetable Grid is now dynamic --- */}
                <div className="table-responsive">
                    <table className="table table-bordered text-center timetable">
                        <thead>
                            <tr><th>Period #</th>{days.map(day => <th key={day}>{day}</th>)}</tr>
                        </thead>
                        <tbody>
                            {periods.map(period => (
                                <tr key={period}>
                                    <td><strong>Period {period}</strong></td>
                                    {days.map((day, dayIndex) => {
                                        const key = `${dayIndex + 1}_${period}`;
                                        const entry = timetableData[key];
                                        return (
                                            <td key={key}>
                                                {entry ? (
                                                    <div>
                                                        <div className="fw-bold">{entry.subject_name}</div>
                                                        <div className="small text-muted">
                                                            {viewMode === 'class' ? `${entry.teacher_first_name} ${entry.teacher_last_name}` : `${entry.class_name} - ${entry.section}`}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-muted small">Empty</div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Promotion Section
            <div className="card shadow-sm p-3 mt-4">
                <div className="row g-3 align-items-center"><div className="col-md-8"><h4 className="mb-2">Student & Class Promotion</h4><p className="mb-0 text-muted">Use these tools to promote students to the next grade.</p></div><div className="col-md-4 d-flex justify-content-end"><button className="btn btn-warning">Launch Promotion Tools</button></div></div>
            </div> */}

            {/* --- UPDATED: Promotion Section Button --- */}
            <div className="card shadow-sm p-3 mt-4">
                <div className="row g-3 align-items-center">
                    <div className="col-md-8">
                        <h4 className="mb-2">Student & Class Promotion</h4>
                        <p className="mb-0 text-muted">
                            Use these tools at the end of an academic year to promote students to the next grade.
                        </p>
                    </div>
                    <div className="col-md-4 d-flex justify-content-end">
                        <button className="btn btn-warning" onClick={() => setShowPromotionModal(true)}>
                            Launch Promotion Tools
                        </button>
                    </div>
                </div>
            </div>

            {/* --- NEW: Promotion Modal --- */}
            {showPromotionModal && (
                <div className="modal show fade" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Student Promotion Tools</h5>
                                <button type="button" className="btn-close" onClick={() => setShowPromotionModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Select a class to promote and a destination class for the students.</p>
                                
                                <form onSubmit={handlePromotionSubmit} className="row g-3 p-2 border rounded">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">1. Select Source Class</label>
                                        <select 
                                            className="form-select" 
                                            value={sourceClassId} 
                                            onChange={(e) => setSourceClassId(e.target.value)}
                                            required
                                        >
                                            <option value="">-- Promote FROM --</option>
                                            {classesList.map(c => (
                                                <option key={`src-${c.class_id}`} value={c.class_id}>
                                                    {c.class_name} - {c.section}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">2. Select Destination Class</label>
                                        <select 
                                            className="form-select" 
                                            value={destClassId} 
                                            onChange={(e) => setDestClassId(e.target.value)}
                                            required
                                        >
                                            <option value="">-- Promote TO --</option>
                                            {classesList.map(c => (
                                                <option key={`dest-${c.class_id}`} value={c.class_id}>
                                                    {c.class_name} - {c.section}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-12 mt-4">
                                        <button type="submit" className="btn btn-success">Promote Class</button>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowPromotionModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Adds a backdrop for the modal */}
            {showPromotionModal && <div className="modal-backdrop fade show"></div>}
        </div>
    );
};

export default ModifyClassRecords;










// import React, { useState, useEffect } from 'react';
// import './AddStudent.css'; // Reusing styles for consistency

// const ModifyClassRecords = () => {
//   // State for summary statistics
//   const [stats, setStats] = useState({
//     classCount: 0,
//     studentCount: 0,
//     teacherCount: 0,
//   });
//   // States for timetable view
//   const [viewMode, setViewMode] = useState('class'); // 'class' or 'teacher'
//   // Placeholder data - we will fetch this from the API later
//   const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
//   const periods = [1, 2, 3, 4, 5, 6, 7, 8];

//   // --- NEW STATE FOR PHASE 3 ---
//   const [showModifier, setShowModifier] = useState(false);
//   const [classesList, setClassesList] = useState([]);
//   const [teachersList, setTeachersList] = useState([]);
//   const [subjectsList, setSubjectsList] = useState([]);
//   const [modifierData, setModifierData] = useState({
//       class_id: '',
//       teacher_id: '',
//       subject_id: '',
//       day_of_week: '1',
//       period_number: '1'
//   });

//   // Fetch summary stats on component mount
//   // useEffect(() => {
//   //   const fetchStats = async () => {
//   //     try {
//   //       // We will create this API endpoint later
//   //       // const res = await fetch('http://localhost:5050/api/dashboard/stats');
//   //       // const data = await res.json();
//   //       // setStats(data);
        
//   //       // Using mock data for now
//   //       setStats({ classCount: 21, studentCount: 105, teacherCount: 5 });
//   //     } catch (err) {
//   //       console.error("Failed to fetch stats:", err);
//   //     }
//   //   };
//   //   fetchStats();
//   // }, []);

// useEffect(() => {
//   const fetchData = async () => {
//     try {
//       // Fetch stats, classes, teachers, and subjects
//       const [statsRes, classesRes, teachersRes, subjectsRes] = await Promise.all([
//         fetch('http://localhost:5050/api/records/stats'),
//         fetch('http://localhost:5050/api/records/classes-list'),
//         fetch('http://localhost:5050/api/records/teachers-list'),
//         fetch('http://localhost:5050/api/records/subjects-list')
//       ]);
//       const statsData = await statsRes.json();
//       const classesData = await classesRes.json();
//       const teachersData = await teachersRes.json();
//       const subjectsData = await subjectsRes.json();

//       setStats(statsData);
//       setClassesList(classesData);
//       setTeachersList(teachersData);
//       setSubjectsList(subjectsData);

//     } catch (err) {
//       console.error("Failed to fetch page data:", err);
//     }
//   };
//     fetchData();
// }, []);

// const handleModifierChange = (e) => {
//   const { name, value } = e.target;
//   setModifierData(prev => ({ ...prev, [name]: value }));
// };

// const handleModifierSubmit = async (e) => {
//   e.preventDefault();
//   try {
//       const res = await fetch('http://localhost:5050/api/records/timetable', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(modifierData)
//       });

//       const result = await res.json();

//       if (!res.ok) {
//           // The backend sends a specific error message for conflicts
//           throw new Error(result.error || 'Failed to add entry');
//       }
      
//       alert('✅ Timetable entry added successfully!');
//       setShowModifier(false);
//       // Here you would typically re-fetch the timetable data to show the update
      
//   } catch (err) {
//       console.error(err.message);
//       alert(`❌ Error: ${err.message}`);
//   }
// };

//   // return (
//   //   <div className="container-fluid p-3">
//   //     {/* Row 1: Summary Panels */}
//   //     <div className="row mb-4">
//   //       <div className="col-md-4">
//   //         <div className="card shadow-sm p-3 h-100">
//   //           <h6>Total Classes (Grade & Section)</h6>
//   //           <h3>{stats.classCount}</h3>
//   //         </div>
//   //       </div>
//   //       <div className="col-md-4">
//   //         <div className="card shadow-sm p-3 h-100">
//   //           <h6>Total Students</h6>
//   //           <h3>{stats.studentCount}</h3>
//   //         </div>
//   //       </div>
//   //       <div className="col-md-4">
//   //         <div className="card shadow-sm p-3 h-100">
//   //           <h6>Total Teachers</h6>
//   //           <h3>{stats.teacherCount}</h3>
//   //         </div>
//   //       </div>
//   //     </div>

//   //     {/* Row 2: Timetable Management */}
//   //     <div className="card shadow-sm p-3 mt-3">
//   //       <div className="d-flex justify-content-between align-items-center mb-3">
//   //         <h4>Timetable Management</h4>
//   //         <button className="btn btn-primary btn-sm">
//   //           + Modify Timetable
//   //         </button>
//   //       </div>

//   //       {/* View Toggles and Filters */}
//   //       <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
//   //         <div className="btn-group">
//   //           <button 
//   //             className={`btn btn-sm ${viewMode === 'class' ? 'btn-success' : 'btn-outline-secondary'}`}
//   //             onClick={() => setViewMode('class')}
//   //           >
//   //             Class-wise View
//   //           </button>
//   //           <button 
//   //             className={`btn btn-sm ${viewMode === 'teacher' ? 'btn-success' : 'btn-outline-secondary'}`}
//   //             onClick={() => setViewMode('teacher')}
//   //           >
//   //             Teacher-wise View
//   //           </button>
//   //         </div>
          
//   //         {/* Placeholder for class/teacher selector */}
//   //         <div className="w-50">
//   //           <select className="form-select form-select-sm">
//   //             <option>
//   //               {viewMode === 'class' ? 'Select a Class (e.g., Grade 1 - A)' : 'Select a Teacher'}
//   //             </option>
//   //           </select>
//   //         </div>
//   //       </div>

//   //       {/* Timetable Grid */}
//   //       <div className="table-responsive">
//   //         <table className="table table-bordered text-center timetable">
//   //           <thead>
//   //             <tr>
//   //               <th>Period #</th>
//   //               {days.map(day => <th key={day}>{day}</th>)}
//   //             </tr>
//   //           </thead>
//   //           <tbody>
//   //             {periods.map(period => (
//   //               <tr key={period}>
//   //                 <td><strong>Period {period}</strong></td>
//   //                 {days.map(day => (
//   //                   <td key={`${day}-${period}`}>
//   //                     {/* Timetable entry content will go here */}
//   //                     <div className="fw-bold">Subject</div>
//   //                     <div>Teacher/Class</div>
//   //                   </td>
//   //                 ))}
//   //               </tr>
//   //             ))}
//   //           </tbody>
//   //         </table>
//   //       </div>
//   //     </div>

//   //     {/* Row 3: Class & Student Promotion */}
//   //     <div className="card shadow-sm p-3 mt-4">
//   //       <h4 className="mb-3">Student & Class Promotion</h4>
//   //       <div className="row g-3">
//   //         <div className="col-md-8">
//   //            <p>Use these tools at the end of an academic year to promote students to the next grade. You can promote entire classes or reassign individual students.</p>
//   //         </div>
//   //         <div className="col-md-4 d-flex align-items-center justify-content-end">
//   //            <button className="btn btn-warning">
//   //               Launch Promotion Tools
//   //            </button>
//   //         </div>
//   //       </div>
//   //     </div>

//   //   </div>
//   // );


//   return (
//     <div className="container-fluid p-3">
//         {/* --- Row 1: Summary Panels --- */}
//         <div className="row mb-4">
//             <div className="col-md-4">
//                 <div className="card shadow-sm p-3 h-100">
//                     <h6>Total Classes (Grade & Section)</h6>
//                     <h3>{stats.classCount}</h3>
//                 </div>
//             </div>
//             <div className="col-md-4">
//                 <div className="card shadow-sm p-3 h-100">
//                     <h6>Total Students</h6>
//                     <h3>{stats.studentCount}</h3>
//                 </div>
//             </div>
//             <div className="col-md-4">
//                 <div className="card shadow-sm p-3 h-100">
//                     <h6>Total Teachers</h6>
//                     <h3>{stats.teacherCount}</h3>
//                 </div>
//             </div>
//         </div>

//         {/* --- Slide-in Timetable Modifier --- */}
//         <div className={`slide-panel ${showModifier ? 'open' : ''}`}>
//             <div className="card shadow-sm p-4 form-scrollable">
//                 <h5>Add/Edit Timetable Slot</h5>
//                 <form onSubmit={handleModifierSubmit} className="row g-3">
//                     <div className="col-md-12">
//                         <label className="form-label">Class</label>
//                         <select name="class_id" value={modifierData.class_id} onChange={handleModifierChange} className="form-select" required>
//                             <option value="">Select a Class</option>
//                             {classesList.map(c => <option key={c.class_id} value={c.class_id}>{c.class_name} - {c.section}</option>)}
//                         </select>
//                     </div>
//                     <div className="col-md-12">
//                         <label className="form-label">Teacher</label>
//                         <select name="teacher_id" value={modifierData.teacher_id} onChange={handleModifierChange} className="form-select" required>
//                             <option value="">Select a Teacher</option>
//                             {teachersList.map(t => <option key={t.teacher_id} value={t.teacher_id}>{t.first_name} {t.last_name}</option>)}
//                         </select>
//                     </div>
//                     <div className="col-md-12">
//                         <label className="form-label">Subject</label>
//                         <select name="subject_id" value={modifierData.subject_id} onChange={handleModifierChange} className="form-select" required>
//                             <option value="">Select a Subject</option>
//                             {subjectsList.map(s => <option key={s.subject_id} value={s.subject_id}>{s.name}</option>)}
//                         </select>
//                     </div>
//                     <div className="col-md-6">
//                         <label className="form-label">Day of Week</label>
//                         <select name="day_of_week" value={modifierData.day_of_week} onChange={handleModifierChange} className="form-select" required>
//                             <option value="1">Monday</option>
//                             <option value="2">Tuesday</option>
//                             <option value="3">Wednesday</option>
//                             <option value="4">Thursday</option>
//                             <option value="5">Friday</option>
//                         </select>
//                     </div>
//                     <div className="col-md-6">
//                         <label className="form-label">Period</label>
//                         <select name="period_number" value={modifierData.period_number} onChange={handleModifierChange} className="form-select" required>
//                             {periods.map(p => <option key={p} value={p}>{p}</option>)}
//                         </select>
//                     </div>
//                     <div className="col-12 mt-4">
//                         <button type="submit" className="btn btn-success me-2">Save Slot</button>
//                         <button type="button" className="btn btn-secondary" onClick={() => setShowModifier(false)}>Cancel</button>
//                     </div>
//                 </form>
//             </div>
//         </div>

//         {/* --- Row 2: Timetable Management Section --- */}
//         <div className="card shadow-sm p-3 mt-3">
//             <div className="d-flex justify-content-between align-items-center mb-3">
//                 <h4>Timetable Management</h4>
//                 <button className="btn btn-primary btn-sm" onClick={() => setShowModifier(true)}>
//                     + Modify Timetable
//                 </button>
//             </div>

//             {/* View Toggles and Filters */}
//             <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
//                 <div className="btn-group">
//                     <button
//                         className={`btn btn-sm ${viewMode === 'class' ? 'btn-success' : 'btn-outline-secondary'}`}
//                         onClick={() => setViewMode('class')}
//                     >
//                         Class-wise View
//                     </button>
//                     <button
//                         className={`btn btn-sm ${viewMode === 'teacher' ? 'btn-success' : 'btn-outline-secondary'}`}
//                         onClick={() => setViewMode('teacher')}
//                     >
//                         Teacher-wise View
//                     </button>
//                 </div>

//                 <div className="w-50">
//                     <select className="form-select form-select-sm">
//                         <option>
//                             {viewMode === 'class' ? 'Select a Class to View' : 'Select a Teacher to View'}
//                         </option>
//                         {/* This dropdown will be populated dynamically from state */}
//                         {viewMode === 'class' 
//                             ? classesList.map(c => <option key={c.class_id} value={c.class_id}>{c.class_name} - {c.section}</option>)
//                             : teachersList.map(t => <option key={t.teacher_id} value={t.teacher_id}>{t.first_name} {t.last_name}</option>)
//                         }
//                     </select>
//                 </div>
//             </div>

//             {/* Timetable Grid */}
//             <div className="table-responsive">
//                 <table className="table table-bordered text-center timetable">
//                     <thead>
//                         <tr>
//                             <th>Period #</th>
//                             {days.map(day => <th key={day}>{day}</th>)}
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {periods.map(period => (
//                             <tr key={period}>
//                                 <td><strong>Period {period}</strong></td>
//                                 {days.map(day => (
//                                     <td key={`${day}-${period}`}>
//                                         {/* Dynamic content will replace this placeholder */}
//                                         <div className="fw-bold text-muted small">Empty</div>
//                                     </td>
//                                 ))}
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>

//         {/* --- Row 3: Promotion Section --- */}
//         <div className="card shadow-sm p-3 mt-4">
//             <div className="row g-3 align-items-center">
//                 <div className="col-md-8">
//                     <h4 className="mb-2">Student & Class Promotion</h4>
//                     <p className="mb-0 text-muted">
//                         Use these tools at the end of an academic year to promote students to the next grade. You can promote entire classes or reassign individual students.
//                     </p>
//                 </div>
//                 <div className="col-md-4 d-flex justify-content-end">
//                     <button className="btn btn-warning">
//                         Launch Promotion Tools
//                     </button>
//                 </div>
//             </div>
//         </div>
//     </div>
// );
// };

// export default ModifyClassRecords;


// // const ModifyClassRecords = () => (
// //     <div className="p-4">
// //       <h2>Modify Class Records</h2>
// //       <p>Placeholder content for Modify Class Records.</p>
// //     </div>
// //   );
  
// //   export default ModifyClassRecords;
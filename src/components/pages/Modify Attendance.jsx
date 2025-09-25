import React, { useState, useEffect, useMemo } from 'react';
import './AddStudent.css'; // Reusing styles for consistency

// Helper to get today's date in YYYY-MM-DD format
const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const ModifyAttendance = () => {
    const [classesList, setClassesList] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedDate, setSelectedDate] = useState(getTodayString());
    const [attendanceList, setAttendanceList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch the list of classes for the dropdown on component mount
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await fetch('http://localhost:5050/api/records/classes-list');
                const data = await res.json();
                setClassesList(data);
            } catch (err) {
                console.error("Failed to fetch classes:", err);
            }
        };
        fetchClasses();
    }, []);

    // Fetch attendance data whenever the selected class or date changes
    useEffect(() => {
        if (!selectedClassId || !selectedDate) {
            setAttendanceList([]);
            return;
        }

        const fetchAttendance = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`http://localhost:5050/api/attendance?classId=${selectedClassId}&date=${selectedDate}`);
                const data = await res.json();
                setAttendanceList(data);
            } catch (err) {
                console.error("Failed to fetch attendance data:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAttendance();
    }, [selectedClassId, selectedDate]);

    // Handler to update a student's attendance status in the local state
    const handleStatusChange = (studentId, newStatus) => {
        setAttendanceList(prevList =>
            prevList.map(student =>
                student.student_id === studentId ? { ...student, status: newStatus } : student
            )
        );
    };

    // Handler to save all attendance records for the selected class and date
    const handleSaveAttendance = async () => {
        if (attendanceList.length === 0) {
            alert("No attendance data to save.");
            return;
        }
        
        const payload = {
            classId: selectedClassId,
            date: selectedDate,
            attendanceData: attendanceList.map(({ student_id, status }) => ({ student_id, status }))
        };

        try {
            const res = await fetch('http://localhost:5050/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to save attendance');
            }
            
            alert('✅ Attendance saved successfully!');

        } catch (err) {
            console.error(err);
            alert(`❌ Error: ${err.message}`);
        }
    };

    // Calculate summary stats using useMemo for efficiency
    const attendanceSummary = useMemo(() => {
        const summary = { Present: 0, Absent: 0, Late: 0 };
        attendanceList.forEach(student => {
            if (summary[student.status] !== undefined) {
                summary[student.status]++;
            }
        });
        return summary;
    }, [attendanceList]);


    return (
        <div className="container-fluid p-3">
            <div className="card shadow-sm">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">Modify Attendance</h4>
                </div>
                <div className="card-body">
                    {/* --- Filters Section --- */}
                    <div className="row g-3 mb-4 p-3 border rounded bg-light">
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Select Class</label>
                            <select className="form-select" value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}>
                                <option value="">-- Choose a Class --</option>
                                {classesList.map(c => (
                                    <option key={c.class_id} value={c.class_id}>
                                        {c.class_name} - {c.section}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Select Date</label>
                            <input type="date" className="form-select" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                        </div>
                    </div>

                    {selectedClassId && (
                        <>
                            {/* --- Summary Section --- */}
                            <div className="d-flex justify-content-around p-3 mb-4 bg-light rounded shadow-sm text-center">
                                <div><h5 className="mb-0 text-success">Present</h5><span className="fs-4 fw-bold">{attendanceSummary.Present}</span></div>
                                <div><h5 className="mb-0 text-danger">Absent</h5><span className="fs-4 fw-bold">{attendanceSummary.Absent}</span></div>
                                <div><h5 className="mb-0 text-warning">Late</h5><span className="fs-4 fw-bold">{attendanceSummary.Late}</span></div>
                                <div><h5 className="mb-0 text-primary">Total</h5><span className="fs-4 fw-bold">{attendanceList.length}</span></div>
                            </div>
                            
                            {/* --- Student List --- */}
                            <ul className="list-group">
                                {isLoading ? (
                                    <li className="list-group-item text-center">Loading students...</li>
                                ) : (
                                    attendanceList.map(student => (
                                        <li key={student.student_id} className="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <span className="fw-bold">{student.last_name}, {student.first_name}</span>
                                                <small className="text-muted ms-2">({student.admission_no})</small>
                                            </div>
                                            <div className="btn-group">
                                                <button 
                                                    onClick={() => handleStatusChange(student.student_id, 'Present')}
                                                    className={`btn btn-sm ${student.status === 'Present' ? 'btn-success' : 'btn-outline-secondary'}`}>
                                                    Present
                                                </button>
                                                <button 
                                                    onClick={() => handleStatusChange(student.student_id, 'Absent')}
                                                    className={`btn btn-sm ${student.status === 'Absent' ? 'btn-danger' : 'btn-outline-secondary'}`}>
                                                    Absent
                                                </button>
                                                <button 
                                                    onClick={() => handleStatusChange(student.student_id, 'Late')}
                                                    className={`btn btn-sm ${student.status === 'Late' ? 'btn-warning' : 'btn-outline-secondary'}`}>
                                                    Late
                                                </button>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>

                            {/* --- Save Button --- */}
                            <div className="text-center mt-4">
                                <button className="btn btn-primary btn-lg" onClick={handleSaveAttendance} disabled={isLoading}>
                                    Save Attendance
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModifyAttendance;









// const ModifyAttendance = () => (
//     <div className="p-4">
//       <h2>Modify Attendance</h2>
//       <p>Placeholder content for Modifying Attendance.</p>
//     </div>
//   );
  
//   export default ModifyAttendance;
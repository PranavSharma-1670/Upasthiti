// src/components/leftPanel/EventsAndNotices.jsx
import React, { useState } from "react";
import { useExcelData } from "../../context/ExcelDataContext";

const EventsAndNotices = () => {
  const { addRow } = useExcelData();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    type: "Event",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newRow = {
      Title: formData.title,
      Description: formData.description,
      Date: formData.date,
      Type: formData.type,
    };

    addRow("EventsAndNotices", newRow); // <- adds to context
    setFormData({ title: "", description: "", date: "", type: "Event" });
    alert("Event/Notice added successfully!");
  };

  return (
    <div className="p-4">
      <h3>Add Events and Notices</h3>
      <form onSubmit={handleSubmit} className="mt-3">
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            className="form-control"
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Date</label>
          <input
            type="date"
            name="date"
            className="form-control"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Type</label>
          <select
            name="type"
            className="form-select"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="Event">Event</option>
            <option value="Notice">Notice</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary">
          Add
        </button>
      </form>
    </div>
  );
};

export default EventsAndNotices;



// const AddEventsAndNotices = () => (
//     <div className="p-4">
//       <h2>Add Events And Notices</h2>
//       <p>Placeholder content for Adding Events And Notices.</p>
//     </div>
//   );
  
//   export default AddEventsAndNotices;
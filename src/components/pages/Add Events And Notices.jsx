// src/components/leftPanel/EventsAndNotices.jsx
import React, { useState } from "react";

const EventsAndNotices = () => {
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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   const newEvent = {
  //     title: formData.title,
  //     description: formData.description,
  //     date: formData.date,
  //     type: formData.type,
  //     issued_by: "Admin", // you can make this dynamic later
  //   };

  //   try {
  //     const res = await fetch("http://localhost:5050/api/events", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(newEvent),
  //     });

  //     if (!res.ok) throw new Error("Failed to add event");

  //     const data = await res.json();
  //     console.log("Event added:", data);

  //     setFormData({ title: "", description: "", date: "", type: "Event" });
  //     alert("Event/Notice added successfully!");
  //   } catch (err) {
  //     console.error("Error adding event:", err);
  //     alert("Failed to add event.");
  //   }
  // };


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // <-- Replace this block:
    // const newRow = { ... }
  
    // With this, matching the PostgreSQL schema:
    const newEvent = {
      title: formData.title,
      description: formData.description,
      date: formData.date, // maps to event_date
      type: formData.type,
      issued_by: "Admin", // can be dynamic later
    };
  
    try {
      const res = await fetch("http://localhost:5050/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent), // send this instead of old newRow
      });
  
      if (!res.ok) throw new Error("Failed to add event");
  
      const data = await res.json();
      console.log("Event added:", data);
  
      setFormData({ title: "", description: "", date: "", type: "Event" });
      alert("Event/Notice added successfully!");
    } catch (err) {
      console.error("Error adding event:", err);
      alert("Failed to add event.");
    }
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
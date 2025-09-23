// src/components/leftPanel/EventsAndNotices.jsx
import React, { useEffect, useState } from "react";

const EventsAndNotices = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:5050/api/events");
        const data = await res.json();
        setEvents(data); // backend should return an array of events
        setLoading(false);
      } catch (err) {
        console.error("Error fetching events:", err);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <p>Loading events and notices...</p>;

  return (
    <div className="card shadow-sm p-3 mb-4 flex-grow-1">
      <h5 className="mb-3">Events And Notices</h5>

      <div style={{ maxHeight: "200px", overflowY: "auto" }}>
        <table className="table table-sm table-hover mb-0">
          <thead className="table-light sticky-top">
            <tr>
              <th>Type</th>
              <th>Date</th>
              <th>Title</th>
              <th>Description</th>
              <th>Issued By</th>
            </tr>
          </thead>
          <tbody>
            {events.map((item, idx) => (
              <tr key={idx}>
                <td>{item.type}</td>
                <td>{item.date}</td>
                <td>{item.title}</td>
                <td>{item.description}</td>
                <td>{item.issued_by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventsAndNotices;

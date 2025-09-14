// src/components/rightPanel/ViewToggle.jsx
import React from "react";

const ViewToggle = ({ viewType, setViewType }) => {
  const views = ["JSON", "Tree", "Table"];

  return (
    <div>
      <p><strong>View Toggles:</strong></p>
      <div className="btn-group w-100" role="group">
        {views.map((type) => (
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
  );
};

export default ViewToggle;

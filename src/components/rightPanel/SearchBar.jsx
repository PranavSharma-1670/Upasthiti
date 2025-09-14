import React from "react";

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="input-group">
      <input
        type="text"
        className="form-control"
        placeholder="Search students or teachers..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button className="btn btn-outline-secondary" type="button">
        🔍
      </button>
    </div>
  );
};

export default SearchBar;

import React from "react";

const Cards = () => {
  return (
    <div className="row mb-4">
      <div className="col-md-4">
        <div className="card shadow-sm p-3 h-100">
          <h5>Card 1</h5>
          <p>Some details here</p>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card shadow-sm p-3 h-100">
          <h5>Card 2</h5>
          <p>Some details here</p>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card shadow-sm p-3 h-100">
          <h5>Card 3</h5>
          <p>Some details here</p>
        </div>
      </div>
    </div>
  );
};

export default Cards;

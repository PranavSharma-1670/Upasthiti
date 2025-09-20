import React from "react";

const Cards = () => {
  return (
    <div className="row mb-4">
      <div className="col-md-4">
        <div className="card shadow-sm p-3 h-100">
          <h5>No of Students Records: </h5>
          <h2>375</h2>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card shadow-sm p-3 h-100">
          <h5>No of Request left unresolved :</h5>
          <h2>3</h2>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card shadow-sm p-3 h-100">
          <h5>Process Back Logs :- </h5>
          <p> Online Backlog : 1 </p>
          <p>  Video Backlog : 0 </p>
        </div>
      </div>
    </div>
  );
};

export default Cards;

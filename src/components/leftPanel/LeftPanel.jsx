import React from "react";
import Cards from "./Cards";
import CalendarWidget from "./CalendarWidget";
// import DataTable from "./EventsAndNotices";
import EventsAndNotices  from "./EventsAndNotices";

const LeftPanel = () => {
  return (
    <div className="d-flex flex-column h-100" style={{
        minHeight: "850px",
        maxHeight: "850px",
      }}>
      <Cards />
      <CalendarWidget />
      {/* <DataTable /> */}
      <EventsAndNotices />
    </div>
  );
};

export default LeftPanel;

// src/components/leftPanel/CalendarWidget.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useExcelData } from "../../context/ExcelDataContext";

const CalendarWidget = () => {
  const [date, setDate] = useState(new Date());
  const { data, loading } = useExcelData();

  if (loading) return <p>Loading calendar...</p>;

  const holidays = (data.Holidays || [])
    .map(h => {
      try {
        if (!h.Date) return null; // skip invalid entries

        // Handle string date like "15-Aug"
        if (typeof h.Date === "string") {
          const [day, monthShort] = h.Date.split("-");
          const month = new Date(`${monthShort} 1, 2000`).getMonth();
          if (isNaN(month) || isNaN(parseInt(day))) return null;
          return {
            ...h,
            Date: new Date(new Date().getFullYear(), month, parseInt(day))
          };
        }

        // Handle numeric Excel dates (optional)
        if (typeof h.Date === "number") {
          const excelEpoch = new Date(1899, 11, 30);
          const jsDate = new Date(excelEpoch.getTime() + h.Date * 24 * 60 * 60 * 1000);
          return { ...h, Date: jsDate };
        }

        return null; // unknown format
      } catch (err) {
        console.error("Error parsing holiday date:", h.Date, err);
        return null;
      }
    })
    .filter(Boolean); // remove nulls

  console.log("Loaded holidays:", holidays);

  // Highlight holiday dates
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const formatted = date.toISOString().split("T")[0];
      return holidays.some(
        (h) => new Date(h.Date).toISOString().split("T")[0] === formatted
      )
        ? "holiday-tile"
        : "";
    }
  };

  // Show holiday title if selected date is a holiday
  const holidayTitle = holidays.find(
    (h) =>
      new Date(h.Date).toISOString().split("T")[0] ===
      date.toISOString().split("T")[0]
  )?.Title;

  return (
    <div className="card shadow-sm p-3 mb-4 flex-grow-1">
      <h5 className="mb-3">Calendar</h5>
      <Calendar
        onChange={setDate}
        value={date}
        className="w-100 border-0"
        tileClassName={tileClassName}
        tileContent={({ date, view }) => {
          if (view === "month") {
            const holiday = holidays.find(
              (h) =>
                new Date(h.Date).toISOString().split("T")[0] ===
                date.toISOString().split("T")[0]
            );
            return holiday ? <span data-title={holiday.Title}></span> : null;
          }
          return null;
        }}
      />
      <p className="mt-3">
        <strong>Selected Date:</strong> {date.toDateString()}
      </p>
      {holidayTitle && (
        <p className="text-danger">
          <strong>Holiday:</strong> {holidayTitle}
        </p>
      )}
    </div>
  );
};

export default CalendarWidget;





// // src/components/leftPanel/CalendarWidget.jsx
// import React, { useState } from "react";
// import Calendar from "react-calendar";
// import "react-calendar/dist/Calendar.css";
// import { useExcelData } from "../../context/ExcelDataContext";

// const CalendarWidget = () => {
//   const [date, setDate] = useState(new Date());
//   const { data, loading } = useExcelData();

//   if (loading) return <p>Loading calendar...</p>;

//   // Holidays sheet (Date, Title)
//   const holidays = data.Holidays || [];

//   // Highlight holiday dates
//   const tileClassName = ({ date }) => {
//     const formatted = date.toISOString().split("T")[0]; // YYYY-MM-DD
//     return holidays.some(
//       (h) =>
//         new Date(h.Date).toISOString().split("T")[0] === formatted
//     )
//       ? "holiday-tile"
//       : "";
//   };

//   // Show holiday title if the selected date is a holiday
//   const holidayTitle = holidays.find(
//     (h) =>
//       new Date(h.Date).toISOString().split("T")[0] ===
//       date.toISOString().split("T")[0]
//   )?.Title;

//   return (
//     <div className="card shadow-sm p-3 mb-4 flex-grow-1">
//       <h5 className="mb-3">Calendar</h5>
//       <Calendar
//         onChange={setDate}
//         value={date}
//         className="w-100 border-0"
//         tileClassName={tileClassName}
//       />
//       <p className="mt-3">
//         <strong>Selected Date:</strong> {date.toDateString()}
//       </p>
//       {holidayTitle && (
//         <p className="text-danger">
//           <strong>Holiday:</strong> {holidayTitle}
//         </p>
//       )}
//     </div>
//   );
// };

// export default CalendarWidget;





// Default

// import React, { useState } from "react";
// import Calendar from "react-calendar";
// import "react-calendar/dist/Calendar.css";

// const CalendarWidget = () => {
//   const [date, setDate] = useState(new Date());

//   return (
//     <div className="card shadow-sm p-3 mb-4 flex-grow-1">
//       <h5 className="mb-3">Calendar</h5>
//       <Calendar
//         onChange={setDate}
//         value={date}
//         className="w-100 border-0"
//       />
//       <p className="mt-3">
//         <strong>Selected Date:</strong> {date.toDateString()}
//       </p>
//     </div>
//   );
// };

// export default CalendarWidget;

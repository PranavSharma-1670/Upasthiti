// src/context/DataWriter.js
import * as XLSX from "xlsx";

export class DataWriter {
  constructor(initialData) {
    this.data = initialData || {};
  }

  addRow(sheetName, row) {
    if (!this.data[sheetName]) {
      this.data[sheetName] = [];
    }
    this.data[sheetName].push(row);
  }

  // For now: download new Excel
  saveToExcel(filename = "updated_school_data.xlsx") {
    const workbook = XLSX.utils.book_new();

    Object.keys(this.data).forEach((sheetName) => {
      const worksheet = XLSX.utils.json_to_sheet(this.data[sheetName]);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    XLSX.writeFile(workbook, filename);
  }

  getData() {
    return this.data;
  }
}

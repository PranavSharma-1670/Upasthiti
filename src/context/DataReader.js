// src/context/DataReader.js
import * as XLSX from "xlsx";

export class DataReader {
  constructor(filePath = "/school_sample_data.xlsx") {
    this.filePath = filePath;
  }

  async loadData(sheetsToLoad = []) {
    const res = await fetch(this.filePath);
    const buffer = await res.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const selectedSheets = {};

    workbook.SheetNames.forEach((sheetName) => {
      if (sheetsToLoad.length === 0 || sheetsToLoad.includes(sheetName)) {
        selectedSheets[sheetName] = XLSX.utils.sheet_to_json(
          workbook.Sheets[sheetName]
        );
      }
    });

    return selectedSheets;
  }
}

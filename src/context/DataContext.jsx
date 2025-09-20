// src/context/DataContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { DataReader } from "./DataReader";
import { DataWriter } from "./DataWriter";

const DataContext = createContext();

export const DataProvider = ({ children, sheetsToLoad = [] }) => {
  const [loading, setLoading] = useState(true);
  const [writer, setWriter] = useState(null);

  useEffect(() => {
    const reader = new DataReader();
    reader.loadData(sheetsToLoad).then((loadedData) => {
      const writerInstance = new DataWriter(loadedData);
      setWriter(writerInstance);
      setLoading(false);
    });
  }, [sheetsToLoad]);

  return (
    <DataContext.Provider value={{ writer, loading }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);

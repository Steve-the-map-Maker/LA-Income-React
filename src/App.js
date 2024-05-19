import React, { useState, useEffect } from 'react';
import MapComponent from './components/MapComponent';
import ChartComponent from './components/ChartComponent';
import { fetchACSIncomeData } from './utils/fetchData';

function App() {
  const [incomeDataByTract, setIncomeDataByTract] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const incomeData = await fetchACSIncomeData();
      setIncomeDataByTract(incomeData);
    };

    fetchData();
  }, []);

  return (
    <div>
      <MapComponent />
      <div id="chartContainer" style={{ position: 'absolute', top: '10px', left: '10px', width: '300px', height: '200px', zIndex: '10', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
        <ChartComponent incomeDataByTract={incomeDataByTract} />
      </div>
      <button id="toggleChart" style={{ position: 'absolute', top: '10px', left: '320px', zIndex: '11' }} onClick={() => {
        const chartContainer = document.getElementById('chartContainer');
        chartContainer.style.display = chartContainer.style.display === 'none' ? 'block' : 'none';
      }}>
        Toggle Chart
      </button>
    </div>
  );
}

export default App;

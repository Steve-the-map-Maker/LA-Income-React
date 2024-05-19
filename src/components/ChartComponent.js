import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

// Register all necessary components
Chart.register(...registerables);

const ChartComponent = ({ incomeDataByTract }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    const incomeData = Object.values(incomeDataByTract).map(data => data.medianIncome).filter(income => income > 0);
    const incomeLabels = ['<30k', '30k-60k', '60k-90k', '90k-120k', '120k-150k', '150k+'];
    const incomeCounts = new Array(incomeLabels.length).fill(0);

    incomeData.forEach(income => {
      if (income < 30000) incomeCounts[0]++;
      else if (income < 60000) incomeCounts[1]++;
      else if (income < 90000) incomeCounts[2]++;
      else if (income < 120000) incomeCounts[3]++;
      else if (income < 150000) incomeCounts[4]++;
      else incomeCounts[5]++;
    });

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: incomeLabels,
        datasets: [{
          label: 'Income Distribution',
          data: incomeCounts,
          backgroundColor: ['#adebad', '#70db70', '#33cc33', '#29a329', '#1f7a1f', '#145214'],
          borderWidth: 1,
        }],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    // Cleanup chart on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [incomeDataByTract]);

  return <canvas ref={chartRef} id="incomeHistogram" />;
};

export default ChartComponent;

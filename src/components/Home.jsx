import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Chart } from 'chart.js';
import '../App.css';

const containerSize = 600;
const gridSize = 75; // Size of each grid cell

const Home = ({ scenarios }) => {
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState('');
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [chart, setChart] = useState(null);
  const [simulationTimer, setSimulationTimer] = useState(null);

  useEffect(() => {
    if (selectedScenario) {
      fetchVehicles(selectedScenario);
    }
  }, [selectedScenario]);

  useEffect(() => {
    // Create a new chart when vehicles data changes
    if (simulationStarted && chart && vehicles.length > 0) {
      updateChart();
    }
  }, [vehicles]);

  const fetchVehicles = async (scenarioId) => {
    try {
      const response = await axios.get(`http://localhost:5000/vehicles?scenarioId=${scenarioId}`);
      setVehicles(response.data.map(vehicle => ({ ...vehicle, remainingTime: vehicle.timeOfSimulation })));
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleStartSimulation = () => {
    setSimulationStarted(true);
    startSimulation();
  };

  const handleStopSimulation = () => {
    setSimulationStarted(false);
    clearInterval(simulationTimer);
  };

  const handleScenarioChange = (e) => {
    setSelectedScenario(e.target.value);
  };

  const startSimulation = () => {
    // Initialize the positions and directions of vehicles randomly within the graph container
    const initializedVehicles = vehicles.map((vehicle) => ({
      ...vehicle,
      positionX: Math.floor(Math.random() * (containerSize / gridSize)),
      positionY: Math.floor(Math.random() * (containerSize / gridSize)),
      direction: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)],
    }));

    setVehicles(initializedVehicles);

    setSimulationTimer(
      setInterval(() => {
        moveVehicles(); // Move the vehicles according to their directions
        updateChart();
        checkSimulationCompletion();
      }, 100)
    );
  };

  const updateDirection = (vehicleId, direction) => {
    setVehicles((prevVehicles) =>
      prevVehicles.map((vehicle) => {
        if (vehicle.id === vehicleId) {
          return { ...vehicle, direction };
        }
        return vehicle;
      })
    );
  };

  const moveVehicles = () => {
    setVehicles((prevVehicles) =>
      prevVehicles.map((vehicle) => {
        let positionX = vehicle.positionX;
        let positionY = vehicle.positionY;
        let remainingTime = vehicle.remainingTime;

        // Check if the vehicle's time is completed and if not, update its position based on the direction
        if (vehicle.remainingTime > 0) {
          if (vehicle.direction === 'stop') {
            remainingTime = Math.max(remainingTime - 100, 0);
          } else {
            if (vehicle.direction === 'up') {
              positionY = Math.max(positionY - 1, 0);
            } else if (vehicle.direction === 'down') {
              positionY = Math.min(positionY + 1, containerSize / gridSize - 1);
            } else if (vehicle.direction === 'left') {
              positionX = Math.max(positionX - 1, 0);
            } else if (vehicle.direction === 'right') {
              positionX = Math.min(positionX + 1, containerSize / gridSize - 1);
            }

            remainingTime = remainingTime - 100;
          }
        }

        return { ...vehicle, positionX, positionY, remainingTime };
      })
    );
  };

  const checkSimulationCompletion = () => {
    const allSimulationsCompleted = vehicles.every((vehicle) => vehicle.remainingTime <= 0);
    if (allSimulationsCompleted) {
      handleStopSimulation();
    }
  };

  const createChart = () => {
    const ctx = document.getElementById('vehicleChart');
    const labels = Array.from({ length: vehicles[0].positions.length }, (_, index) => index + 1);

    const datasets = vehicles.map((vehicle) => ({
      label: `Vehicle ${vehicle.id}`,
      data: vehicle.positions.map((position) => position.x),
      borderColor: vehicle.color,
      backgroundColor: vehicle.color,
      fill: false,
      lineTension: 0,
    }));

    setChart(new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Time',
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Position X',
            },
          },
        },
      },
    }));
  };

  const updateChart = () => {
    if (chart) {
      chart.data.datasets.forEach((dataset, index) => {
        dataset.data = vehicles.map((vehicle) =>
          dataset.label === `Vehicle ${vehicle.id}` ? vehicle.positionX : vehicle.positionY
        );
      });
      chart.update();
    }
  };


  return (
    <div>
      <h1>Home Page</h1>
      <div>
        <h2>Select Scenario</h2>
        <select value={selectedScenario} onChange={handleScenarioChange}>
          <option value="">-- Select Scenario --</option>
          {scenarios.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.name}
            </option>
          ))}
        </select>
        <button onClick={handleStartSimulation} disabled={!selectedScenario || simulationStarted}>
          Start Simulation
        </button>
        <button onClick={handleStopSimulation} disabled={!simulationStarted}>
          Stop Simulation
        </button>
      </div>
      <div className="graph-container" style={{ width: containerSize, height: containerSize }}>
        {/* Render grid boxes */}
        {Array.from({ length: containerSize / gridSize }, (_, row) =>
          Array.from({ length: containerSize / gridSize }, (_, col) => (
            <div
              key={`${row}-${col}`}
              className="box"
              style={{
                left: col * gridSize,
                top: row * gridSize,
                width: gridSize,
                height: gridSize,
              }}
            ></div>
          ))
        )}

        {/* Render vehicles */}
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className={`vehicle ${vehicle.hidden ? 'hidden' : ''}`}
            style={{
              left: vehicle.positionX * gridSize,
              top: vehicle.positionY * gridSize,
              backgroundColor: vehicle.color,
            }}
            onClick={() => updateDirection(vehicle.id, 'stop')}
          ></div>
        ))}

        {/* Render the chart */}
        <canvas id="vehicleChart" width={containerSize} height={containerSize}></canvas>
      </div>
    </div>
  );
};

export default Home;

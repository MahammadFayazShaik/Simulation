import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Chart } from 'chart.js';
import '../App.css';

const containerSize = "100%";
const gridSize = '20px'; // Adjust the size according to your preference

const chartHeight = "100%";

const Home = ({ scenarios }) => {
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState('');
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [chart, setChart] = useState(null);
  const [simulationTimer, setSimulationTimer] = useState(null);
  const [editedData, setEditedData] = useState(null);

  useEffect(() => {
    if (selectedScenario) {
      fetchVehicles(selectedScenario);
    }
  }, [selectedScenario]);

  useEffect(() => {
    if (simulationStarted && chart && vehicles.length > 0) {
      updateVehiclesPosition();
      updateChart();
      checkSimulationCompletion();
    }
  }, [simulationStarted, vehicles, chart]);

  const fetchVehicles = async (scenarioId) => {
    try {
      const response = await axios.get(`http://localhost:5000/vehicles?scenarioId=${scenarioId}`);
      setVehicles(
        response.data.map((vehicle) => ({
          ...vehicle,
          remainingTime: vehicle.timeOfSimulation,
          color: getRandomColor(), // Assuming color is included in the server response
        }))
      );
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  // Mock function to generate random colors for vehicles
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
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
    if (vehicles.length > 0) {
      const initializedVehicles = vehicles.map((vehicle) => ({
        ...vehicle,
        positionX: Math.floor(Math.random() * (containerSize / gridSize)),
        positionY: Math.floor(Math.random() * (chartHeight / gridSize)),
        direction: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)],
      }));

      setVehicles(initializedVehicles);

      setSimulationTimer(
        setInterval(() => {
          updateVehiclesPosition();
          updateChart();
          checkSimulationCompletion();
        }, 100)
      );
    } else {
      console.log('No vehicles in the selected scenario. Please add vehicles and try again.');
    }
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

  const updateVehiclesPosition = () => {
    setVehicles((prevVehicles) =>
      prevVehicles.map((vehicle) => {
        let positionX = vehicle.positionX;
        let positionY = vehicle.positionY;
        let remainingTime = vehicle.remainingTime;

        if (vehicle.remainingTime > 0) {
          if (vehicle.direction === 'stop') {
            remainingTime = Math.max(remainingTime - 100, 0);
          } else {
            if (vehicle.direction === 'up') {
              positionY = Math.max(positionY - 1, 0);
            } else if (vehicle.direction === 'down') {
              positionY = Math.min(positionY + 1, chartHeight / gridSize - 1);
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
    const labels = Array.from({ length: vehicles[0].timeOfSimulation / 100 }, (_, index) => (index + 1) * 100);

    const datasets = vehicles.map((vehicle) => ({
      label: `Vehicle ${vehicle.id}`,
      data: vehicle.positions.map((position) => position.x),
      borderColor: vehicle.color,
      backgroundColor: vehicle.color,
      fill: false,
      lineTension: 0,
    }));

    setChart(
      new Chart(ctx, {
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
              min: -1, // Include the bottom borderline
              max: containerSize / gridSize, // Include the bottom borderline
            },
          },
        },
      })
    );
  };

  const updateChart = () => {
    if (chart) {
      chart.data.labels = Array.from({ length: vehicles[0].remainingTime / 100 }, (_, index) => (index + 1) * 100);
      chart.data.datasets.forEach((dataset, index) => {
        dataset.data = vehicles.map((vehicle) =>
          dataset.label === `Vehicle ${vehicle.id}` ? vehicle.positionX : vehicle.positionY
        );
      });
      chart.update();
    }
  };

  const handleEditVehicle = (vehicleId) => {
    setVehicles((prevVehicles) =>
      prevVehicles.map((vehicle) => {
        if (vehicle.id === vehicleId) {
          setEditedData(vehicle);
          return { ...vehicle, isEditing: true };
        }
        return vehicle;
      })
    );
  };

  const handleEditChanges = (vehicleId, key, value) => {
    setVehicles((prevVehicles) =>
      prevVehicles.map((vehicle) => {
        if (vehicle.id === vehicleId) {
          return { ...vehicle, [key]: value };
        }
        return vehicle;
      })
    );
  };

  const handleSaveChanges = (vehicleId) => {
    setVehicles((prevVehicles) =>
      prevVehicles.map((vehicle) => {
        if (vehicle.id === vehicleId) {
          return { ...vehicle, isEditing: false };
        }
        return vehicle;
      })
    );
  };

  const handleCancelEdit = (vehicleId) => {
    setVehicles((prevVehicles) =>
      prevVehicles.map((vehicle) => {
        if (vehicle.id === vehicleId) {
          return { ...editedData, isEditing: false };
        }
        return vehicle;
      })
    );
  };

  const handleUpdateVehicle = (updatedVehicle) => {
    axios
      .put(`http://localhost:5000/vehicles/${updatedVehicle.id}`, updatedVehicle)
      .then((response) => {
        setVehicles((prevVehicles) =>
          prevVehicles.map((vehicle) => (vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle))
        );
      })
      .catch((error) => {
        console.error('Error updating vehicle:', error);
      });
  };

  const handleDeleteVehicle = (vehicleId) => {
    axios
      .delete(`http://localhost:5000/vehicles/${vehicleId}`)
      .then(() => {
        setVehicles((prevVehicles) => prevVehicles.filter((vehicle) => vehicle.id !== vehicleId));
      })
      .catch((error) => {
        console.error('Error deleting vehicle:', error);
      });
  };

  return (
    <div>
      <h1>Home Page</h1>
      <div>
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

      {vehicles.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <table className="vehicle-table">
            <thead>
              <tr>
                <th>Vehicle ID</th>
                <th>Vehicle Name</th>
                <th>Position X</th>
                <th>Position Y</th>
                <th>Speed</th>
                <th>Direction</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>{vehicle.id}</td>
                  <td>
                    {vehicle.isEditing ? (
                      <input
                        type="text"
                        value={vehicle.name}
                        onChange={(e) => handleEditChanges(vehicle.id, 'name', e.target.value)}
                      />
                    ) : (
                      vehicle.name
                    )}
                  </td>
                  <td>
                    {vehicle.isEditing ? (
                      <input
                        type="number"
                        value={vehicle.positionX}
                        onChange={(e) => handleEditChanges(vehicle.id, 'positionX', Number(e.target.value))}
                      />
                    ) : (
                      vehicle.positionX
                    )}
                  </td>
                  <td>
                    {vehicle.isEditing ? (
                      <input
                        type="number"
                        value={vehicle.positionY}
                        onChange={(e) => handleEditChanges(vehicle.id, 'positionY', Number(e.target.value))}
                      />
                    ) : (
                      vehicle.positionY
                    )}
                  </td>
                  <td>
                    {vehicle.isEditing ? (
                      <input
                        type="number"
                        value={vehicle.speed}
                        onChange={(e) => handleEditChanges(vehicle.id, 'speed', Number(e.target.value))}
                      />
                    ) : (
                      vehicle.speed
                    )}
                  </td>
                  <td>
                    {vehicle.isEditing ? (
                      <select
                        value={vehicle.direction}
                        onChange={(e) => handleEditChanges(vehicle.id, 'direction', e.target.value)}
                      >
                        <option value="up">Up</option>
                        <option value="down">Down</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                        <option value="stop">Stop</option>
                      </select>
                    ) : (
                      vehicle.direction
                    )}
                  </td>
                  <td>
                    {vehicle.isEditing ? (
                      <>
                        <button onClick={() => handleSaveChanges(vehicle.id)}>Save</button>
                        <button onClick={() => handleCancelEdit(vehicle.id)}>Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => handleEditVehicle(vehicle.id)}>Edit</button>
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleDeleteVehicle(vehicle.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
<div className="grid-container">
  {/* <canvas id="vehicleChart" width="100%" height="100%"></canvas> */}
  <div className="grid">
    {Array.from({ length: 15 }, (_, x) =>
      Array.from({ length: 6 }, (_ , y) => (
        <div
          key={`${x},${y}`}
          className="grid-cell"
          style={{
            backgroundColor: '#232020',
            border: '1px solid #39ef82', // Add a border for better visibility
          }}
        >
          {vehicles
            .filter(vehicle => vehicle.positionX === x && vehicle.positionY === y)
            .map(vehicle => (
              <div
                key={vehicle.id}
                className="vehicle-circle"
                style={{
                  backgroundColor: vehicle.color,
                }}
              >
                {vehicle.id}
              </div>
            ))}
        </div>
      ))
    )}
  </div>
</div>


    </div>
  );
};

export default Home;

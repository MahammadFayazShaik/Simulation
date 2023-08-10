import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const containerSize = "100%";
const gridSize = '20px'; // Adjust the size according to your preference

const chartHeight = "100%";
let grid = new Array(15).fill(0).map(()=>new Array(15).fill('0'))

const Home = ({ scenarios }) => {
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState('');
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [simulationTimer, setSimulationTimer] = useState(null);
  const [editedData, setEditedData] = useState(null);

  useEffect(() => {
    if (selectedScenario) {
      fetchVehicles(selectedScenario);
    }
  }, [selectedScenario]);

  useEffect(() => {
    if (simulationStarted && vehicles.length > 0) {
      updateVehiclesPosition();
     
      checkSimulationCompletion();
    }
  }, [simulationStarted, vehicles]);

  const fetchVehicles = async (scenarioId) => {
    try {
      const response = await axios.get(`http://localhost:5000/vehicles?scenarioId=${scenarioId}`);
      setVehicles(
        response.data.map((vehicle) => ({
          ...vehicle,
          remainingTime: vehicle.timeOfSimulation,
          color: getRandomColor(),
          positionX: vehicle.initialPositionX, // Set the initial positionX from the server data
          positionY: vehicle.initialPositionY, // Set the initial positionY from the server data
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
        positionX: Math.floor(Math.random() * (grid.length)), // Adjust this line
        positionY: Math.floor(Math.random() * (grid[0].length)), // Adjust this line
        direction: ['towards', 'downwards', 'backwards', 'upwards'][Math.floor(Math.random() * 4)],
      }));
  
      setVehicles(initializedVehicles);
  
      setSimulationTimer(
        setInterval(() => {
          updateVehiclesPosition();
  
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
            if (vehicle.direction === 'upwards') {
              positionY = Math.max(positionY - 1, 0); // Check for top boundary
            } else if (vehicle.direction === 'downwards') {
              positionY = Math.min(positionY + 1, chartHeight / gridSize - 1); // Check for bottom boundary
            } else if (vehicle.direction === 'backwards') {
              positionX = Math.max(positionX - 1, 0); // Check for left boundary
            } else if (vehicle.direction === 'towardst') {
              positionX = Math.min(positionX + 1, containerSize / gridSize - 1); // Check for right boundary
            }

            
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
    <div className='Home-Container'>
      <h1>Home Page</h1>
      <div className='button-container'>
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
                        <option value="upwards">Upwards</option>
                        <option value="downwards">Downwards</option>
                        <option value="backwards">Backwards</option>
                        <option value="towards">Towards</option>
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
                      <button onClick={() => handleEditVehicle(vehicle.id)}>✎</button>
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
  
  <div className="grid">
   {grid.map((x,r)=> 
   x.map((y,c)=>(
    <div
          key={`${r},${c}`}
          className="grid-cell"
          style={{
            backgroundColor: '#232020',
            border: '1px solid #39ef82', // Add a border for better visibility
          }}
        >
          {vehicles
            .filter(vehicle => vehicle.positionX-1 === r && vehicle.positionY-1 === c)
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

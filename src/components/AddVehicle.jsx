// AddVehicle.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css';

const AddVehicle = () => {
  const [vehicles, setVehicles] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState('');
  const [newVehicle, setNewVehicle] = useState({
    id: '',
    name: '',
    initialPositionX: 0,
    initialPositionY: 0,
    speed: 0,
    direction: '',
  });

  useEffect(() => {
    fetchVehicles();
    fetchScenarios();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/vehicles');
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchScenarios = async () => {
    try {
      const response = await axios.get('http://localhost:5000/scenarios');
      setScenarios(response.data);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
    }
  };

  const addVehicle = async () => {
    try {
      if (!selectedScenario) {
        alert('Please select a scenario.');
        return;
      }

      setNewVehicle((prev) => ({
        ...prev,
        scenarioId: selectedScenario,
      }));

      await axios.post('http://localhost:5000/vehicles', newVehicle);
      setNewVehicle({
        id: '',
        name: '',
        initialPositionX: 0,
        initialPositionY: 0,
        speed: 0,
        direction: '',
      });

      // Update the number of vehicles for the selected scenario
      const updatedScenarios = scenarios.map((scenario) => {
        if (scenario.id === selectedScenario) {
          return {
            ...scenario,
            numberOfVehicles: scenario.numberOfVehicles + 1,
          };
        }
        return scenario;
      });
      setScenarios(updatedScenarios);
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  };

  return (
    <div className='AddVehicle'>
    
      <h1>Add Vehicle</h1>
      <div className='input-container1'>
        <div>
        <label>Select Scenario:</label>
        <select value={selectedScenario} onChange={(e) => setSelectedScenario(e.target.value)}>
          <option value="">-- Select Scenario --</option>
          {scenarios.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.name}
            </option>
          ))}
        </select>
      </div>
     
      <div>
        <label>Vehicle Name:</label>
        <input
          type="text"
          value={newVehicle.name}
          onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
        />
      </div>
      <div>
          <label>Speed:</label>
          <input
            type="number"
            value={newVehicle.speed}
            onChange={(e) => setNewVehicle({ ...newVehicle, speed: parseInt(e.target.value) })}
          />
        </div>
        </div>
      <div className="input-container2">
        <div>
          <label>Initial Position X:</label>
          <input
            type="number"
            value={newVehicle.initialPositionX}
            onChange={(e) =>
              setNewVehicle({ ...newVehicle, initialPositionX: parseInt(e.target.value) })
            }
          />
        </div>
        <div>
          <label>Initial Position Y:</label>
          <input
            type="number"
            value={newVehicle.initialPositionY}
            onChange={(e) =>
              setNewVehicle({ ...newVehicle, initialPositionY: parseInt(e.target.value) })
            }
          />
        </div>
        
        <div>
          <label>Direction:</label>
          <select
            value={newVehicle.direction}
            onChange={(e) => setNewVehicle({ ...newVehicle, direction: e.target.value })}
          >
            <option value="">-- Select Direction --</option>
            <option value="Towards">Towards</option>
            <option value="Backwards">Backwards</option>
            <option value="Upwards">Upwards</option>
            <option value="Downwards">Downwards</option>
          </select>
        </div>
      </div>

      <button className="add-button" onClick={addVehicle}>
        Add Vehicle
      </button>
    </div>
  );
};

export default AddVehicle;

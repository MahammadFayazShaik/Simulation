// AllScenario.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import AddVehicle from './AddVehicle';
import Home from './Home';

const AllScenario = ({ onAddScenario }) => {
  const [scenarios, setScenarios] = useState([]);
  const [vehicles , setVehicles] = useState([]);

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      const response = await axios.get('http://localhost:5000/scenarios');
      setScenarios(response.data);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
    }
  };

  const handleDeleteScenario = (scenarioId) => {
    axios
      .delete(`http://localhost:5000/scenarios/${scenarioId}`)
      .then(() => {
        setScenarios((prevScenarios) =>
          prevScenarios.filter((scenario) => scenario.id !== scenarioId)
        );
      })
      .catch((error) => {
        console.error('Error deleting scenario:', error);
      });
  };

  

  return (
    <div className="AllScenario">
      <h2>All Scenarios</h2>
      <div className="button-container">
        {/* Add Scenario, Add Vehicle, and Delete All buttons */}
        <button onClick={onAddScenario}>Add Scenario</button>
        <button onClick={() => (window.location.href = '/add-vehicle')}>Add Vehicle</button>
        <button onClick={() => setScenarios([])}>Delete All</button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Scenario ID</th>
            <th>Scenario Name</th>
            <th>Scenario Time</th>
            <th>Number of Vehicles</th>
            <th>Add Vehicle</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {scenarios.map((scenario) => (
            <tr key={scenario.id}>
              <td>{scenario.id}</td>
              <td>{scenario.name}</td>
              <td>{scenario.time}</td>
              <td>{scenario.numberOfVehicles}</td>
              <td>
                <button
                  className="add-vehicles"
                  onClick={() => (window.location.href = '/add-vehicle')}
                >
                  +
                </button>
              </td>
              <td>
                <button
                  className="edit"
                  onClick={() => (window.location.href = '/edit-scenario')}
                >
                  ✎
                </button>
              </td>
              <td>
                <button
                  className="delete"
                  onClick={() => handleDeleteScenario(scenario.id)}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllScenario;

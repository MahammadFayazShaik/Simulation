// AllScenario.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const AllScenario = ({ onAddScenario, onUpdateScenario }) => {
  const [scenarios, setScenarios] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [editingScenario, setEditingScenario] = useState(null); // State to track the scenario being edited

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

  const handleEditScenario = (scenario) => {
    // Open the edit scenario form with the selected scenario details
    setEditingScenario(scenario);
  };

  const handleUpdateScenario = (updatedScenario) => {
    // Perform any validation checks and update the scenario on the server
    axios
      .put(`http://localhost:5000/scenarios/${updatedScenario.id}`, updatedScenario)
      .then((response) => {
        // Update the scenario locally in the state
        setScenarios((prevScenarios) =>
          prevScenarios.map((scenario) =>
            scenario.id === updatedScenario.id ? updatedScenario : scenario
          )
        );
        setEditingScenario(null); // Close the edit scenario form
      })
      .catch((error) => {
        console.error('Error updating scenario:', error);
        // Show an error message to the user if necessary
      });
  };

  const handleCancelEdit = () => {
    setEditingScenario(null); // Close the edit scenario form without saving changes
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
  

  const handleEditChanges = (key, value) => {
    setEditingScenario((prevScenario) => ({
      ...prevScenario,
      [key]: value,
    }));
  };

  const handleSaveChanges = () => {
    // Perform any validation checks and update the scenario on the server
    handleUpdateScenario(editingScenario);

    // Update the scenario on the Home page as well
  };

  return (
    <div className="AllScenario">
      <h2>All Scenarios</h2>
      <div className="button-container">
        {/* Add Scenario, Add Vehicle, and Delete All buttons */}
        <button onClick={() => (window.location.href = '/add-scenario')}>Add Scenario</button>
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
              <td>
                {editingScenario && editingScenario.id === scenario.id ? (
                  <input
                    type="text"
                    value={editingScenario.id}
                    onChange={(e) => handleEditChanges('id', e.target.value)}
                  />
                ) : (
                  scenario.id
                )}
              </td>
              <td>
                {editingScenario && editingScenario.id === scenario.id ? (
                  <input
                    type="text"
                    value={editingScenario.name}
                    onChange={(e) => handleEditChanges('name', e.target.value)}
                  />
                ) : (
                  scenario.name
                )}
              </td>
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
                {editingScenario && editingScenario.id === scenario.id ? (
                  <>
                    <button onClick={handleSaveChanges}>Save</button>
                    <button onClick={handleCancelEdit}>Cancel</button>
                  </>
                ) : (
                  <button onClick={() => handleEditScenario(scenario)}>✎</button>
                )}
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

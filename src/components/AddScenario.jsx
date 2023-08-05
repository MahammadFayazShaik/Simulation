import React, { useState } from 'react';
import axios from 'axios';
import "../App.css";

const AddScenario = ({ onAddScenario }) => {
  const [newScenario, setNewScenario] = useState({
    name: '',
    id: '',
    time: '',
  });

  // Function to handle input changes for new scenarios
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewScenario((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Function to handle scenario submission
  const handleSubmitScenario = () => {
    if (newScenario.name.trim() === '' || newScenario.id.trim() === '' || newScenario.time.trim() === '') {
      alert('Please enter all fields.');
      return;
    }

    // Send a POST request to JSON server to add the scenario
    axios.post('http://localhost:5000/scenarios', newScenario)
      .then((response) => {
        onAddScenario(response.data); // Update the scenarios state with the newly added scenario
        setNewScenario({
          name: '',
          id: '',
          time: '',
        });
      })
      .catch((error) => {
        console.error('Error adding scenario:', error);
      });
  };

  return (
    <div className="AddScenario">
      <h2>Add Scenario</h2>
      <div className="input-container">
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={newScenario.name} onChange={handleInputChange} />
        </div>
        <div>
          <label>ID:</label>
          <input type="text" name="id" value={newScenario.id} onChange={handleInputChange} />
        </div>
        <div>
          <label>Time:</label>
          <input type="text" name="time" value={newScenario.time} onChange={handleInputChange} />
        </div>
      </div>
      <div>
        <button onClick={handleSubmitScenario}>Add Scenario</button>
      </div>
    </div>
  );
};

export default AddScenario;

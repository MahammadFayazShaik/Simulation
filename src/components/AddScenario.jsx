// AddScenario.js
import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

const AddScenario = () => {
  const [newScenario, setNewScenario] = useState({
    name: '',
    id: '',
    time: '',
  });

  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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
      setShowErrorPopup(true);
      return;
    }

    // Send a POST request to JSON server to add the scenario
    axios
      .post('http://localhost:5000/scenarios', newScenario)
      .then((response) => {
        setNewScenario({
          name: '',
          id: '',
          time: '',
        });
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      })
      .catch((error) => {
        console.error('Error adding scenario:', error);
      });
  };

  return (
    <div className="AddScenario">
      <h2>Add Scenario</h2>
      <div className="rectangle-box123">
        <div className='input-row123'>
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
      </div>
      <div>
        <button className =" add-button"onClick={handleSubmitScenario}>Add Scenario</button>
      </div>
      {/* Error popup */}
      {showErrorPopup && (
        <div className="popup error-popup">
          All fields are required to fill.
        </div>
      )}
      {/* Success message */}
      {showSuccessMessage && (
        <div className="popup success-popup">
          Scenario added successfully!
        </div>
      )}
    </div>
  );
};

export default AddScenario;

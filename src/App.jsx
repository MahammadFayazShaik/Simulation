import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AddScenario from './components/AddScenario';
import AllScenario from './components/AllScenario';
import Home from './components/Home'; // Import the Home component
import './App.css';
import AddVehicle from './components/AddVehicle';

const App = () => {
  const [scenarios, setScenarios] = useState([]);
  const [updatedVehicle, setUpdatedVehicle] = useState(null);


  useEffect(() => {
    fetchScenarios();
  }, []);


  const onAddScenario = (newScenario) => {
    setScenarios((prevScenarios) => [...prevScenarios, newScenario]);
  };

  const fetchScenarios = async () => {
    try {
      const response = await axios.get('http://localhost:5000/scenarios');
      setScenarios(response.data);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
    }
  };
  const handleUpdateVehicle = (updatedVehicle) => {
    // Logic to handle the updated vehicle data, for example, update it in the state
    setUpdatedVehicle(updatedVehicle);
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/add-scenario" element={<AddScenario />} />
          <Route path="/all-scenarios" element={<AllScenario />} />
          <Route path="/add-vehicle" element={<AddVehicle />} />
          <Route
          exact
          path="/"
          render={() => <Home onUpdateVehicle={handleUpdateVehicle} scenarios={[] /* Add scenarios data here */} />}
        />



          <Route path="/Home" element={<Home scenarios={scenarios} />} /> {/* Pass scenarios to Home */}
          
        </Routes>
      </div>
    </Router>
  );
};

export default App;

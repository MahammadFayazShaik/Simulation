import React, { useState, useEffect } from 'react';

const GraphContainer = ({ scenario }) => {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    if (scenario) {
      setVehicles(scenario.vehicles);
    }
  }, [scenario]);

  const moveVehicles = () => {
    setVehicles((prevVehicles) => {
      return prevVehicles.map((vehicle) => {
        // Calculate new positions based on speed and direction
        let newX = vehicle.posX;
        let newY = vehicle.posY;

        switch (vehicle.direction) {
          case 'Towards':
            newX += vehicle.speed;
            break;
          case 'Backwards':
            newX -= vehicle.speed;
            break;
          case 'Upwards':
            newY -= vehicle.speed;
            break;
          case 'Downwards':
            newY += vehicle.speed;
            break;
          default:
            break;
        }

        // Limit the positions to stay within the graph container
        const containerWidth = 800; // Replace with your graph container width
        const containerHeight = 600; // Replace with your graph container height

        newX = Math.max(0, Math.min(newX, containerWidth));
        newY = Math.max(0, Math.min(newY, containerHeight));

        return {
          ...vehicle,
          posX: newX,
          posY: newY,
        };
      });
    });
  };

  useEffect(() => {
    // Start moving the vehicles when the Start Simulation button is clicked
    let interval;
    if (scenario && scenario.isSimulationStarted) {
      interval = setInterval(moveVehicles, 1000); // Adjust the interval as needed
    }
    return () => clearInterval(interval);
  }, [scenario]);

  // Styling for the graph container
  const containerStyle = {
    position: 'relative',
    width: '800px', // Replace with your desired width
    height: '600px', // Replace with your desired height
    border: '1px solid #ccc',
    margin: '20px',
  };

  // Styling for the grid lines
  const gridLineStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    borderTop: '1px dashed #ccc',
    borderLeft: '1px dashed #ccc',
    pointerEvents: 'none',
  };

  // Calculate the number of grid lines based on the container width and height
  const numHorizontalLines = Math.floor(containerStyle.height / 50);
  const numVerticalLines = Math.floor(containerStyle.width / 50);

  return (
    <div className="graph-container" style={containerStyle}>
      {/* Implement the graph here */}
      <div className="grid" style={gridLineStyle}>
        {/* Add horizontal grid lines */}
        {Array.from({ length: numHorizontalLines }).map((_, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: `${(index + 1) * (100 / numHorizontalLines)}%`,
              width: '100%',
              borderTop: '1px dashed #ccc',
            }}
          />
        ))}

        {/* Add vertical grid lines */}
        {Array.from({ length: numVerticalLines }).map((_, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${(index + 1) * (100 / numVerticalLines)}%`,
              height: '100%',
              borderLeft: '1px dashed #ccc',
            }}
          />
        ))}
      </div>

      {/* Render vehicles */}
      {vehicles.map((vehicle) => (
        <div
          key={vehicle.id}
          className="vehicle"
          style={{
            position: 'absolute',
            top: vehicle.posY,
            left: vehicle.posX,
            backgroundColor: '#007bff',
            color: '#fff',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {vehicle.name}
        </div>
      ))}
    </div>
  );
};

export default GraphContainer;

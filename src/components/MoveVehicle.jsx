import React, { useState, useEffect, useRef } from 'react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const VEHICLE_SIZE = 20;
const UPDATE_INTERVAL = 100; // 100 milliseconds

const initialVehicles = [
  { id: 1, x: 100, y: 100, direction: 'right' },
  { id: 2, x: 200, y: 200, direction: 'down' },
  { id: 3, x: 300, y: 150, direction: 'left' },
  { id: 4, x: 400, y: 300, direction: 'up' },
];

const MoveVehicle = () => {
  const canvasRef = useRef(null);
  const [vehicles, setVehicles] = useState(initialVehicles);

  const drawVehicle = (ctx, vehicle) => {
    ctx.fillRect(vehicle.x, vehicle.y, VEHICLE_SIZE, VEHICLE_SIZE);
  };

  const drawVehicles = (ctx) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = 'blue';
    vehicles.forEach((vehicle) => drawVehicle(ctx, vehicle));
  };

  const moveVehicles = () => {
    setVehicles((prevVehicles) =>
      prevVehicles.map((vehicle) => {
        const { x, y, direction } = vehicle;
        if (direction === 'up') {
          return { ...vehicle, y: y - 5 };
        } else if (direction === 'down') {
          return { ...vehicle, y: y + 5 };
        } else if (direction === 'left') {
          return { ...vehicle, x: x - 5 };
        } else if (direction === 'right') {
          return { ...vehicle, x: x + 5 };
        }
        return vehicle;
      })
    );
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const updateInterval = setInterval(moveVehicles, UPDATE_INTERVAL);

    return () => clearInterval(updateInterval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    drawVehicles(ctx);
  }, [vehicles]);

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />;
};

export default MoveVehicle;

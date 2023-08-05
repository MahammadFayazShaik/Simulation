import React from 'react';
import { Link } from 'react-router-dom';


const Navbar = ({ setActiveItem }) => {
  return (
    <div className="navbar" >
         <Link to="/Home" className="nav-item">
        Home
      </Link> <Link to="/add-scenarios" className="nav-item">
        Add Scenarios
      </Link> <Link to="/all-scenarios" className="nav-item">
        All Scenarios
      </Link> <Link to="/add-Vehicle" className="nav-item">
        Add Vehicles
      </Link>
    </div>
  );
};

export default Navbar;

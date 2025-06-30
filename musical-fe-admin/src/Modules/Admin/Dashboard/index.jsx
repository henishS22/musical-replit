import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { mainStyles } from './dashboardStyles';

// import Topbar from './Components/Topbar';
import StatCard from './Components/StatCard';
import Graph from './Components/Graph/Graph';

function Dashboard() {
  const classes = mainStyles();

  const [graphType, setGraphType] = useState("Revenue");

  return (
    <Box className={classes.box}>
      {/* <Topbar /> */}
      <StatCard setGraphType={setGraphType}/>
      <Graph type={graphType} />
    </Box>
  );
}

export default Dashboard;

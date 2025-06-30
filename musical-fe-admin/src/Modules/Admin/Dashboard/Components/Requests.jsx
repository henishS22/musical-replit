import React from 'react';
import { Typography } from '@material-ui/core';

import { requestStyles } from '../dashboardStyles';
import RequestSingle from './RequestSingle';

function Requests() {
  const classes = requestStyles();
  return (
    <div className={classes.pLeft}>
      <Typography variant="h5" className={classes.header}> All Requests </Typography>
      <RequestSingle />
      <RequestSingle />
      <RequestSingle />
      <RequestSingle />
      <RequestSingle />
      <RequestSingle />
      <RequestSingle />
    </div>
  );
}

export default Requests;

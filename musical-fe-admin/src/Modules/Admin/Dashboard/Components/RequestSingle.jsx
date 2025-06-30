import React from 'react';
import { Box, Typography, Button } from '@material-ui/core';

import { requestStyles } from '../dashboardStyles';

function RequestSingle() {
  const classes = requestStyles();
  return (
    <Box className={classes.mBottom}>
      <Box className={classes.dFlex}>
        <Box className={classes.w85}>
          <Typography className={classes.subContent}>
            Lorem ipsum dolor sit amet,
            consectetur adipiscing elit.
            Praesent sit amet ullamcorper nunc.
          </Typography>
          <Typography className={classes.content}>
            Praesent sit amet ullamcorper nunc.
            Phasellus finibus fringilla ultrices ex semper nec.
            Curabitur blandit ultrices turpis.
            In augue lacus, tempus vitae tellus quis.
          </Typography>
        </Box>
        <Box className={classes.timeStamp}>
          <Typography className={classes.time}>4hrs ago</Typography>
        </Box>
      </Box>
      <Button
        variant="contained"
        className={classes.button}
      >
        View
      </Button>
    </Box>
  );
}

export default RequestSingle;

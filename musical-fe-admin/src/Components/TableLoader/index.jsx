import React from 'react';
import { Box, CircularProgress } from '@material-ui/core';
import { loaderStyles } from './loaderStyles';

// eslint-disable-next-line import/prefer-default-export
export const Loader = () => {
  const classes = loaderStyles();
  return (
    <Box className={classes.mainComponent}>
      <CircularProgress size={40} style={{ color: 'white' }}/>
    </Box>
  );
};

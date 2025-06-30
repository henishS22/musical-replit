/* eslint-disable react/prop-types */
import React from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import { Grid, Box } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { permissons } from '_mocks/permissonLabels';
import { SwitchStyles2, topBarStyles } from '../../administratorStyles';

export default function Switch({
  permissionLabel,
  permissionName,
  value,
}) {
  const classes = topBarStyles();
  return (
    <FormGroup>
      <Typography component="div">
        <Grid container alignItems="center" spacing={1}>
          <Grid item>
            <Typography className={classes.permissKey}>{permissionLabel}</Typography>
            <Box className={classes.displayFlex}>
              {Object.entries(value).map(([key2, value1]) => [
                key2 !== 'label' ? (
                  <Box className={classes.displayFlex1}>
                    <SwitchStyles2
                      key="1"
                      name="View"
                      checked={value1}
                      isReadOnly
                      id={`permissions.${permissionName}.${key2}`}
                    />
                    <Typography className={classes.labelKey}>
                      {permissons[permissionName][key2]}
                    </Typography>
                  </Box>
                ) : null,
              ])}
            </Box>
          </Grid>
        </Grid>
      </Typography>
    </FormGroup>
  );
}

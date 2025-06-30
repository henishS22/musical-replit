/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { SwitchStyles } from '../tableStyles';

export default function CustomizedSwitches({ status }) {
  return (
    <FormGroup>
      <Typography component="div">
        <Grid component="label" container alignItems="center" spacing={1}>
          <Grid item>
            <SwitchStyles checked={status} readOnly name="checkedC" />
          </Grid>
        </Grid>
      </Typography>
    </FormGroup>
  );
}

import React from "react";
import Grid from "@material-ui/core/Grid";
import { topBarStyles } from "./TopbarStyles";
import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";
import ArrowDown from "../../../../../Components/DropDownIcon/ArrowDown";

// eslint-disable-next-line react/prop-types
export default function TopBar({ interval, setInterval, loading, title }) {
  const classes = topBarStyles();

  const handleChange = (e) => {
    const value = e.target.value;
    setInterval(value);
  };

  return (
    // <div className={classes.root}>
    <div className={classes.revenuePadding}>
      <Grid container spacing={3}>
        <Grid item xs={12} xl={12} md={12} lg={12}>
          <div className={classes.topBarFlex}>
            <h1 className={classes.title}>{title}</h1>
            <FormControl
              variant="outlined"
              className={`${classes.formControl} ${classes.width93}`}
              size="small"
            >
              <InputLabel
                id="interval-select-label"
                className={classes.inputLabel}
              >
                Interval
              </InputLabel>
              <Select
                labelId="interval-select-label"
                id="interval-select"
                className={classes.selectTag}
                value={interval}
                onChange={handleChange}
                style={{ width: "150px" }}
                label="Interval"
                IconComponent={ArrowDown}
                disabled={loading}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
          </div>
        </Grid>
      </Grid>
    </div>
  );
}

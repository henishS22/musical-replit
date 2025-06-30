/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from "react";
import Popover from "@material-ui/core/Popover";
import DateFnsUtils from "@date-io/date-fns";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import Button from "@material-ui/core/Button";
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";

import Filter from "Assets/Svg/filter";
// import ArrowDown from "Components/DropDownIcon/ArrowDown";
import ArrowDownIcon from "Assets/Svg/arrowdown";
import { ReactComponent as CloseIcon } from "Assets/Svg/closeMedium.svg";
import { useStyles } from "./FilterStyles";
// import { useQuery } from "@apollo/client";
// import { GET_ALL_USERS_ADMIN } from "graphql/query/admin";

export default function SimplePopover({
  // eslint-disable-next-line no-unused-vars
  setFilter,
  setActionPerformed,
  setCategoryFilter,
  userFilter,
}) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [finalAppliedAdminFilters, setFinalAppliedAdminFilters] = useState();
  const [userFilters, setUserFilters] = useState({
    // nomineeStatus: "",
    // kycStatus: "",
    createdAtFrom: new Date(),
    createdAtTo: new Date(),
  });

  const handleClose = () => {
    setAnchorEl(null);
  };

  const resetFilter = () => {
    setFilter(false);
    setCategoryFilter();
    setUserFilters({
      // nomineeStatus: "",
      // kycStatus: "",
      createdAtFrom: new Date(),
      createdAtTo: new Date(),
    });
    setFinalAppliedAdminFilters();
    handleClose();
  };

  useEffect(() => {
    if (!userFilter) {
      resetFilter();
    }
  }, [userFilter]);

  const filterRoles = () => {
    try {
      setFilter(true);
      setCategoryFilter(finalAppliedAdminFilters);
      setActionPerformed(true);
      handleClose();
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      <Button
        aria-describedby={id}
        variant="contained"
        onClick={handleClick}
        startIcon={<Filter />}
        endIcon={<ArrowDownIcon />}
        className={classes.filterButton}
      >
        <Typography className={classes.filterText}>Filter</Typography>
      </Button>
      <div>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          classes={{ paper: classes.popUp3 }}
          marginThreshold={20}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          anchorPosition={{ left: 20, top: 0 }}
        >
          <Box className={`${classes.popUp2}`}>
            <div className={classes.topBar}>
              <span
                role="button"
                tabIndex={0}
                onKeyDown={handleClose}
                onClick={handleClose}
                className={`${classes.onHover} ${classes.closeBtn}`}
              >
                <CloseIcon />
              </span>
            </div>
            <Grid container className="date-pick1">
              <Grid
                item
                style={{
                  display: "flex",
                  marginBottom: "20px",
                  marginTop: "40px",
                }}
              >
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <DatePicker
                    autoOk
                    label="From"
                    clearable
                    format="dd/MM/yyyy"
                    disableFuture
                    style={{
                      background: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid #CCCCCC",
                      borderRadius: "4px",
                      marginTop: "-10px",
                      marginLeft: "8px",
                      width: "45%",
                      paddingLeft: "5px",
                    }}
                    value={userFilters?.createdAtFrom || null}
                    onChange={(e) => {
                      setUserFilters({
                        ...userFilters,
                        createdAtFrom: e,
                      });
                      setFinalAppliedAdminFilters({
                        ...finalAppliedAdminFilters,
                        createdAtFrom: e,
                      });
                    }}
                    views={["year", "month", "date"]}
                  />
                  <DatePicker
                    autoOk
                    label="To"
                    clearable
                    format="dd/MM/yyyy"
                    disableFuture
                    style={{
                      background: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid #CCCCCC",
                      borderRadius: "4px",
                      marginTop: "-10px",
                      marginLeft: "8px",
                      paddingLeft: "5px",
                      width: "45%",
                    }}
                    minDate={userFilters?.createdAtFrom || null}
                    value={userFilters.createdAtTo}
                    onChange={(e) => {
                      setUserFilters({
                        ...userFilters,
                        createdAtTo: e,
                      });
                      setFinalAppliedAdminFilters({
                        ...finalAppliedAdminFilters,
                        createdAtTo: e,
                      });
                    }}
                    views={["year", "month", "date"]}
                  />
                </MuiPickersUtilsProvider>
              </Grid>
              <Grid />
            </Grid>
            <Grid container>
              <Grid item style={{ width: "50%" }}>
                <Button
                  onClick={resetFilter}
                  variant="contained"
                  className={classes.buttonReset}
                >
                  Reset
                </Button>
              </Grid>
              <Grid item style={{ width: "50%" }}>
                <Button
                  variant="contained"
                  onClick={filterRoles}
                  className={classes.buttonApply}
                  color="primary"
                >
                  Apply
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Popover>
      </div>
    </div>
  );
}

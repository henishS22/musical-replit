/* eslint-disable react/prop-types */
/* eslint-disable array-callback-return */
import React, { useState, useEffect } from "react";
import Popover from "@material-ui/core/Popover";
import Button from "@material-ui/core/Button";
import DateFnsUtils from "@date-io/date-fns";
import { useQuery } from "@apollo/client";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";

import { GET_ALL_ADMINS, GET_ALL_ROLES } from "graphql/query/admin";
import Filter from "Assets/Svg/filter";
import ArrowDown from "Components/DropDownIcon/ArrowDown";
import ArrowDownIcon from "Assets/Svg/arrowdown";
import { useStyles } from "./FilterStyles";
import "./style.scss";

export default function SimplePopover({
  value,
  setRoleFilter,
  setFilter,
  setAdminFilter,
  setActionPerformed,
  adminFilter,
  roleFilter,
}) {
  const classes = useStyles();
  const [page, setPage] = useState(1);
  const [page1, setPage1] = useState(1);
  const [finalAppliedAdminFilters, setFinalAppliedAdminFilters] = useState();
  const [finalAppliedRoleFilters, setFinalAppliedRoleFilters] = useState();
  const [roleFilters, setRoleFilters] = useState({
    createdById: "",
    createdAtFrom: new Date(),
    createdAtTo: new Date(),
  });

  const [adminFilters, setAdminFilters] = useState({
    isActiveBool: "",
    roleId: "",
    mobileVerifiedAtFrom: new Date(),
    mobileVerifiedAtTo: new Date(),
    createdAtFrom: new Date(),
    createdAtTo: new Date(),
  });
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorEl1, setAnchorEl1] = useState(null);

  const { data, refetch } = useQuery(GET_ALL_ADMINS, {
    variables: {
      first: 10 * page,
      orderBy: "createdAt_DESC",
      filters: {
        isActiveBool: "true",
      },
    },
    fetchPolicy: "network-only",
  });
  const { data: roleData, refetch: refetchAdmin } = useQuery(GET_ALL_ROLES, {
    variables: {
      first: 10 * page1,
      orderBy: "createdAt_DESC",
      filters: {
        isActiveBool: "true",
      },
    },
    fetchPolicy: "network-only",
  });

  // useEffect(() => {
  //   if (data) {
  //     setAdmins(data.admins.edges);
  //     if (data.admins.pageInfo.hasNextPage) {
  //       setPage(page + 1);
  //       refetch();
  //     }
  //   }
  //   if (roleData) {
  //     setRoles(roleData.roles.edges);
  //     if (roleData.roles.pageInfo.hasNextPage) {
  //       setPage1(page1 + 1);
  //       refetchAdmin();
  //     }
  //   }
  // }, [data, roleData]);

  useEffect(() => {
    if (!adminFilter && !roleFilter) {
      resetFilter();
    }
  }, [adminFilter, roleFilter]);

  useEffect(() => {
    if (data) {
      setAdmins(data.admins.edges);
      if (data.admins.pageInfo.hasNextPage) {
        setPage((prevPage) => prevPage + 1);
        refetch();
      }
    }
  }, [data, refetch]);

  useEffect(() => {
    if (roleData) {
      setRoles(roleData.roles.edges);
      if (roleData.roles.pageInfo.hasNextPage) {
        setPage1((prevPage1) => prevPage1 + 1);
        refetchAdmin();
      }
    }
  }, [roleData, refetchAdmin]);

  const handleClose = () => {
    if (value === 0) setAnchorEl(null);
    else setAnchorEl1(null);
  };

  // const filterRoles = () => {
  //   if (value === 0) {
  //     setFilter(true);
  //     setAdminFilter(finalAppliedAdminFilters);
  //     setActionPerformed(true);
  //     handleClose();
  //   } else {
  //     setFilter(true);
  //     setRoleFilter(finalAppliedRoleFilters);
  //     setActionPerformed(true);
  //     handleClose();
  //   }
  // };

  const filterRoles = () => {
    try {
      if (value === 0) {
        setFilter(true);
        setAdminFilter(finalAppliedAdminFilters);
      } else {
        setFilter(true);
        setRoleFilter(finalAppliedRoleFilters);
      }
      setActionPerformed(true);
      handleClose();
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  const resetFilter = () => {
    if (value === 0) {
      setFilter(false);
      setAdminFilter();
      setAdminFilters({
        isActiveBool: "true",
        roleId: "",
        mobileVerifiedAtFrom: new Date(),
        mobileVerifiedAtTo: new Date(),
        createdAtFrom: new Date(),
        createdAtTo: new Date(),
      });
      setFinalAppliedAdminFilters();
      handleClose();
    } else {
      setFilter(false);
      setRoleFilter();
      setRoleFilters({
        createdById: "",
        createdAtFrom: new Date(),
        createdAtTo: new Date(),
      });
      setFinalAppliedRoleFilters();
      handleClose();
    }
  };

  const handleClick = (event) => {
    if (value === 0) setAnchorEl(event.currentTarget);
    else setAnchorEl1(event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const open1 = Boolean(anchorEl1);
  const id = open ? "simple-popover" : undefined;
  const id1 = open1 ? "simple-popover" : undefined;

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
          style={{ marginTop: "7px" }}
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
          <Box className={classes.popUp}>
            <Grid container style={{ width: "100%" }}>
              {/* <Grid item style={{ width: "50%" }}>
                <FormControl
                  variant="outlined"
                  className={classes.formControl}
                  size="small"
                >
                  <InputLabel
                    id="demo-simple-select-outlined-label"
                    className={classes.inputLabel}
                  >
                    Status
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-outlined-label"
                    MenuProps={{ classes: { paper: classes.dropdownStyle } }}
                    id="demo-simple-select-outlined"
                    value={adminFilters.isActiveBool}
                    className={classes.selectTag}
                    onChange={(e) => {
                      setAdminFilters({
                        ...adminFilters,
                        isActiveBool: e.target.value,
                      });
                      setFinalAppliedAdminFilters({
                        ...finalAppliedAdminFilters,
                        isActiveBool: e.target.value,
                      });
                    }}
                    name="status"
                    label="Status"
                    IconComponent={ArrowDown}
                  >
                    <MenuItem value="true">Active</MenuItem>
                    <MenuItem value="false">Disabled</MenuItem>
                  </Select>
                </FormControl>
              </Grid> */}
              <Grid item style={{ width: "100%" }}>
                <FormControl
                  variant="outlined"
                  className={classes.formControl}
                  size="small"
                >
                  <InputLabel
                    id="demo-simple-select-outlined-label"
                    className={classes.inputLabel}
                  >
                    Role
                  </InputLabel>
                  <Select
                    style={{ width: "100%" }}
                    labelId="demo-simple-select-outlined-label"
                    MenuProps={{ classes: { paper: classes.dropdownStyle } }}
                    id="demo-simple-select-outlined"
                    value={adminFilters.roleId}
                    className={classes.selectTag}
                    onChange={(e) => {
                      setAdminFilters({
                        ...adminFilters,
                        roleId: e.target.value,
                      });
                      setFinalAppliedAdminFilters({
                        ...finalAppliedAdminFilters,
                        roleId: e.target.value,
                      });
                    }}
                    label="Role"
                    name="role"
                    IconComponent={ArrowDown}
                  >
                    {roles.length > 0 &&
                      roles.map((ev) => (
                        <MenuItem value={ev.node.id}>{ev.node.name}</MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
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
                  onClick={filterRoles}
                  variant="contained"
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
      {value === 1 && (
        <div>
          <Popover
            id={id1}
            open={open1}
            anchorEl={anchorEl1}
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
            <Box className={classes.popUp1}>
              {/* <Grid container style={{ width: "100%", marginBottom: "20px" }}>
                <Grid
                  item
                  className={classes.width100}
                  style={{ marginBottom: "-20px" }}
                >
                  <FormControl
                    variant="outlined"
                    className={`${classes.formControl} ${classes.width93}`}
                    size="small"
                  >
                    <InputLabel
                      id="demo-simple-select-outlined-label"
                      className={classes.inputLabel}
                    >
                      Created By
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-outlined-label"
                      MenuProps={{ classes: { paper: classes.dropdownStyle } }}
                      id="demo-simple-select-outlined"
                      value={roleFilters.createdById}
                      onChange={(e) => {
                        setRoleFilters({
                          ...roleFilters,
                          createdById: e.target.value,
                        });
                        setFinalAppliedRoleFilters({
                          ...finalAppliedRoleFilters,
                          createdById: e.target.value,
                        });
                      }}
                      label="Created By"
                      className={classes.selectTag}
                      IconComponent={ArrowDown}
                    >
                      {admins.length > 0 &&
                        admins.map((ev) => (
                          <MenuItem value={ev.node.id}>
                            {ev.node.fullName}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid> 
              </Grid>*/}
              <Grid container className="date-pick1">
                <Grid item style={{ display: "flex", marginBottom: "10px" }}>
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
                        width: "46%",
                        paddingLeft: "5px",
                      }}
                      value={roleFilters.createdAtFrom}
                      views={["year", "month", "date"]}
                      onChange={(e) => {
                        setRoleFilters({
                          ...roleFilters,
                          createdAtFrom: e,
                        });
                        setFinalAppliedRoleFilters({
                          ...finalAppliedRoleFilters,
                          createdAtFrom: e,
                        });
                      }}
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
                        width: "46%",
                      }}
                      minDate={roleFilters.createdAtFrom}
                      value={roleFilters.createdAtTo}
                      views={["year", "month", "date"]}
                      onChange={(e) => {
                        setRoleFilters({
                          ...roleFilters,
                          createdAtTo: e,
                        });
                        setFinalAppliedRoleFilters({
                          ...finalAppliedRoleFilters,
                          createdAtTo: e,
                        });
                      }}
                    />
                  </MuiPickersUtilsProvider>
                </Grid>
                <Grid />
              </Grid>
              <Grid container>
                <Grid item style={{ width: "50%" }}>
                  <Button
                    variant="contained"
                    onClick={resetFilter}
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
      )}
    </div>
  );
}

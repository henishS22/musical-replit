/* eslint-disable react/prop-types */
import React from "react";
import Grid from "@material-ui/core/Grid";

import Selected from "Components/Selected/Selected";
import { topBarStyles } from "./TopbarStyles";
import Search from "./Components/SearchBar/Search";
import Button1 from "./Components/Button/Button";

export default function TopBar({
  setSearchQuery,
  searchQuery,
  userFilter,
  setUserFilter,
  setActionPerformed,
  setFilter,
  view = false,
  onButtonClick,
}) {
  const classes = topBarStyles();
  const onClick = () => {
    setFilter(false);
    setUserFilter();
  };
  return (
    <div
      className={`${view ? classes.root1 : classes.root}`}
      style={{ marginBottom: "30px" }}
    >
      <Grid container spacing={3}>
        <Grid
          item
          xs={6}
          xl={6}
          md={6}
          lg={6}
          className={classes.dFlex}
          style={{ justifyContent: "unset" }}
        >
          <Grid item className={classes.dFlex1}>
            {/* <Filter
              setFilter={setFilter}
              setActionPerformed={setActionPerformed}
              setCategoryFilter={setUserFilter}
              userFilter={userFilter}
            /> */}
            {userFilter && <Selected text="Clear Filters" onClick={onClick} />}
          </Grid>
        </Grid>
        <Grid item xs={6} className={classes.dFlex}>
          <Grid item className={classes.positionRelative}>
            <Search
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              text="Search Users..."
              flag
            />
          </Grid>
          <Grid item>
            <Button1 title="Create Quest" onButtonClick={onButtonClick} />
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

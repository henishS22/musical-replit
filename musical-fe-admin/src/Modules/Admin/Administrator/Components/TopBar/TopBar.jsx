/* eslint-disable react/prop-types */
import React, { useState } from "react";
import Grid from "@material-ui/core/Grid";

import Selected from "Components/Selected/Selected";
import { topBarStyles } from "../../administratorStyles";
import Filter from "./Filter/Filter";
import Search from "./Search";
import Button from "./Button";

export default function TopBar({
  onButtonClick,
  onCreateClick,
  title,
  value,
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  setFilter,
  setActionPerformed,
  setAdminFilter,
  adminFilter,
}) {
  const classes = topBarStyles();

  const onClick = () => {
    if (value === 0) {
      setFilter(false);
      setAdminFilter();
    } else {
      setFilter(false);
      setRoleFilter();
    }
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={6} xl={6} md={6} lg={6} className={classes.dFlex1}>
          {/* {
            value === 0 && */}
          <Filter
            roleFilter={roleFilter}
            setAdminFilter={setAdminFilter}
            setRoleFilter={setRoleFilter}
            setFilter={setFilter}
            adminFilter={adminFilter}
            value={value}
            setActionPerformed={setActionPerformed}
          />
          {/* } */}
          {(roleFilter || adminFilter) && (
            <Selected text="Clear Filters" onClick={onClick} />
          )}
        </Grid>
        <Grid item xs={6} className={classes.dFlex}>
          <Grid item className={classes.positionRelative}>
            {value === 0 && (
              <Search
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                text="Search Admin..."
              />
            )}
            {value === 1 && (
              <Search
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                text="Search Role..."
              />
            )}
          </Grid>
          <Grid item>
            <Button
              title={title}
              onButtonClick={onButtonClick}
              onCreateClick={onCreateClick}
            />
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

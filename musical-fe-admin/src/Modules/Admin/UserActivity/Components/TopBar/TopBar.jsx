/* eslint-disable react/prop-types */
import Grid from "@material-ui/core/Grid";

import { topBarStyles } from "./TopbarStyles";
import Search from "./Components/SearchBar/Search";

export default function TopBar({
  setSearchQuery,
  searchQuery,
}) {
  const classes = topBarStyles();

  return (
    <div
      className={classes.root}
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
          </Grid>
        </Grid>
        <Grid item xs={6} className={classes.dFlex}>
          <Grid item className={classes.positionRelative}>
            {/* <Search
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              text="Search Users..."
              flag
            /> */}
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

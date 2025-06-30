import React from "react";
import { Box, Grid, Typography } from "@material-ui/core";
import AdminLogo from "../../Assets/Svg/logo.svg";
import { useStyles } from "./Login/LoginStyles";

const LogoHead = () => {
  const classes = useStyles();

  return (
    <>
      <Grid item className={`${classes.displayFlex1} ${classes.width100}`}>
        <Box
          style={{
            background: "white",
          }}
        >
          <img src={AdminLogo} alt="large-logo" height={50} width={200} />
        </Box>
      </Grid>
      <Grid item className={`${classes.displayFlex1} ${classes.width100}`}>
        <Typography className={classes.heading2}>
          Welcome to Admin Platform
        </Typography>
        {/* <Typography variant="h6" className={classes.heading1}> Admin</Typography> */}
        {/* <Typography className={classes.heading2}>Platform</Typography> */}
      </Grid>
    </>
  );
};

export default LogoHead;

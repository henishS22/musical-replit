import React, { useState } from "react";
import { Box } from "@material-ui/core";

import { tabStyles } from "./styles";
import Table from "./Components/Table/Table";

const Gamification = () => {
  const classes = tabStyles();
  const [errorMsg, setErrorMsg] = useState("");

  return (
    <>
      <Box>
        <Box className={classes.paddingAll}>
          <Box className={classes.headBox}>
            <Box className={classes.headingText}>Gamification List</Box>
          </Box>
      </Box>
        <Box className={classes.paddingAll}>
          <Table errorMsg={errorMsg} setErrorMsg={setErrorMsg} />
        </Box>
      </Box>
    </>
  );
};

export default Gamification;

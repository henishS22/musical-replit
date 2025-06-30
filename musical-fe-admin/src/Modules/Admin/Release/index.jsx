import React, { useState } from "react";
import { Box } from "@material-ui/core";

import { tabStyles } from "./styles";
import Topbar from "./Components/TopBar/TopBar";
import Table from "./Components/Table/Table";

const Release = () => {
  const classes = tabStyles();
  const [actionPerformed, setActionPerformed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  // const [searchQuery, setSearchQuery] = useState("");
  // const [filter, setFilter] = useState(false);
  // const [userFilter, setUserFilter] = useState();

  return (
    <Box>
      {/* <Topbar
        userFilter={userFilter}
        setActionPerformed={setActionPerformed}
        setUserFilter={setUserFilter}
        setFilter={setFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      /> */}
      <Box className={classes.paddingAll}>
        <Table
          // userFilter={userFilter}
          // filter={filter}
          errorMsg={errorMsg}
          setErrorMsg={setErrorMsg}
          actionPerformed={actionPerformed}
          setActionPerformed={setActionPerformed}
          // searchQuery={searchQuery}
        />
      </Box>
    </Box>
  );
};

export default Release;

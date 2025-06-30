import React, { useState } from "react";
import { Box } from "@material-ui/core";

import { tabStyles } from "./styles";
import Topbar from "./Components/TopBar/TopBar";
import Table from "./Components/Table/Table";

const UserActivity = () => {
  const classes = tabStyles();
  const [actionPerformed, setActionPerformed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Box>
      <Topbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <Box className={classes.paddingAll}>
        <Table
          errorMsg={errorMsg}
          setErrorMsg={setErrorMsg}
          actionPerformed={actionPerformed}
          setActionPerformed={setActionPerformed}
          searchQuery={searchQuery}
        />
      </Box>
    </Box>
  );
};

export default UserActivity;

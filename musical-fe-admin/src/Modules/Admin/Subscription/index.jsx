import React, { useEffect, useState } from "react";
import { Box } from "@material-ui/core";

import { tabStyles } from "./styles";
import Topbar from "./Components/TopBar/TopBar";
import Table from "./Components/Table/Table";
import Button1 from "./Components/TopBar/Components/Button/Button";
import TablePP from "./Components/Table/TablePP";
import PlanForm from "./Components/planForm";
import { useQuery } from "@apollo/client";
import { ADMIN_PROFILE } from "graphql/query/admin";
import SubscriptionForm from "./Components/subscriptionForm";

const Subscription = () => {
  const classes = tabStyles();
  const [actionPerformed, setActionPerformed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState(false);
  const [userFilter, setUserFilter] = useState();
  const [openModalSubsPlanCreate, setOpenModalSubsPlanCreate] = useState(false);
  const [openModalSubsPlanEdit, setOpenModalSubsPlanEdit] = useState(false);
  const [openModalSubsPlanView, setOpenModalSubsPlanView] = useState(false);
  const [modePP, setModePP] = useState("create");
  const [subId, setSubId] = useState("");
  const [modeSub, setModeSub] = useState("create");
  const [openSubscriptionFormCreate, setOpenSubscriptionFormCreate] =
    useState(false);
  const [openSubscriptionFormEdit, setOpenSubscriptionFormEdit] =
    useState(false);
  const [openSubscriptionFormView, setOpenSubscriptionFormView] =
    useState(false);

  const { data, loading, error, refetch } = useQuery(ADMIN_PROFILE, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <>
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
          <Box className={classes.headBox}>
            <Box className={classes.headingText}>Subscription Plans</Box>
            <Button1
              title="Create Plan"
              onButtonClick={() => {
                setOpenSubscriptionFormCreate(true);
                setModeSub("create");
              }}
            />
          </Box>
        </Box>
        <Box className={classes.paddingAll}>
          <Table
            userFilter={userFilter}
            filter={filter}
            errorMsg={errorMsg}
            setErrorMsg={setErrorMsg}
            actionPerformed={actionPerformed}
            setActionPerformed={setActionPerformed}
            searchQuery={searchQuery}
            setModeSub={setModeSub}
            setSubId={setSubId}
            setOpenSubscriptionFormEdit={setOpenSubscriptionFormEdit}
            setOpenSubscriptionFormView={setOpenSubscriptionFormView}
            subId={subId}
          />
        </Box>
      </Box>
      <Box>
        <Box className={classes.paddingAll}>
          <Box className={classes.headBox}>
            <Box className={classes.headingText}>Personalised Plans</Box>
            <Button1
              title="Create Plan"
              onButtonClick={() => {
                setOpenModalSubsPlanCreate(true);
                setModePP("create");
              }}
            />
          </Box>
        </Box>
        <Box className={classes.paddingAll}>
          <TablePP
            userFilter={userFilter}
            filter={filter}
            errorMsg={errorMsg}
            setOpenModalSubsPlanEdit={setOpenModalSubsPlanEdit}
            setOpenModalSubsPlanView={setOpenModalSubsPlanView}
            setModePP={setModePP}
            setSubId={setSubId}
            subId={subId}
            setErrorMsg={setErrorMsg}
            actionPerformed={actionPerformed}
            setActionPerformed={setActionPerformed}
            searchQuery={searchQuery}
          />
        </Box>
      </Box>
      {openModalSubsPlanCreate && (
        <PlanForm
          open={openModalSubsPlanCreate}
          adminData={data}
          modePP={modePP}
          subId={subId}
          setActionPerformed={setActionPerformed}
          handleClose={() => setOpenModalSubsPlanCreate(false)}
        />
      )}
      {openModalSubsPlanEdit && (
        <PlanForm
          open={openModalSubsPlanEdit}
          adminData={data}
          modePP={modePP}
          setActionPerformed={setActionPerformed}
          subId={subId}
          handleClose={() => setOpenModalSubsPlanEdit(false)}
        />
      )}
      {openModalSubsPlanView && (
        <PlanForm
          open={openModalSubsPlanView}
          adminData={data}
          setActionPerformed={setActionPerformed}
          modePP={modePP}
          subId={subId}
          handleClose={() => setOpenModalSubsPlanView(false)}
        />
      )}
      {openSubscriptionFormCreate && (
        <SubscriptionForm
          open={openSubscriptionFormCreate}
          adminData={data}
          modeSub={modeSub}
          setActionPerformed={setActionPerformed}
          handleClose={() => setOpenSubscriptionFormCreate(false)}
        />
      )}
      {openSubscriptionFormEdit && (
        <SubscriptionForm
          open={openSubscriptionFormEdit}
          adminData={data}
          modeSub={modeSub}
          subId={subId}
          setActionPerformed={setActionPerformed}
          handleClose={() => setOpenSubscriptionFormEdit(false)}
        />
      )}
      {openSubscriptionFormView && (
        <SubscriptionForm
          open={openSubscriptionFormView}
          adminData={data}
          subId={subId}
          setActionPerformed={setActionPerformed}
          modeSub={modeSub}
          handleClose={() => setOpenSubscriptionFormView(false)}
        />
      )}
    </>
  );
};

export default Subscription;

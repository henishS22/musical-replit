/* eslint-disable react/jsx-props-no-spreading */
import { Button, Container, Grid, Typography, Box } from "@material-ui/core";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Link } from "react-router-dom";
import { useLocation } from "react-router";

import { labels } from "_mocks/permissonLabels";
import { Loader } from "Components/TableLoader/index";
import SuccessModal from "Components/Modal/SuccessModal";
import ConfirmationModal from "Components/Modal/ConfirmationModal";
import { VIEW_ADMIN } from "graphql/query/admin";
import { DISABLE_ADMIN } from "graphql/mutation/admin";
import Switch from "../Switch/Switch";
import { useStyles } from "./AdminDetailsStyle";

const AdminDetails = () => {
  const classes = useStyles();
  const [errorMsg, setErrorMsg] = useState("");
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [disableConfirmation, setDisableConfirmation] = React.useState(false);
  const [disable, setDisable] = React.useState(false);
  const { state } = useLocation();
  const { id = "" } = state || "";
  const [disableAdmin] = useMutation(DISABLE_ADMIN);
  const { data, loading, error, refetch } = useQuery(VIEW_ADMIN, {
    variables: {
      adminId: id,
      orderBy: "createdAt_DESC",
      first: 10,
    },
    fetchPolicy: "network-only",
  });

  const handleOnDisableSuccess = async () => {
    try {
      setErrorMsg("");
      const response = await disableAdmin({
        variables: {
          input: {
            id,
          },
        },
      });
      const { message, status } = response.data.disableAdmin;
      if (status === "error") {
        setErrorMsg(message);
        setDisable(false);
      } else {
        refetch();
        setOpenSuccessModal(true);
        setDisableConfirmation(true);
        setDisable(false);
        setTimeout(() => {
          setDisableConfirmation(false);
        }, 2000);
      }
    } catch (err) {
      setErrorMsg("Something went wrong!");
      setDisable(false);
    }
  };
  const handleSuceessClose = () => {
    setOpenSuccessModal(false);
    setDisableConfirmation(false);
  };
  const handleDisableClose = () => {
    setDisable(false);
  };

  useEffect(() => {
    if (state === null) setErrorMsg("No Admin exists !");
  }, [state]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Container
        maxWidth={false}
        disableGutters
        className={classes.roleContainer}
      >
        <Typography variant="subtitle1" className={classes.error}>
          Something Went Wrong !
        </Typography>
      </Container>
    );
  }

  const { admin } = data;
  const {
    fullName,
    email,
    mobile,
    countryCode,
    role,
    permissions,
    createdAt,
    isActive,
  } = admin;
  return (
    <Container maxWidth={false} disableGutters className={classes.app}>
      <Typography className={classes.path}>
        <Link to="/admin/administrator" className={classes.link}>
          Admin
        </Link>
        &gt;
        <Typography className={classes.cursorPointer}>
          {" "}
          Admin Details{" "}
        </Typography>
      </Typography>
      <Grid container className={classes.profileHeadContainer}>
        <Grid lg={8} md={12} xs={12} item>
          <Grid container>
            <Grid lg={9} md={9} sm={8} item>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  height: "100%",
                  marginLeft: "40px",
                }}
              >
                <table className="profileInfo">
                  <tr>
                    <td>Name</td>
                    <td>{fullName}</td>
                  </tr>
                  <tr>
                    <td>Phone Number</td>
                    <td>{countryCode + mobile}</td>
                  </tr>
                  <tr>
                    <td>Email id</td>
                    <td>{email}</td>
                  </tr>
                  {/* <tr>
                    <td>Role</td>
                    <td>{role.name}</td>
                  </tr> */}
                  {/* <tr>
                    <td>Status</td>
                    <td>{isActive ? "Active" : "Disabled"}</td>
                  </tr> */}
                  <tr>
                    <td>Joining Date</td>
                    <td>
                      {moment(createdAt).format("MMMM Do YYYY, h:mm:ss a")}
                    </td>
                  </tr>
                </table>
              </div>
            </Grid>
          </Grid>
        </Grid>
        <Grid lg={2} md={0} xs={0} item />
      </Grid>
      <Box className={classes.permissonContainer}>
        {Object.entries(permissions || {}).map(([key, value]) => {
          if (value && value.label) {
            return (
              <Switch
                key={key + value.label}
                value={value}
                permissionLabel={labels[key] || "Unknown Label"}
                permissionName={key}
                componentName="View"
              />
            );
          }
          return null;
        })}
      </Box>
      <Grid container>
        <Grid lg={3} md={0} xs={0} item />
        <Grid
          item
          lg={4}
          md={6}
          sm={6}
          style={{
            justifyContent: "space-evenly",
            display: "flex",
            marginTop: "20px",
          }}
        >
          {errorMsg.length > 0 && (
            <Typography variant="h2" className={classes.error}>
              {errorMsg}
            </Typography>
          )}
          {/* {isActive && (
            <Button
              onClick={() => setDisable(true)}
              color="primary"
              size="small"
              variant="contained"
              style={{
                width: "200px",
                height: "40px",
                background: `linear-gradient(175.57deg, #1db653 3.76%, #0e5828 96.59%)`,
                fontWeight: "bold",
              }}
            >
              Disable Admin
            </Button>
          )} */}
        </Grid>
        <Grid lg={5} md={0} xs={0} item />
      </Grid>
      {disableConfirmation && (
        <SuccessModal
          handleClose={handleSuceessClose}
          open={openSuccessModal}
          heading="Admin Disabled Successfully"
          subtitle="Admin disabled"
          type="delete"
        />
      )}
      {disable && (
        <ConfirmationModal
          handleClose={handleDisableClose}
          open={handleDisableClose}
          heading="Disable Admin"
          subtitle="Are you sure you want to disable the admin? He will not be able to access any of the modules."
          button1="Cancel"
          button2="Disable"
          onButton1Click={handleDisableClose}
          onButton2Click={handleOnDisableSuccess}
        />
      )}
    </Container>
  );
};
export default AdminDetails;

import React, { useState, useEffect } from "react";
import { Button, Container, Grid, Typography } from "@material-ui/core";
import { useQuery } from "@apollo/client";
import moment from "moment";

import { Loader } from "Components/TableLoader/index";
import { ADMIN_PROFILE } from "graphql/query/admin";
import SuccessModal from "Components/Modal/SuccessModal";
import UpdateNumber from "Components/Modal/UpdateNumber";
import UpdatePassword from "Components/Modal/UpdatePassword";
import { useStyles } from "./styles";

const AdminProfile = () => {
  const classes = useStyles();
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [disableConfirmation, setDisableConfirmation] = useState(false);
  const [disable, setDisable] = useState(false);
  const [actionPerformed, setActionPerformed] = useState(false);
  const [password, setPassword] = useState(false);
  const { data, loading, error, refetch } = useQuery(ADMIN_PROFILE, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (actionPerformed) {
      refetch();
      setActionPerformed(false);
    }
  }, [actionPerformed]);

  const handleOnDisableSuccess = () => {
    setOpenSuccessModal(true);
    setDisableConfirmation(true);
    setDisable(false);
  };
  const handleSuceessClose = () => {
    setOpenSuccessModal(false);
    setDisableConfirmation(false);
  };
  const handleDisableClose = () => {
    setDisable(false);
  };

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

  const { fullName, email, mobile, countryCode, role, createdAt, id } = data.me;
  const formattedDate = moment(createdAt).format("MMMM Do YYYY, h:mm:ss a");
  return (
    <Container maxWidth={false} disableGutters className={classes.app}>
      <Typography as="span" className={classes.cursorPointer}>
        {" "}
        My Profile{" "}
      </Typography>
      <Grid container className={classes.profileHeadContainer}>
        <Grid lg={2} item />
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
                  <tbody>
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
                    <tr>
                      <td>Joining Date</td>
                      <td>{formattedDate}</td>
                    </tr>
                    <tr>
                      <td>Role</td>
                      <td>{role.name}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Grid>
          </Grid>
        </Grid>
        <Grid lg={2} item />
      </Grid>
      <Grid container>
        <Grid lg={3} item />
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
          <Button
            onClick={() => setPassword(true)}
            color="primary"
            size="small"
            variant="outlined"
            style={{
              width: "200px",
              height: "40px",
              background: "white",
              marginRight: "20px",
              fontWeight: "bold",
            }}
          >
            Update Password
          </Button>
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
            Update Number
          </Button>
        </Grid>
        <Grid lg={5} item />
      </Grid>
      {disableConfirmation && (
        <SuccessModal
          handleClose={handleSuceessClose}
          open={openSuccessModal}
          heading="Disable Admin Confirmation"
          subtitle="Admin disabled"
          type="delete"
        />
      )}
      <UpdateNumber
        setActionPerformed={setActionPerformed}
        id={id}
        handleClose={handleDisableClose}
        open={disable}
        heading="Update Mobile Number"
        subtitle="Are you sure you want to disable the admin? He will not be able to access any of the modules."
        button1="Submit"
        button2="Disable"
        onButton1Click={handleDisableClose}
        onButton2Click={handleOnDisableSuccess}
      />
      <UpdatePassword
        passEmail={email}
        open={password}
        handleClose={() => {
          setPassword(false);
        }}
        heading="Update Password"
        button1="Submit"
      />
    </Container>
  );
};
export default AdminProfile;

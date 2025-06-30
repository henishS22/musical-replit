/* eslint-disable no-return-assign */
/* eslint-disable operator-linebreak */
/* eslint-disable quotes */
/* eslint-disable max-len */
/* eslint-disable object-curly-newline */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable arrow-body-style */
import { Container, Grid, Typography, Button, Box } from "@material-ui/core";
// import moment from "moment";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import Box from "@material-ui/core/Box";
import { useQuery, useMutation } from "@apollo/client";
import { useLocation } from "react-router";
import SuccessModal from "Components/Modal/SuccessModal";
import ConfirmationModal from "Components/Modal/ConfirmationModal";

import { GET_DISTRO_BY_ID } from "graphql/query/admin";
import { UPDATE_DISTRO_STATUS } from "graphql/mutation/user";
import { useStyles } from "./ViewUserStyles";

const ViewDistroRequest = () => {
  const classes = useStyles();
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { state } = useLocation();
  const { id = "" } = state || "";

  const { data, loading, error, refetch } = useQuery(GET_DISTRO_BY_ID, {
    variables: {
      distroId: id,
    },
    fetchPolicy: "network-only",
  });

  const [updateDistroStatus, { error: updateDistroStatusError }] =
    useMutation(UPDATE_DISTRO_STATUS);

  const handleStatusUpdate = async () => {
    try {
      await updateDistroStatus({
        variables: {
          input: {
            status: selectedStatus,
          },
          where: {
            id,
          },
        },
      });
      setShowConfirmModal(false);
      setOpenSuccessModal(true);
      setSuccessMessage(
        `Distro request has been ${selectedStatus.toLowerCase()} successfully`
      );
      refetch();
    } catch (err) {
      console.log(err, updateDistroStatusError);
      setErrorMsg("Failed to update status");
    }
  };

  const handleConfirmModalClose = () => {
    setShowConfirmModal(false);
    setSelectedStatus("");
  };

  const handleSuccessModalClose = () => {
    setOpenSuccessModal(false);
  };

  const handleStatusClick = (status) => {
    setSelectedStatus(status);
    setShowConfirmModal(true);
  };

  useEffect(() => {
    if (state === null) setErrorMsg("No role exists !");
  }, [state]);

  if (loading) {
    return (
      <div className={classes.loadingText}>
        <span>Loading...</span>
      </div>
    );
  }

  if (error || errorMsg.length > 0) {
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

  return (
    <Container maxWidth={false} disableGutters className={classes.app}>
      <Typography className={classes.path}>
        <Link to="/admin/distro" className={classes.link}>
          Distro
        </Link>
        &gt;
        <Typography className={classes.cursorPointer}>
          {" "}
          View Distro Request{" "}
        </Typography>
      </Typography>
      <Grid container className={classes.profileHeadContainer}>
        <Grid lg={12} md={12} xs={12} item>
          <Grid container>
            <Grid lg={7} md={7} sm={7} item>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  height: "100",
                }}
              >
                <table className={classes.profileInfo}>
                  <tr className={classes.profileRow}>
                    <td className={classes.profileColumn1}>
                      User Profile Image
                    </td>
                    <td className={classes.profileColumn}>
                      {data?.distro?.userId?.profile_img ? (
                        <img
                          src={data?.distro?.userId?.profile_img}
                          alt="profile"
                          height={100}
                          width={100}
                          className={classes.profileImg}
                        />
                      ) : (
                        "NA"
                      )}
                    </td>
                  </tr>
                  <tr className={classes.profileRow}>
                    <td className={classes.profileColumn1}>User Name</td>
                    <td className={classes.profileColumn}>
                      {data?.distro?.userId?.name || "NA"}
                    </td>
                  </tr>
                  <tr className={classes.profileRow}>
                    <td className={classes.profileColumn1}>Email Address</td>
                    <td className={classes.profileColumn}>
                      {data?.distro?.userId?.email || "NA"}
                    </td>
                  </tr>
                  <tr className={classes.profileRow}>
                    <td className={classes.profileColumn1}>Instagram</td>
                    <td className={classes.profileColumn}>
                      {data?.distro?.instagram ? (
                        <a
                          href={`${data?.distro?.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {data?.distro?.instagram}
                        </a>
                      ) : (
                        "NA"
                      )}
                    </td>
                  </tr>

                  <tr className={classes.profileRow}>
                    <td className={classes.profileColumn1}>Spotify</td>
                    <td className={classes.profileColumn}>
                      {data?.distro?.spotify ? (
                        <a
                          href={`${data?.distro?.spotify}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {data?.distro?.spotify}
                        </a>
                      ) : (
                        "NA"
                      )}
                    </td>
                  </tr>

                  <tr className={classes.profileRow}>
                    <td className={classes.profileColumn1}>Tiktok</td>
                    <td className={classes.profileColumn}>
                      {data?.distro?.tiktok ? (
                        <a
                          href={`${data?.distro?.tiktok}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {data?.distro?.tiktok}
                        </a>
                      ) : (
                        "NA"
                      )}
                    </td>
                  </tr>
                  <tr className={classes.profileRow}>
                    <td className={classes.profileColumn1}>Youtube</td>
                    <td className={classes.profileColumn}>
                      {data?.distro?.youtube ? (
                        <a
                          href={`${data?.distro?.youtube}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {data?.distro?.youtube}
                        </a>
                      ) : (
                        "NA"
                      )}
                    </td>
                  </tr>
                  <tr className={classes.profileRow}>
                    <td className={classes.profileColumn1}>X</td>
                    <td className={classes.profileColumn}>
                      {data?.distro?.x ? (
                        <a
                          href={`${data?.distro?.x}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {data?.distro?.x}
                        </a>
                      ) : (
                        "NA"
                      )}
                    </td>
                  </tr>
                  <tr className={classes.profileRow}>
                    <td className={classes.profileColumn1}>Apple</td>
                    <td className={classes.profileColumn}>
                      {data?.distro?.apple ? (
                        <a
                          href={`${data?.distro?.apple}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {data?.distro?.apple}
                        </a>
                      ) : (
                        "NA"
                      )}
                    </td>
                  </tr>

                  <tr className={classes.profileRow}>
                    <td className={classes.profileColumn1}>Message</td>
                    <td className={classes.profileColumn}>
                      {data?.distro?.message}
                    </td>
                  </tr>

                  <tr className={classes.profileRow}>
                    <td className={classes.profileColumn1}>Status</td>
                    <td className={classes.profileColumn}>
                      <span
                        style={
                          data?.distro?.status === "APPROVED"
                            ? { color: "green" }
                            : { color: "red" }
                        }
                      >
                        {data?.distro?.status}
                      </span>
                    </td>
                  </tr>
                </table>
              </div>
              {data?.distro?.status === "PENDING" && (
                <>
                  <Button
                    color="primary"
                    onClick={() => handleStatusClick("APPROVED")}
                    size="small"
                    variant="contained"
                    style={{
                      width: "120px",
                      height: "40px",
                      background: `linear-gradient(175.57deg, #1db653 3.76%, #0e5828 96.59%)`,
                      fontWeight: "bold",
                      marginTop: "30px",
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    color="primary"
                    onClick={() => handleStatusClick("REJECTED")}
                    size="small"
                    variant="contained"
                    style={{
                      width: "120px",
                      height: "40px",
                      background: `linear-gradient(175.57deg,rgb(182, 52, 29) 3.76%,rgb(156, 37, 28) 96.59%)`,
                      fontWeight: "bold",
                      marginTop: "30px",
                      marginLeft: "20px",
                    }}
                  >
                    Reject
                  </Button>
                </>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {showConfirmModal && (
        <ConfirmationModal
          handleClose={handleConfirmModalClose}
          open={showConfirmModal}
          heading={`${
            selectedStatus === "APPROVED" ? "Approve" : "Reject"
          } Distro Request`}
          subtitle={`Are you sure you want to ${selectedStatus.toLowerCase()} this distro request?`}
          button1="Cancel"
          button2="Confirm"
          onButton1Click={handleConfirmModalClose}
          onButton2Click={handleStatusUpdate}
        />
      )}

      {openSuccessModal && (
        <SuccessModal
          handleClose={handleSuccessModalClose}
          open={openSuccessModal}
          heading={`${
            selectedStatus === "APPROVED" ? "Approve" : "Reject"
          } Distro Request`}
          subtitle={successMessage}
          type="success"
        />
      )}
    </Container>
  );
};
export default ViewDistroRequest;

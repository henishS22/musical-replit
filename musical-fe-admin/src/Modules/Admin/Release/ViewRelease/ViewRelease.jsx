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

import { GET_RELEASE_BY_ID } from "graphql/query/admin";
import { UPDATE_DISTRO_STATUS } from "graphql/mutation/user";
import { useStyles } from "./ViewUserStyles";

const ViewRelease = () => {
  const classes = useStyles();
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { state } = useLocation();
  const { id = "" } = state || "";

  const { data, loading, error, refetch } = useQuery(GET_RELEASE_BY_ID, {
    variables: {
      releaseId: id,
    },
    fetchPolicy: "network-only",
  });

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
        <Link to="/admin/release" className={classes.link}>
          Release
        </Link>
        &gt;
        <Typography className={classes.cursorPointer}>
          {" "}
          View Release{" "}
        </Typography>
      </Typography>
      <Grid container className={classes.profileHeadContainer}>
        <Grid lg={12} md={12} xs={12} item>
          <Grid container>
            <Grid lg={7} md={7} sm={7} item>
              <div className={classes.profileInfo}>
                <div style={{ marginBottom: "24px" }}>
                  <h2
                    style={{
                      fontSize: "20px",
                      marginBottom: "16px",
                      color: "#333",
                    }}
                  >
                    Track Information
                  </h2>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "200px 1fr",
                      gap: "12px",
                      fontSize: "14px",
                    }}
                  >
                    <div style={{ fontWeight: "500", color: "#666" }}>
                      Track Name:
                    </div>
                    <div>{data?.release?.metadata?.trackId?.name || "N/A"}</div>

                    <div style={{ fontWeight: "500", color: "#666" }}>
                      Track Artist:
                    </div>
                    <div>{data?.release?.metadata?.track?.artist || "N/A"}</div>
                  </div>
                </div>
                <div style={{ marginBottom: "24px" }}>
                  <h2
                    style={{
                      fontSize: "20px",
                      marginBottom: "16px",
                      color: "#333",
                    }}
                  >
                    Release Status
                  </h2>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "200px 1fr",
                      gap: "12px",
                      fontSize: "14px",
                    }}
                  >
                    <div style={{ fontWeight: "500", color: "#666" }}>
                      Previously Released:
                    </div>
                    <div
                      style={{
                        color: data?.release?.releaseStatus?.previouslyReleased
                          ? "#2e7d32"
                          : "#d32f2f",
                        fontWeight: "500",
                      }}
                    >
                      {data?.release?.releaseStatus?.previouslyReleased
                        ? "Yes"
                        : "No"}
                    </div>

                    <div style={{ fontWeight: "500", color: "#666" }}>
                      Release Date:
                    </div>
                    <div>
                      {data?.release?.metadata?.releaseStatus?.releaseDate
                        ? new Date(
                            Number(
                              data?.release?.metadata?.releaseStatus
                                ?.releaseDate
                            )
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "N/A"}
                    </div>

                    <div style={{ fontWeight: "500", color: "#666" }}>UPC:</div>
                    <div>
                      {data?.release?.metadata?.releaseStatus?.upc || "N/A"}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <h2
                    style={{
                      fontSize: "20px",
                      marginBottom: "16px",
                      color: "#333",
                    }}
                  >
                    Composition Rights
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {data?.release?.metadata?.compositionRights?.map(
                      (right, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 0",
                            borderBottom:
                              index !==
                              data.release.metadata.compositionRights.length - 1
                                ? "1px solid #eee"
                                : "none",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: "500" }}>
                              {right.composerName}
                            </div>
                            <div
                              style={{
                                fontSize: "13px",
                                color: "#666",
                                marginTop: "4px",
                              }}
                            >
                              Rights Management:{" "}
                              {right.rightsManagement || "N/A"}
                            </div>
                          </div>
                          <div
                            style={{
                              backgroundColor: "#e3f2fd",
                              color: "#1976d2",
                              padding: "4px 12px",
                              borderRadius: "16px",
                              fontSize: "13px",
                              fontWeight: "500",
                            }}
                          >
                            {right.percentageOfOwnership}%
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <h2
                    style={{
                      fontSize: "20px",
                      marginBottom: "16px",
                      color: "#333",
                    }}
                  >
                    Collaborators
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {data?.release?.metadata?.collaborators?.map(
                      (collaborator, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 0",
                            borderBottom:
                              index !==
                              data.release.metadata.collaborators.length - 1
                                ? "1px solid #eee"
                                : "none",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: "500" }}>
                              {collaborator.userName}
                            </div>
                            <div
                              style={{
                                fontSize: "13px",
                                color: "#666",
                                marginTop: "4px",
                              }}
                            >
                              Collaborator
                            </div>
                          </div>
                          <div
                            style={{
                              backgroundColor: "#e3f2fd",
                              color: "#1976d2",
                              padding: "4px 12px",
                              borderRadius: "16px",
                              fontSize: "13px",
                              fontWeight: "500",
                            }}
                          >
                            {collaborator.splitValue}%
                          </div>
                        </div>
                      )
                    )}
                    {(!data?.release?.metadata?.collaborators ||
                      data?.release?.metadata?.collaborators.length === 0) && (
                      <div
                        style={{
                          color: "#666",
                          fontSize: "14px",
                          fontStyle: "italic",
                        }}
                      >
                        No collaborators found
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <h2
                    style={{
                      fontSize: "20px",
                      marginBottom: "16px",
                      color: "#333",
                    }}
                  >
                    Track Metadata
                  </h2>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "200px 1fr",
                      gap: "12px",
                      fontSize: "14px",
                    }}
                  >
                    <div style={{ fontWeight: "500", color: "#666" }}>
                      Label:
                    </div>
                    <div>
                      {data?.release?.metadata?.trackMetadata?.labelName ||
                        "N/A"}
                    </div>

                    <div style={{ fontWeight: "500", color: "#666" }}>
                      Copyright Name:
                    </div>
                    <div>
                      {data?.release?.metadata?.trackMetadata?.copyrightName ||
                        "N/A"}
                    </div>

                    <div style={{ fontWeight: "500", color: "#666" }}>
                      Copyright Year:
                    </div>
                    <div>
                      {data?.release?.metadata?.trackMetadata?.copyrightYear ||
                        "N/A"}
                    </div>

                    <div style={{ fontWeight: "500", color: "#666" }}>
                      Track ISRC:
                    </div>
                    <div>
                      {data?.release?.metadata?.trackMetadata?.trackISRC ||
                        "N/A"}
                    </div>
                    <div style={{ fontWeight: "500", color: "#666" }}>
                      Lyrics:
                    </div>
                    <div>
                      {data?.release?.metadata?.trackMetadata?.lyrics || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
              {/* {data?.distro?.status === "PENDING" && (
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
              )} */}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {/* {showConfirmModal && (
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
      )} */}
    </Container>
  );
};
export default ViewRelease;

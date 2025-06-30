/* eslint-disable no-return-assign */
/* eslint-disable operator-linebreak */
/* eslint-disable quotes */
/* eslint-disable max-len */
/* eslint-disable object-curly-newline */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable arrow-body-style */
import {
  Container,
  Grid,
  Typography,
  Button,
  AppBar,
  Tabs,
  Tab,
  Box,
} from "@material-ui/core";
// import moment from "moment";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import Box from "@material-ui/core/Box";
import { useQuery, useMutation } from "@apollo/client";
import { useLocation } from "react-router";

import Default from "Assets/Images/default.png";
import SuccessModal from "Components/Modal/SuccessModal";
import ConfirmationModal from "Components/Modal/ConfirmationModal";
import { Loader } from "Components/TableLoader/index";
import { VIEW_USER } from "graphql/query/admin";
import {
  VERIFY_USER,
  BLACKLIST_USER,
  WHITELIST_USER,
  BAN_USER,
} from "graphql/mutation/user";
import Table from "./Components/Table/Table";
import { useStyles } from "./ViewUserStyles";
import PropTypes from "prop-types";
import CollectionRequest from "./Components/Table/Table";
import TopBar from "../Components/TopBar/TopBar";

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
};

TabPanel.propTypes = {
  children: PropTypes.node.isRequired,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

const a11yProps = (index) => ({
  id: `simple-tab-${index}`,
  "aria-controls": `simple-tabpanel-${index}`,
});

const ViewUser = () => {
  // const [openModal,setModal] = useState(false);
  const classes = useStyles();
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [openSuccessModal1, setOpenSuccessModal1] = useState(false);
  const [disableConfirmation, setDisableConfirmation] = useState(false);
  const [disable, setDisable] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [nsfwConfirmation, setNsfwConfirmation] = useState(false);
  const [whiteListUser, setWhiteListUser] = useState(false);
  const [whiteListUserConfirmation, setWhiteListUserConfirmation] =
    useState(false);
  const [nsfw, setNsfw] = useState(false);
  const { state } = useLocation();
  const { id = "" } = state || "";

  const { data, loading, error, refetch } = useQuery(VIEW_USER, {
    variables: {
      userId: id,
    },
    fetchPolicy: "network-only",
  });

  const [verifyUser, { error: verifyUserError, loading: verifyUserLoading }] =
    useMutation(VERIFY_USER, {
      variables: {
        input: {
          id,
        },
      },
    });

  // const [blockUser, { error: blockUserError }] = useMutation(BAN_USER, {
  //   variables: {
  //     input: {
  //       id,
  //       isBanned: !data?.user?.user?.isBanned,
  //     },
  //   },
  // });
  const [blockUser, { error: blockUserError }] = useMutation(BAN_USER);

  const [whiteList, { error: whilteListUserError }] = useMutation(
    WHITELIST_USER,
    {
      variables: {
        input: {
          id,
        },
      },
    }
  );

  useEffect(() => {
    if (state === null) setErrorMsg("No role exists !");
  }, [state]);

  const handleOnDisableSuccess = async () => {
    try {
      await blockUser({
        variables: {
          input: {
            id,
            isBanned: !data?.user?.user?.isBanned,
          },
        },
      });
      setOpenSuccessModal(true);
      setDisableConfirmation(true);
    } catch (err) {
      console.log(err, blockUserError);
    }
    setDisable(false);
  };

  const handleBlockUserSuceessClose = () => {
    refetch();
    setOpenSuccessModal(false);
    setDisableConfirmation(false);
  };
  const handleBlockUserModalClose = () => {
    setDisable(false);
  };

  const handleVerifyUser = async () => {
    try {
      await verifyUser();
      setOpenSuccessModal1(true);
      setNsfwConfirmation(true);
    } catch (err) {
      console.log(err, verifyUserError);
    }
    setNsfw(false);
  };
  const handleVerifyUserSuceessClose = () => {
    refetch();
    setOpenSuccessModal(false);
    setNsfwConfirmation(false);
  };
  const handleModalClose = () => {
    setNsfw(false);
    setWhiteListUser(false);
  };

  const handleWhiteListUserSuceessClose = () => {
    refetch();
    setOpenSuccessModal(false);
    setWhiteListUserConfirmation(false);
  };

  const handleOnWhiteListUserSuccess = async () => {
    try {
      await whiteList();
      setOpenSuccessModal(true);
      setWhiteListUserConfirmation(true);
    } catch (err) {
      console.log(err, whilteListUserError);
    }
    setWhiteListUser(false);
  };

  // useEffect(() => {
  //   if (loading || verifyUserLoading) {
  //     return <Loader />;
  //   }
  // }, [loading, verifyUserLoading]);

  if (loading || verifyUserLoading) {
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
        <Link to="/admin/user" className={classes.link}>
          User
        </Link>
        &gt;
        <Typography className={classes.cursorPointer}> View User </Typography>
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
                      {data?.user?.user?.profile_img ? (
                        <img
                          src={data?.user?.user?.profile_img}
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
                      {data?.user?.user?.name || "NA"}
                    </td>
                  </tr>
                  <tr className={classes.profileRow}>
                    <td className={classes.profileColumn1}>Email Address</td>
                    <td className={classes.profileColumn}>
                      {data?.user?.user?.email || "NA"}
                    </td>
                  </tr>
                  <tr className={`${classes.profileRow}`}>
                    <td className={classes.profileColumn1}>
                      Wallet Address(s)
                    </td>

                    <td className={classes.profileColumn}>
                      {data?.user?.user?.wallets?.map((wallet, index) => {
                        return wallet.addr ? (
                          <div className="d-flex flex-column" key={index}>
                            {wallet.addr}
                          </div>
                        ) : (
                          "NA"
                        );
                      }) || "NA"}
                    </td>
                  </tr>
                  <tr className={classes.profileRow}>
                    <td className={classes.profileColumn1}>No. of Project</td>
                    <td className={classes.profileColumn}>
                      {data?.user?.totalProject || "NA"}
                    </td>
                  </tr>
                  <tr className={classes.profileRow}>
                    <td className={classes.profileColumn1}>
                      {/* Total no of Musics Track */}
                      No. of Files
                    </td>
                    <td className={classes.profileColumn}>
                      {data?.user?.totalMusicTracks || "NA"}
                    </td>
                  </tr>
                  <tr className={classes.profileRow}>
                    <td className={classes.profileColumn1}>Storage</td>
                    <td className={classes.profileColumn}>
                      {`${data?.user?.storage.toFixed(4)} GB` ?? "NA"}
                    </td>
                  </tr>
                  {/* <tr className={classes.profileRow}>
                    <td className={classes.profileColumn1}>
                      Registration Date
                    </td>
                    <td className={classes.profileColumn}>
                      {moment(data.user?.user?.createdAt).format(
                        "MMMM Do YYYY"
                      )}
                    </td>
                  </tr> */}
                  <tr className={classes.profileRow}>
                    <td className={classes.profileColumn1}>Status</td>
                    <td className={classes.profileColumn}>
                      {data?.user?.user?.isBanned ? "Banned" : "Active"}
                    </td>
                  </tr>
                </table>
              </div>
              {/* <div className="d-flex flex-row justify-content-center align-items-start">
                <div className="flex-1">Wallet Address(s)</div>

                <div className="flex-1 d-flex flex-row">
                  {data?.user?.user?.wallets?.map((wallet, index) => {
                    return wallet.addr ? (
                      <div key={index} className="mx-2">
                        {wallet.addr}
                      </div>
                    ) : null;
                  }) || "NA"}
                </div>
              </div> */}

              {/* {!data.user?.user?.isVerified && (
                <Button
                  color="primary"
                  onClick={() => setNsfw(true)}
                  size="small"
                  variant="outlined"
                  style={{
                    width: "120px",
                    height: "40px",
                    background: "white",
                    marginRight: "20px",
                    fontWeight: "bold",
                    marginLeft: "0px",
                    marginTop: "30px",
                  }}
                >
                  Verify User
                </Button>
              )} */}
              {/* {!data.user?.user?.isBanned ? ( */}
              <Button
                color="primary"
                onClick={() => setDisable(true)}
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
                {data?.user?.user?.isBanned ? "Un-Ban User" : "Ban User"}
              </Button>
              {/* ) : (
                <Button
                  color="primary"
                  onClick={() => setDisable(true)}
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
                  UnBan User
                </Button>
              )} */}

              {/* <Button
                color="primary"
                target="_blank"
                href={`${process.env.REACT_APP_FRONT_END_POINT_URL_DEV}/artist-profile/${data.user?.user?.id}`}
                size="small"
                variant="contained"
                style={{
                  width: "140px",
                  height: "40px",
                     background: `linear-gradient(175.57deg, #1db653 3.76%, #0e5828 96.59%)`,

                  fontWeight: "bold",
                  marginTop: "30px",
                  marginLeft: "20px",
                }}
              >
                View in website
              </Button> */}
            </Grid>
            <Grid lg={3} md={3} sm={3} item>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  // height: "100%",
                  marginLeft: "0px",
                  marginTop: "77px",
                  justifyContent: "center",
                }}
              >
                {data?.user?.user?.profilePic && (
                  <img
                    src={data?.user?.user?.profilePic}
                    onError={(e) => (e.target.src = Default)}
                    alt="image1"
                    className={classes.avatar}
                  />
                )}
              </div>
            </Grid>
            {/* <Grid lg={1} md={1} sm={1} item /> */}
            {/* Projct List table */}
            <Box style={{ paddingTop: "50px", width: "96%" }}>
              <Box
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  marginTop: "8px",
                  marginBottom: "8px",
                }}
              >
                List Of Project
              </Box>
              {/* <TopBar view /> */}
              <CollectionRequest projectList={data?.user?.projectList} />
            </Box>
          </Grid>
        </Grid>
      </Grid>
      {/* <Box style={{ paddingRight: "40px", paddingTop: "50px" }}>
        <Table />
      </Box> */}
      {disableConfirmation && (
        <SuccessModal
          handleClose={handleBlockUserSuceessClose}
          open={openSuccessModal}
          heading={`${
            !data?.user?.user?.isBanned ? "Ban" : "Unban"
          } User Confirmation`}
          subtitle={`User ${
            !data?.user?.user?.isBanned ? "banned" : "un-banned"
          } successfully`}
          type="delete"
        />
      )}
      {disable && (
        <ConfirmationModal
          handleClose={handleBlockUserModalClose}
          open={handleBlockUserModalClose}
          heading="Ban User"
          subtitle={`Are you sure you want to ${
            !data?.user?.user?.isBanned ? "Ban" : "Unban"
          } ${data?.user?.user?.name}? This user will ${
            !data?.user?.user?.isBanned ? "loose" : "get back"
          } the ability to sign in!`}
          button1="Cancel"
          button2="Confirm"
          onButton1Click={handleBlockUserModalClose}
          onButton2Click={handleOnDisableSuccess}
        />
      )}
      {nsfwConfirmation && (
        <SuccessModal
          handleClose={handleVerifyUserSuceessClose}
          open={openSuccessModal1}
          heading="User Verification"
          subtitle="User verified successfully"
          type="delete"
        />
      )}
      {nsfw && (
        <ConfirmationModal
          handleClose={handleModalClose}
          open={handleModalClose}
          heading="Verify User"
          subtitle={`Are you sure you want to verify ${data?.user?.username}?`}
          button1="Cancel"
          button2="Confirm"
          onButton1Click={handleModalClose}
          onButton2Click={handleVerifyUser}
        />
      )}
      {whiteListUserConfirmation && (
        <SuccessModal
          handleClose={handleWhiteListUserSuceessClose}
          open={openSuccessModal}
          heading="Whitelist User Confirmation"
          subtitle="User Whitelisted"
          type="delete"
        />
      )}
      {whiteListUser && (
        <ConfirmationModal
          handleClose={handleModalClose}
          open={handleModalClose}
          heading="Whitelist User"
          subtitle={`Are you sure you want to whitelist ${data?.user?.username}? This user will create Nfts.`}
          button1="Cancel"
          button2="Confirm"
          onButton1Click={handleModalClose}
          onButton2Click={handleOnWhiteListUserSuccess}
        />
      )}
    </Container>
  );
};
export default ViewUser;

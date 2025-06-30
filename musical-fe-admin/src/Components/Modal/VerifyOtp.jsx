/* eslint-disable react/prop-types */
import React, { useState } from "react";
import {
  DialogContent,
  Box,
  Dialog,
  Button,
  CircularProgress,
  Grid,
  Typography,
} from "@material-ui/core";
import OtpInput from "react-otp-input";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router";

import { useStyles, otpStyles } from "./ModalStyles";
import SuccessModal from "./SuccessModal";
import { UPDATE_PASSWORD, UPDATE_NUMBER } from "../../graphql/mutation/admin";
import { ReactComponent as CloseIcon } from "../../Assets/Svg/close.svg";
import "./styles.scss";

const OtpVerificationModal = ({
  open,
  handleClose,
  setActionPerformed,
  data,
  type,
}) => {
  const classes = useStyles();
  const otpClasses = otpStyles();
  const navigate = useNavigate();

  const [openModal, setOpenModal] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOTP] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    id = "",
    countryCode = "",
    mobile = "",
    email = "",
    password = "",
    newPassword = "",
  } = data || "";

  const [UpdatePasswordApi] = useMutation(UPDATE_PASSWORD);
  const [UpdateNumber] = useMutation(UPDATE_NUMBER);

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleChange = (otpString) => {
    setOTP(otpString);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      if (otp.length < 4) setErrorMsg("Please Enter Valid OTP");

      if (type === "reset") {
        const response = await UpdatePasswordApi({
          variables: {
            input: {
              email,
              password,
              newPassword,
              grantType: "twoFA",
              code: otp,
            },
          },
        });
        const { status, message } = response.data.updatePassword;
        if (status === "error") {
          setErrorMsg(message);
        } else {
          setOpenModal(true);
          handleClose();
          setTimeout(() => {
            setOpenModal(false);
            // localStorage.removeItem("auth-token");
            // navigate("/login");
          }, 2000);
        }
      }

      if (type === "update") {
        const response = await UpdateNumber({
          variables: {
            input: {
              mobile,
              countryCode,
              id,
              grantType: "twoFA",
              code: otp,
            },
          },
        });
        const { status, message } = response.data.updateMobile;
        if (status === "error") {
          setErrorMsg(message);
        } else {
          setOpenModal(true);
          handleClose();
          setActionPerformed(true);
          setTimeout(() => {
            setOpenModal(false);
            localStorage.removeItem("auth-token");
            navigate("/login");
          }, 2000);
        }
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setErrorMsg("Wrong Otp !");
    }
  };

  return (
    <>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
        classes={{ paper: classes.dialogPaper3 }}
      >
        <DialogContent classes={{ root: classes.dialogContext1 }}>
          <div
            role="button"
            tabIndex={0}
            onKeyDown={handleClose}
            onClick={handleClose}
            className={classes.topBar1}
          >
            {/* <span className={classes.title}></span> */}
            <span className={`${classes.onHover} ${classes.closeBtn}`}>
              <CloseIcon />
            </span>
          </div>
          <Box className={classes.mainBox} id="alert-dialog-description">
            <form
              style={{ padding: "40px 20px" }}
              onSubmit={(e) => {
                handleSubmit();
                e.preventDefault();
              }}
            >
              <Grid
                item
                className={`${otpClasses.displayFlex1} ${otpClasses.width100}`}
              >
                <Typography className={otpClasses.heading2}>
                  {type === "reset" ? "Reset Password" : "Update Mobile Number"}
                </Typography>
              </Grid>
              <Grid
                item
                className={`${otpClasses.displayFlex1} ${otpClasses.width100}`}
              >
                <Typography>
                  We have sent OTP to your mobile {countryCode}
                  XXXXXX
                  {mobile?.slice(mobile.length - 4)}
                </Typography>
              </Grid>
              <Grid
                item
                className={`${otpClasses.displayFlex1} ${otpClasses.width100}`}
              >
                {
                  <OtpInput
                    value={otp}
                    onChange={handleChange}
                    numInputs={4}
                    renderInput={(props) => props && <input {...props} />}
                    separator={false}
                    inputStyle={otpClasses.otpInput}
                    isInputNum
                  />
                }
              </Grid>
              {errorMsg.length > 0 && (
                <Typography
                  variant="subtitle1"
                  className={otpClasses.errorText}
                >
                  {errorMsg}
                </Typography>
              )}
              <Button
                color="primary"
                variant="contained"
                disabled={loading}
                fullWidth
                type="submit"
                className={otpClasses.loginBtn}
                style={{ marginTop: "15px" }}
                onClick={() => handleSubmit()}
              >
                {loading && (
                  <CircularProgress size={20} style={{ color: "white" }} />
                )}
                {!loading && "Proceed"}
              </Button>
            </form>
          </Box>
        </DialogContent>
      </Dialog>
      <SuccessModal
        handleClose={handleCloseModal}
        open={openModal}
        heading={
          type === "reset"
            ? "Password Reset Successfully"
            : "Mobile Number Updated Successfully"
        }
        subtitle=""
        type="delete"
      />
    </>
  );
};
export default OtpVerificationModal;

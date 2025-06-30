import React, { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  Container,
  Grid,
  Typography,
} from "@material-ui/core";
import { useMutation } from "@apollo/client";
import OtpInput from "react-otp-input";
import { useLocation, useNavigate } from "react-router";

import { OTP_VERIFY, RESET_PASSWORD } from "graphql/mutation/register/index";
import { useStyles } from "./LoginStyles";
import LogoHead from "../LogoHead";
import LeftSection from "../LeftSection";

const OTP = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [otp, setOTP] = useState("");
  const [loader, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [OtpVerify] = useMutation(OTP_VERIFY);
  const [ResetPasswordApi] = useMutation(RESET_PASSWORD);

  const { state } = useLocation();
  const {
    email = "",
    password = "",
    authToken = "",
    type = "",
    mobile = "",
    countryCode = "",
    newPassword = "",
  } = state || "";

  const handleChange = (otpString) => {
    setOTP(otpString);
  };

  const handleSubmit = async () => {
    try {
      setErrorMsg("");
      if (otp.length < 4) setErrorMsg("Please Enter Valid OTP");
      else {
        setLoading(true);

        // For verifying 2FA login otp
        if (type === "login") {
          // Otp verification api call
          const { data } = await OtpVerify({
            variables: {
              input: {
                code: otp,
                email,
                password,
                grantType: "twoFA",
              },
            },
          });

          const { token, isFirstLogin } = data.signIn;
          setLoading(false);

          // Id admin logins for the first time
          if (isFirstLogin) {
            navigate("/reset-password", {
              state: {
                mobile,
                countryCode,
                email,
                token,
              },
            });
          } else {
            // Otp verification success
            await localStorage.setItem("auth-token", token);
            navigate("/admin/dashboard");
          }
        }

        // For verifying Reset password Otp
        if (type === "reset") {
          // Reset password otp verification api call
          const { data } = await ResetPasswordApi({
            variables: {
              input: {
                email,
                newPassword,
                reqType: "twoFA",
                code: otp,
              },
            },
          });

          // Otp verification sucess
          if (data.resetPassword.message === "Password Reset successful!") {
            await localStorage.setItem("auth-token", authToken);
            navigate("/admin/dashboard");
          }
        }
      }
    } catch (err) {
      console.log(err);
      setErrorMsg("Wrong OTP");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state === null) navigate("/login");
    const listener = (event) => {
      if (event.code === "Enter" || event.code === "NumpadEnter") {
        handleSubmit();
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, []);

  return (
    <>
      <Container maxWidth={false} disableGutters className={classes.app}>
        <div className={classes.splitContainer}>
          <LeftSection />
          <div className={classes.rightFormSection}>
            <form
              onSubmit={(e) => {
                handleSubmit();
                e.preventDefault();
              }}
            >
              <LogoHead />

              <Grid
                item
                className={`${classes.displayFlex} ${classes.width100}`}
              >
                {state?.type === "login" ? (
                  <Typography variant="h6" className={classes.heading3}>
                    Verify security code
                  </Typography>
                ) : (
                  <Typography variant="h6" className={classes.heading3}>
                    {state !== null &&
                    state.adminData &&
                    state.adminData.isSuperAdmin
                      ? "Verify security code"
                      : "Verify Phone Number"}
                  </Typography>
                )}
              </Grid>
              <Grid
                item
                className={`${classes.displayFlex} ${classes.width100}`}
              >
                <Typography>
                  We have sent OTP to your mobile {countryCode}
                  XXXXXX
                  {mobile}
                </Typography>
              </Grid>
              <Grid
                item
                className={`${classes.displayFlex} ${classes.width100}`}
              >
                <OtpInput
                  value={otp}
                  onChange={handleChange}
                  numInputs={4}
                  separator={false}
                  inputStyle={classes.otpInput}
                  isInputNum
                  renderInput={(props) => <input {...props} />}
                />
              </Grid>
              {errorMsg.length > 0 && (
                <Typography variant="subtitle1" className={classes.errorText}>
                  {errorMsg}
                </Typography>
              )}
              <Button
                color="primary"
                variant="contained"
                disabled={loader}
                fullWidth
                type="submit"
                className={classes.loginBtn}
                style={{ marginTop: "15px" }}
                onClick={() => handleSubmit()}
              >
                {loader && (
                  <CircularProgress size={20} style={{ color: "white" }} />
                )}
                {!loader && "Proceed"}
              </Button>
            </form>
          </div>
        </div>
      </Container>
    </>
  );
};

export default OTP;

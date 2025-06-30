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

import { VERIFY_SECURITY_CODE } from "graphql/mutation/register/index";
import { useStyles } from "./LoginStyles";
import LogoHead from "../LogoHead";
import LeftSection from "../LeftSection";

const VerifySecurityCode = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [otp, setOTP] = useState("");
  const [loader, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [VerifyCode] = useMutation(VERIFY_SECURITY_CODE);

  const { state } = useLocation();
  const { email = "", password = "" } = state || "";

  const handleChange = (otpString) => {
    setOTP(otpString);
  };

  const handleSubmit = async () => {
    try {
      setErrorMsg("");
      if (otp.length < 6) setErrorMsg("Please Enter Valid OTP");
      else {
        setLoading(true);

        // Verify security code api call
        const { data } = await VerifyCode({
          variables: {
            input: {
              email,
              password,
              grantType: "twoFA",
              code: otp,
            },
          },
        });

        const { token, message } = data.signIn;

        // Verification success
        if (token) {
          await localStorage.setItem("auth-token", token);
          navigate("/admin/dashboard");
          setLoading(false);
        }
      }
    } catch (err) {
      console.log(err);
      setErrorMsg("Wrong Security Code");
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
                <Typography variant="h6" className={classes.heading3}>
                  Verify security code
                </Typography>
              </Grid>
              <Grid
                item
                className={`${classes.displayFlex} ${classes.width100}`}
              >
                <OtpInput
                  value={otp}
                  onChange={handleChange}
                  numInputs={6}
                  // renderSeparator={<span>-</span>}
                  renderInput={(props) => <input {...props} />}
                  inputStyle={classes.otpInput1}
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

export default VerifySecurityCode;

import React, { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  Container,
  Grid,
  Typography,
} from "@material-ui/core";
import { useMutation } from "@apollo/client";
import { useLocation, useNavigate } from "react-router";

import { VERIFY_QR_CODE } from "graphql/mutation/register/index";
import { useStyles } from "./LoginStyles";
import LogoHead from "../LogoHead";

const GoogleAuth = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [loader, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [VerifyQrCode] = useMutation(VERIFY_QR_CODE);
  const { state } = useLocation();
  const { qrCodeUrl = "", email = "", password = "" } = state || "";

  const handleSubmit = async () => {
    try {
      setErrorMsg("");

      // Qr code verified api call
      const { data } = await VerifyQrCode({
        variables: {
          input: {
            email,
            password,
            grantType: "qrGenerated",
          },
        },
      });

      const { message } = data.signIn;

      // Success api call
      if (message === "qrGenerated.") {
        navigate("/verify-security-code", {
          state: {
            email,
            password,
          },
        });
      }
    } catch (err) {
      console.log(err);
      setErrorMsg("Something went wrong !");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state === null) navigate("/login");
  }, []);

  return (
    <>
      <Container maxWidth={false} disableGutters className={classes.app}>
        <Grid container className={classes.loginBox1}>
          <form
            onSubmit={(e) => {
              handleSubmit();
              e.preventDefault();
            }}
          >
            <LogoHead />
            {/* <Grid item className={`${classes.displayFlex} ${classes.width100}`}>
              <Typography variant="h6" className={classes.heading1}> Admin</Typography>
              <Typography className={classes.heading2}>Platform</Typography>
            </Grid> */}
            <Grid item className={`${classes.displayFlex} ${classes.width100}`}>
              <Typography variant="h6" className={classes.heading3}>
                Scan security code
              </Typography>
            </Grid>
            <Grid
              item
              className={`${classes.displayFlex1} ${classes.width100}`}
            >
              <img src={qrCodeUrl} alt="qrCodeUrl" />
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
        </Grid>
      </Container>
    </>
  );
};

export default GoogleAuth;

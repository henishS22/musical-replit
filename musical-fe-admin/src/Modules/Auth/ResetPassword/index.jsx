import React, { useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@material-ui/core";
import { useLocation, useNavigate } from "react-router";
import { useMutation } from "@apollo/client";
import { useFormik } from "formik";
import * as yup from "yup";

import { RESET_PASSWORD } from "graphql/mutation/register/index";
import { useStyles } from "./styles";
import LogoHead from "../LogoHead";

const validationSchema = yup.object({
  password: yup.string("Enter your password").required("Password is required"),
  newPassword: yup
    .string("Enter your password")
    .oneOf([yup.ref("password"), null], "Passwords donot match")
    .required("Confirm Password is required"),
});

const ResetPassword = () => {
  const classes = useStyles();
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  const { state } = useLocation();
  const { mobile = "", countryCode = "", email = "", token = "" } = state || "";
  const [ResetPasswordApi] = useMutation(RESET_PASSWORD);
  const navigate = useNavigate();

  const handleResetPassword = async (values) => {
    try {
      setLoading(true);
      setErrorMsg("");
      const { newPassword } = values;

      // Reset password api call
      const { data } = await ResetPasswordApi({
        variables: {
          input: {
            email,
            newPassword,
            reqType: "REQUEST",
          },
        },
      });

      // Success api call
      if (
        data.resetPassword.message === "Reset Password code sent successfully."
      ) {
        navigate("/otp", {
          state: {
            type: "reset",
            authToken: token,
            mobile,
            email,
            countryCode,
            newPassword,
          },
        });
      }
      setLoading(false);
    } catch (err) {
      console.log(err);
      setErrorMsg("Wrong OTP");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state === null) navigate("/login");
  }, []);

  const formik = useFormik({
    initialValues: {
      password: "",
      newPassword: "",
    },
    validationSchema,
    onSubmit: (values) => {
      handleResetPassword(values);
    },
  });

  return (
    <Container maxWidth={false} disableGutters className={classes.app}>
      <Grid
        container
        item
        className={classes.loginBox}
        sm={6}
        md={4}
        lg={4}
        xl={3}
      >
        <LogoHead />
        <Grid item className={`${classes.displayFlex} ${classes.width100}`}>
          <Typography variant="h6" className={classes.heading3}>
            Reset Password
          </Typography>
        </Grid>
        <form
          className={classes.loginForm}
          noValidate
          autoComplete="off"
          onSubmit={formik.handleSubmit}
        >
          <TextField
            id="password"
            name="password"
            label="Password"
            type="password"
            variant="outlined"
            className={`${classes.width100} ${classes.marginTop}`}
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            InputProps={{
              className: classes.inputHeight,
            }}
          />
          <TextField
            id="newPassword"
            name="newPassword"
            label="Confirm Password"
            type="password"
            variant="outlined"
            className={`${classes.width100} ${classes.marginTop}`}
            value={formik.values.newPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.newPassword && Boolean(formik.errors.newPassword)
            }
            helperText={formik.touched.newPassword && formik.errors.newPassword}
            InputProps={{
              className: classes.inputHeight,
            }}
          />
          {errorMsg && (
            <Typography variant="subtitle1" className={classes.error}>
              {errorMsg}
            </Typography>
          )}
          <Button
            color="primary"
            variant="contained"
            fullWidth
            type="submit"
            className={classes.loginBtn}
          >
            {loading && (
              <CircularProgress size={20} style={{ color: "white" }} />
            )}
            {!loading && "Reset"}
          </Button>
        </form>
      </Grid>
    </Container>
  );
};

export default ResetPassword;

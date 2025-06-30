/* eslint-disable brace-style */
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@material-ui/core";
import QrCodeGenerator from "qrcode";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router";
import { useFormik } from "formik";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import * as yup from "yup";

import { SIGNIN } from "graphql/mutation/register/index";
import { useStyles } from "./LoginStyles";
import LogoHead from "../LogoHead";
import LeftSection from "../LeftSection";

const validationSchema = yup.object({
  email: yup
    .string("Enter your email")
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup.string("Enter your password").required("Password is required"),
});

const Login = () => {
  const classes = useStyles();
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [SigninAdmin] = useMutation(SIGNIN);
  const navigate = useNavigate();
  const handleLogin = async (values) => {
    try {
      setLoading(true);
      setErrorMsg("");

      // Sign in api call
      const { data } = await SigninAdmin({
        variables: {
          input: values,
        },
      });

      const { message, qrCode, mobile, countryCode, accountTypeCode } =
        data.signIn;

      // Wrong Password or Email
      if (message === "Invalid Credentials") {
        setErrorMsg("Invalid Username/Password");
      }

      // Super Admin Login Flow
      else if (accountTypeCode === "SUPER_ADMIN") {
        // Generating Qrcode image if superadmin login for first time
        if (qrCode) {
          const qrCodeUrl = await QrCodeGenerator.toDataURL(qrCode);
          navigate("/google-auth", {
            state: {
              email: values.email,
              password: values.password,
              qrCodeUrl,
            },
          });
        } else {
          // Verify security code
          navigate("/verify-security-code", {
            state: {
              email: values.email,
              password: values.password,
            },
          });
        }
      }

      // Admin Login Flow
      else if (accountTypeCode === "ADMIN") {
        // Verify 2FA Otp
        navigate("/otp", {
          state: {
            email: values.email,
            password: values.password,
            type: "login",
            mobile,
            countryCode,
          },
        });
        // navigate('/verify-security-code', {
        //   state: {
        //     email: values.email, password: values.password, type: 'login', mobile, countryCode,
        //   },
        // });
      }

      // Unexpected error
      else {
        setErrorMsg("Something Went Wrong !");
      }
      setLoading(false);
    } catch (err) {
      console.log(err);
      setErrorMsg("Invalid Username/Password");
      setLoading(false);
    }
  };
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      grantType: "PASSWORD",
    },
    validationSchema,
    onSubmit: (values) => {
      handleLogin(values);
    },
  });

  useEffect(() => {
    const listener = (event) => {
      if (event.code === "Enter" || event.code === "NumpadEnter") {
        event.preventDefault();
        formik.handleSubmit();
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, []);

  return (
    <Container maxWidth={false} disableGutters className={classes.app}>
      <div className={classes.splitContainer}>
        {/* Left Image Section with Overlay */}
        <LeftSection />
        {/* Right Form Section */}
        <div className={classes.rightFormSection}>
          <LogoHead />
          {errorMsg.length > 0 && (
            <Typography variant="subtitle1" className={classes.error}>
              {errorMsg}
            </Typography>
          )}
          <form
            className={classes.loginForm}
            noValidate
            autoComplete="off"
            onSubmit={formik.handleSubmit}
          >
            <TextField
              id="email"
              name="email"
              label="Email"
              variant="outlined"
              className={classes.width100}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperrtext={formik.touched.email && formik.errors.email}
              InputProps={{
                className: classes.inputHeight,
                classes: {
                  input: classes.placeHolder,
                },
              }}
            />
            <TextField
              id="password"
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              className={`${classes.width100} ${classes.marginTop}`}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperrtext={formik.touched.password && formik.errors.password}
              InputProps={{
                className: classes.inputHeight,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
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
              {!loading && "Submit"}
            </Button>
          </form>
        </div>
      </div>
    </Container>
  );
};

export default Login;

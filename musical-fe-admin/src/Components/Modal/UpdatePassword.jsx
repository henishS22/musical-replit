/* eslint-disable react/prop-types */
import React, { useState } from "react";
import {
  DialogContent,
  Box,
  Dialog,
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from "@material-ui/core";
import { useFormik } from "formik";
import { useMutation } from "@apollo/client";
import * as yup from "yup";

import { useStyles } from "./ModalStyles";
import OtpModal from "./VerifyOtp";
import { UPDATE_PASSWORD } from "../../graphql/mutation/admin";
import { ReactComponent as CloseIcon } from "../../Assets/Svg/close.svg";
import "./styles.scss";
import { Visibility, VisibilityOff } from "@material-ui/icons";

const validationSchema = yup.object({
  old: yup.string().required("Old Password is required"),
  new: yup.string().required("New Password is required"),
  confirm: yup
    .string()
    .oneOf([yup.ref("new"), null], "Passwords donot match")
    .required("Confirm Password is required"),
});

const CreateProfileVerificationModal = ({
  open,
  handleClose,
  heading,
  button1,
  passEmail,
}) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [openModal, setOpenModal] = React.useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [UpdatePasswordApi] = useMutation(UPDATE_PASSWORD);

  const handleVerification = async (values) => {
    try {
      setShowNewPassword(false);
      setShowOldPassword(false);
      setShowPassword(false);
      setLoading(true);
      setErrorMsg("");
      const { old, confirm } = values;
      const response = await UpdatePasswordApi({
        variables: {
          input: {
            email: passEmail,
            password: old,
            newPassword: confirm,
            grantType: "UPDATE",
          },
        },
      });

      const { status, message, mobile, countryCode } =
        response.data.updatePassword;
      if (status === "error") {
        setErrorMsg(message);
      } else {
        setFormData({
          email: passEmail,
          mobile,
          countryCode,
          password: old,
          newPassword: confirm,
        });
        handleClose();
        setOpenModal(true);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setErrorMsg("Something went wrong !");
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };
  const formik = useFormik({
    initialValues: {
      old: "",
      new: "",
      confirm: "",
    },
    validationSchema,
    onSubmit: (values) => {
      handleVerification(values);
    },
  });

  return (
    <>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="lg"
        classes={{ paper: classes.dialogPaper4 }}
      >
        <DialogContent classes={{ root: classes.dialogContext1 }}>
          <div
            role="button"
            tabIndex={0}
            onKeyDown={handleClose}
            onClick={handleClose}
            className={classes.topBar}
          >
            <span className={classes.title}>{heading}</span>
            <span className={`${classes.onHover} ${classes.closeBtnPass}`}>
              <CloseIcon />
            </span>
          </div>
          <Box className="emailVerify" id="alert-dialog-description">
            <form noValidate autoComplete="off" onSubmit={formik.handleSubmit}>
              <Grid container style={{ marginTop: "5vh" }}>
                <Grid item xs={1} sm={2} md={2} xl={2} />
                <Grid item xs={10} sm={8} md={8} xl={8}>
                  <TextField
                    id="old"
                    name="old"
                    type={showOldPassword ? "text" : "password"}
                    placeholder="Old Password"
                    className="inputRounded"
                    value={formik.values.old}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.old && Boolean(formik.errors.old)}
                    helperText={formik.touched.old && formik.errors.old}
                    variant="outlined"
                    InputProps={{
                      className: `${classes.inputHeight} ${classes.BorderRadius}`,
                      classes: {
                        input: classes.placeHolder,
                      },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            edge="end"
                          >
                            {showOldPassword ? (
                              <Visibility />
                            ) : (
                              <VisibilityOff />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    id="new"
                    name="new"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="New Password"
                    className="inputRounded"
                    value={formik.values.new}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.new && Boolean(formik.errors.new)}
                    helperText={formik.touched.new && formik.errors.new}
                    variant="outlined"
                    InputProps={{
                      className: `${classes.inputHeight} ${classes.BorderRadius}`,
                      classes: {
                        input: classes.placeHolder,
                      },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                          >
                            {showNewPassword ? (
                              <Visibility />
                            ) : (
                              <VisibilityOff />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    id="confirm"
                    type={showPassword ? "text" : "password"}
                    name="confirm"
                    placeholder="Confirm Password"
                    className="inputRounded"
                    value={formik.values.confirm}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.confirm && Boolean(formik.errors.confirm)
                    }
                    helperText={formik.touched.confirm && formik.errors.confirm}
                    variant="outlined"
                    InputProps={{
                      className: `${classes.inputHeight} ${classes.BorderRadius}`,
                      classes: {
                        input: classes.placeHolder,
                      },
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
                  {errorMsg.length > 0 && (
                    <Typography
                      variant="subtitle1"
                      className={classes.errorText}
                    >
                      {errorMsg}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={1} sm={2} md={2} xl={2} />
              </Grid>
              <Grid
                item
                style={{
                  display: "flex",
                  justifyContent: "space-evenly",
                  marginTop: "4vh",
                  marginBottom: "40px",
                }}
              >
                <Button
                  variant="contained"
                  size="small"
                  style={{
                    width: "155px",
                    height: "40px",
                    fontWeight: "550",
                    color: "white",
                    boxShadow: "none",
                    fontSize: "14px",
                  }}
                  type="submit"
                  className={classes.sendButton}
                >
                  {loading && (
                    <CircularProgress size={20} style={{ color: "white" }} />
                  )}
                  {!loading && button1}
                </Button>
              </Grid>
            </form>
          </Box>
        </DialogContent>
      </Dialog>
      <OtpModal
        data={formData}
        open={openModal}
        handleClose={handleCloseModal}
        type="reset"
      />
    </>
  );
};
export default CreateProfileVerificationModal;

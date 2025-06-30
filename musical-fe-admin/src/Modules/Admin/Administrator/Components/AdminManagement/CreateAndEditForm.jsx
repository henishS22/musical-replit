/* eslint-disable react/prop-types */
import React, { useState } from "react";
import {
  Container,
  Grid,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  Box,
  Typography,
  InputLabel,
  CircularProgress,
  FormHelperText,
} from "@material-ui/core";
import { useFormik } from "formik";
import * as yup from "yup";
import { useQuery, useMutation } from "@apollo/client";

import { GET_ALL_ROLES } from "graphql/query/admin";
import { CREATE_ADMIN, EDIT_ADMIN } from "graphql/mutation/admin";
import { labels } from "_mocks/permissonLabels";
import ConfirmationModal from "Components/Modal/ConfirmationModal";
import { formStyles } from "./AdminManagementStyles";
import Switch from "../Switch/Switch1";

const validationSchema = yup.object({
  email: yup
    .string("Enter your email")
    .email("Enter a valid email")
    .required("Email is required"),
  fullName: yup.string("Enter your Name").required("Name is required"),
  countryCode: yup
    .string("Select the Country code")
    .required("Country code is required"),
  roleId: yup.string("Select the role").required("Role is required"),
  mobile: yup
    .string()
    .required()
    .matches(/^[0-9]+$/, "Must be only digits")
    .min(10, "Must be exactly 10 digits")
    .max(10, "Must be exactly 10 digits"),
});

// eslint-disable-next-line react/prop-types
const CreateAndEditAdmin = ({
  initialValues,
  edit,
  handleOnSuccess,
  toggleDrawer,
  setPermissions,
}) => {
  const classes = formStyles();
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formValues, setFormValues] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [selectedRole, setSelectedRole] = useState();
  const [openConfirmationModal, setOpenConfirmationModal] =
    React.useState(false);
  const { data } = useQuery(GET_ALL_ROLES, {
    variables: {
      first: 10,
      orderBy: "createdAt_DESC",
      filters: {
        isActiveBool: "true",
      },
    },
    fetchPolicy: "network-only",
  });

  const [createAdmin] = useMutation(CREATE_ADMIN);
  const [editAdmin] = useMutation(EDIT_ADMIN);

  const handleConfirmationClose = () => {
    setOpenConfirmationModal(false);
  };

  const buttonOneClick = () => {
    setOpenConfirmationModal(false);
    setLoading(false);
  };

  const buttonTwoClick = async () => {
    try {
      setOpenConfirmationModal(false);
      setLoading(true);
      const { fullName, email, mobile, countryCode, roleId, id } = formValues;
      const response = await editAdmin({
        variables: {
          where: {
            id,
          },
          input: {
            fullName,
            email,
            mobile,
            countryCode,
            roleId,
          },
        },
      });

      const { status, message } = response.data.updateAdmin;

      // Error
      if (status === "error") {
        setErrorMsg(message);
      } else {
        // Admin updated Successfully
        handleOnSuccess();
        toggleDrawer("right", false)();
      }
      setLoading(false);
    } catch (err) {
      setErrorMsg("Something went wrong !");
      setLoading(false);
    }
  };

  const handleCreateForm = async (values) => {
    try {
      setErrorMsg("");
      // Edit Admin
      if (edit) {
        setOpenConfirmationModal(true);
        setFormValues(values);
      } else {
        setLoading(true);
        // Create admin api call
        const response = await createAdmin({
          variables: {
            input: values,
          },
        });

        // Api response
        const { status, message } = response.data.createAdmin;

        // Error
        if (status === "error") {
          setErrorMsg(message);
        } else {
          // Admin created Successfully
          handleOnSuccess();
          toggleDrawer("right", false)();
        }
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg("Something went wrong !");
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      handleCreateForm(values);
    },
  });

  return (
    <Container maxWidth={false} disableGutters className={classes.app}>
      <Grid container className={classes.formBox}>
        <form
          noValidate
          autoComplete="off"
          id="adminForm"
          onSubmit={(e) => {
            e.preventDefault();
            formik.handleSubmit();
          }}
        >
          <TextField
            id="name"
            name="fullName"
            // label="Admin Name"
            placeholder="Admin Name"
            variant="outlined"
            className={classes.width100}
            value={formik.values.fullName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.fullName && Boolean(formik.errors.fullName)}
            helperText={formik.touched.fullName && formik.errors.fullName}
            InputProps={{
              classes: {
                input: classes.placeHolder,
              },
              className: classes.inputHeight,
            }}
          />
          <Box className={classes.dFlex}>
            <Box>
              <FormControl variant="outlined" className={classes.formControl}>
                <Select
                  id="stdcode"
                  name="countryCode"
                  className={`${classes.width100} ${classes.darkBack}`}
                  value={formik.values.countryCode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.countryCode &&
                    Boolean(formik.errors.countryCode)
                  }
                  helperText={
                    formik.touched.countryCode && formik.errors.countryCode
                  }
                  inputProps={{
                    classes: {
                      icon: classes.colorWhite,
                    },
                  }}
                >
                  <MenuItem value="+91">+91</MenuItem>
                  <MenuItem value="+1">+1</MenuItem>
                  <MenuItem value="+92">+92</MenuItem>
                  <MenuItem value="+93">+93</MenuItem>
                  <MenuItem value="+94">+94</MenuItem>
                  <MenuItem value="+95">+95</MenuItem>
                  <MenuItem value="+96">+96</MenuItem>
                  <MenuItem value="+97">+97</MenuItem>
                  <MenuItem value="+98">+98</MenuItem>
                  <MenuItem value="+99">+99</MenuItem>
                </Select>
                <FormHelperText style={{ color: "red" }}>
                  {formik.touched.countryCode && formik.errors.countryCode}
                </FormHelperText>
              </FormControl>
            </Box>
            <TextField
              id="mobile"
              name="mobile"
              placeholder="Admin Mobile Number"
              variant="outlined"
              className={classes.width100}
              value={formik.values.mobile}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.mobile && Boolean(formik.errors.mobile)}
              helperText={formik.touched.mobile && formik.errors.mobile}
              InputProps={{
                classes: {
                  input: classes.placeHolder,
                },
                className: classes.inputHeight1,
              }}
            />
          </Box>
          <TextField
            id="email"
            name="email"
            placeholder="Admin Email"
            variant="outlined"
            className={classes.width100}
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            InputProps={{
              classes: {
                input: classes.placeHolder,
              },
              className: classes.inputHeight2,
            }}
          />
          <FormControl
            variant="outlined"
            className={`${classes.formControl} ${classes.height35}`}
            size="small"
          >
            <InputLabel
              id="demo-simple-select-outlined-label"
              className={classes.selectLabel}
            >
              Select Role
            </InputLabel>
            <Select
              labelId="demo-simple-select-outlined-label"
              id="demo-simple-select-outlined"
              className={classes.inputHeight}
              helperText={formik.touched.roleId && formik.errors.roleId}
              label="Select Role"
              name="roleId"
              value={formik.values.roleId}
              onChange={(e) => {
                formik.handleChange(e);
                const roleData = data.roles.edges.filter(
                  (ev) => ev.node.id === e.target.value
                );
                if (roleData.length > 0) {
                  setPermissions(roleData[0].node.permissions);
                }
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.roleId && Boolean(formik.errors.roleId)}
            >
              {data &&
                data.roles.edges.map((ev) => (
                  <MenuItem value={ev.node.id}>{ev.node.name}</MenuItem>
                ))}
            </Select>
            <FormHelperText style={{ color: "red", marginBottom: "5px" }}>
              {formik.touched.roleId && formik.errors.roleId}
            </FormHelperText>
          </FormControl>
          {(selectedRole || edit) && (
            <Typography className={classes.permissonTitle}>
              Admin Permissions
            </Typography>
          )}
          {/* { selectedRole
          && Object.entries(selectedRole).map(([key1, value]) => [
            <Switch
              key={key1 + value.label}
              value={value}
              permissionLabel={labels[key1]}
              permissionName={key1}
              componentName="Admin"
              formik={formik}
            />,
          ])} */}
          {!selectedRole &&
            Object.entries(
              edit ? formik.values.role.permissions : formik.values.permissions
            ).map(([key1, value]) => [
              <Switch
                key={key1 + value.label}
                value={value}
                permissionLabel={labels[key1]}
                permissionName={key1}
                componentName="Admin"
                formik={formik}
              />,
            ])}
          {errorMsg.length > 0 && (
            <Typography variant="subtitle1" className={classes.errorText}>
              {errorMsg}
            </Typography>
          )}
          <Button
            color="primary"
            variant="contained"
            fullWidth
            type="submit"
            className={classes.submitBtn}
          >
            {loading && (
              <CircularProgress size={20} style={{ color: "white" }} />
            )}
            {!loading && "Submit"}
          </Button>
        </form>
        <ConfirmationModal
          handleClose={handleConfirmationClose}
          open={openConfirmationModal}
          heading="Edit Admin"
          subtitle="Are you sure you want to edit admin?"
          button1="Cancel"
          button2="Edit"
          onButton1Click={buttonOneClick}
          onButton2Click={buttonTwoClick}
        />
      </Grid>
    </Container>
  );
};

export default CreateAndEditAdmin;

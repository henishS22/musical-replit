/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
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
import { Formik } from "formik";
import * as yup from "yup";
import { useQuery, useMutation } from "@apollo/client";

import { GET_ADMIN_DETAILS, GET_ALL_ROLES } from "graphql/query/admin";
import { CREATE_ADMIN, EDIT_ADMIN } from "graphql/mutation/admin";
import { labels, permissons } from "_mocks/permissonLabels";
import ConfirmationModal from "Components/Modal/ConfirmationModal";
import { formStyles } from "./AdminManagementStyles";
import Switch from "../Switch/Switch2";
import mobileCode from "../../../../../contracts/CountryCode.json";
import {
  SettingsInputAntenna,
  SettingsInputHdmiSharp,
} from "@material-ui/icons";

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
    .matches(/^[0-9]+$/, "Must be only digits"),
  // .min(10, 'Must be exactly 10 digits')
  // .max(10, 'Must be exactly 10 digits'),
});

// eslint-disable-next-line react/prop-types
const CreateAndEditAdmin = ({
  initialValues,
  edit,
  handleOnSuccess,
  toggleDrawer,
  setInitialValues,
  flag,
}) => {
  const classes = formStyles();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formValues, setFormValues] = useState("");
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [userID, setUserID] = useState("");
  const [originalPermissions, setOriginalPermissions] = useState(
    initialValues?.permissions
  );

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

  const { data: getViewDetails, loading: detailsLoading } = useQuery(
    GET_ADMIN_DETAILS,
    {
      variables: {
        adminId: initialValues.roleId,
      },
      fetchPolicy: "network-only",
      skip: flag !== "edit",
    }
  );

  useEffect(() => {
    if (getViewDetails && flag === "edit") {
      setInitialValues((prev) => ({
        ...prev,
        fullName: getViewDetails?.admin?.fullName,
        countryCode: getViewDetails?.admin?.countryCode,
        email: getViewDetails?.admin?.email,
        mobile: getViewDetails?.admin?.mobile,
        roleId: getViewDetails?.admin?.role?.id,
      }));
      setUserID(getViewDetails?.admin?.id);
      setOriginalPermissions((prev) => {
        const newPermissions = getViewDetails?.admin?.role?.permissions;
        const filteredPermissions = {};

        for (const [key, value] of Object.entries(newPermissions || {})) {
          if (key in initialValues.permissions) {
            filteredPermissions[key] = value;
          }
        }

        return {
          ...prev,
          ...filteredPermissions,
        };
      });
    }
  }, [getViewDetails, flag, initialValues.permissions]);

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
      const { fullName, email, mobile, countryCode, roleId, permissions } =
        formValues;

      const updatedPermissions = { ...originalPermissions };
      delete updatedPermissions.Supply;
      const response = await editAdmin({
        variables: {
          where: {
            id: userID,
          },
          input: {
            fullName,
            email,
            mobile,
            countryCode,
            roleId,
            permissions: updatedPermissions,
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
      if (edit) {
        setOpenConfirmationModal(true);
        setFormValues(values);
      } else {
        setLoading(true);
        const updatedValues = { ...values };
        if (updatedValues.permissions || updatedValues.permissons) {
          delete updatedValues.permissions;
          delete updatedValues.permissons;
        }
        const response = await createAdmin({
          variables: {
            input: updatedValues,
          },
        });

        const { status, message } = response.data.createAdmin;

        if (status === "error") {
          setErrorMsg(message);
        } else {
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

  const handlePermissionToggle = (section, key, currentValue) => {
    setOriginalPermissions((prevPermissions) => ({
      ...prevPermissions,
      [section]: {
        ...prevPermissions[section],
        [key]: !currentValue, // Toggle the current value
      },
    }));
  };

  return (
    <Container maxWidth={false} disableGutters className={classes.app}>
      <Grid container className={classes.formBox}>
        {detailsLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100vh"
          >
            <CircularProgress size={20} style={{ color: "white" }} />
          </Box>
        ) : (
          <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={(values) => {
              handleCreateForm(values);
            }}
            render={({
              values,
              handleChange,
              handleBlur,
              handleSubmit,
              touched,
              errors,
              setFieldValue,
            }) => {
              return (
                <form
                  noValidate
                  autoComplete="off"
                  id="adminForm"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                  }}
                >
                  <TextField
                    id="name"
                    name="fullName"
                    placeholder="Admin Name"
                    variant="outlined"
                    className={classes.width100}
                    value={values.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.fullName && Boolean(errors.fullName)}
                    helperText={touched.fullName && errors.fullName}
                    InputProps={{
                      classes: {
                        input: classes.placeHolder,
                      },
                      className: classes.inputHeight,
                    }}
                  />
                  <Box className={classes.dFlex}>
                    <Box>
                      <FormControl
                        variant="outlined"
                        className={classes.formControl}
                      >
                        <Select
                          id="stdcode"
                          name="countryCode"
                          className={`${classes.width100} ${classes.darkBack}`}
                          value={values.countryCode}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={edit || flag === "edit"}
                          error={
                            touched.countryCode && Boolean(errors.countryCode)
                          }
                          helperText={touched.countryCode && errors.countryCode}
                          inputProps={{
                            classes: {
                              icon: classes.colorWhite,
                            },
                          }}
                        >
                          {mobileCode?.map((item, idx) => (
                            <MenuItem key={idx} value={item?.dial_code}>
                              {item?.emoji} {item?.dial_code}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText style={{ color: "red" }}>
                          {touched.countryCode && errors.countryCode}
                        </FormHelperText>
                      </FormControl>
                    </Box>
                    <TextField
                      id="mobile"
                      name="mobile"
                      placeholder="Admin Mobile Number"
                      variant="outlined"
                      className={classes.width100}
                      disabled={flag === "edit"}
                      value={values.mobile}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.mobile && Boolean(errors.mobile)}
                      helperText={touched.mobile && errors.mobile}
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
                    value={values.email}
                    onChange={handleChange}
                    disabled={flag === "edit"}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
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
                      helperText={touched.roleId && errors.roleId}
                      label="Select Role"
                      name="roleId"
                      value={values.roleId}
                      onChange={(e) => {
                        // handleChange(e);
                        if (e.target.value)
                          setFieldValue("roleId", e.target.value);
                        const roleData = data.roles.edges.filter(
                          (ev) => ev.node.id === e.target.value
                        );
                        if (roleData.length > 0) {
                          setFieldValue(
                            "permissions",
                            roleData[0]?.node?.permissions
                          );
                          setOriginalPermissions(
                            roleData[0]?.node?.permissions
                          );
                        }
                      }}
                      onBlur={handleBlur}
                      error={touched.roleId && Boolean(errors.roleId)}
                    >
                      {data &&
                        data.roles.edges.map((ev) => (
                          <MenuItem value={ev.node.id}>{ev.node.name}</MenuItem>
                        ))}
                    </Select>
                    <FormHelperText
                      style={{ color: "red", marginBottom: "5px" }}
                    >
                      {touched.roleId && errors.roleId}
                    </FormHelperText>
                  </FormControl>
                  <Typography className={classes.permissonTitle}>
                    Admin Permissions
                  </Typography>
                  {values.permissions &&
                    Object.keys(values.permissions).length > 0 &&
                    Object.entries(values.permissions).map(([key1, value]) => {
                      if (value === null) return null;
                      const combinedValue = Object.entries(value).reduce(
                        (acc, [key2, val]) => {
                          acc[key2] =
                            originalPermissions[key1]?.[key2] !== undefined
                              ? originalPermissions[key1][key2]
                              : val;
                          return acc;
                        },
                        {}
                      );
                      return (
                        <React.Fragment key={key1}>
                          <Switch
                            key={key1}
                            value={combinedValue}
                            permissionLabel={labels[key1]}
                            permissionName={key1}
                            originalPermissions={originalPermissions}
                            componentName="Admin"
                            handlePermissionToggle={() => console.log()}
                          />
                        </React.Fragment>
                      );
                    })}

                  {errorMsg.length > 0 && (
                    <Typography
                      variant="subtitle1"
                      className={classes.errorText}
                    >
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
              );
            }}
          />
        )}
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

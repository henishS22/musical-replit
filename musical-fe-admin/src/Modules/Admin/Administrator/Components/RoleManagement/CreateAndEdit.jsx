/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Box,
} from "@material-ui/core";
import { useFormik } from "formik";
import * as yup from "yup";
import { useMutation, useQuery } from "@apollo/client";

import { CREATE_ROLE, UPDATE_ROLE } from "graphql/mutation/admin";
import { labels } from "_mocks/permissonLabels";
import ConfirmationModal from "Components/Modal/ConfirmationModal";
import { formStyles } from "./RoleManagementStyles";
import Switch from "../Switch/Switch1";
import { GET_ROLE_DETAILS } from "graphql/query/admin";

const validationSchema = yup.object({
  name: yup.string("Enter valid Name").required("Name is required"),
});

const CreateRole = ({
  edit,
  handleOnSuccess,
  toggleDrawer,
  initialValues,
  flag,
  setRoleInitialValues,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [formValues, setFormValues] = useState("");
  const [userID, setUserID] = useState("");
  const [createRole] = useMutation(CREATE_ROLE);
  const [updateRole] = useMutation(UPDATE_ROLE);
  const classes = formStyles();

  const buttonOneClick = () => {
    setOpenConfirmationModal(false);
    setLoading(false);
  };

  const buttonTwoClick = async () => {
    try {
      setOpenConfirmationModal(false);
      setLoading(true);

      const updatedPermissions = { ...formValues.permissions };
      delete updatedPermissions.Roles;

      // Update role api call
      const { data } = await updateRole({
        variables: {
          where: {
            id: userID,
          },
          input: {
            name: formValues.name,
            permissions: updatedPermissions,
          },
        },
      });

      const { message } = data.updateRole;

      if (message === "Role updated Successfully") {
        handleOnSuccess();
        toggleDrawer("right", false)();
      }
      setLoading(false);
    } catch (err) {
      setErrorMsg("Something went wrong !");
      setLoading(false);
    }
  };

  const { data: getRoleDetails, loading: detailsLoading } = useQuery(
    GET_ROLE_DETAILS,
    {
      variables: {
        roleId: initialValues.roleId,
      },
      fetchPolicy: "network-only",
      skip: flag !== "edit",
    }
  );

  useEffect(() => {
    if (getRoleDetails && flag === "edit") {
      setRoleInitialValues((prev) => ({
        ...prev,
        name: getRoleDetails?.role?.name,
        permissions: getRoleDetails?.role?.permissions,
      }));
      setUserID(getRoleDetails?.role?.id);
    }
  }, [getRoleDetails, flag, initialValues.permissions]);

  const handleCreateForm = async (values) => {
    console.log(values, "values");
    const updatedValues = {
      ...values,
      permissions: { ...values.permissions },
    };

    try {
      setLoading(true);
      setErrorMsg("");

      if (edit) {
        setOpenConfirmationModal(true);
        setFormValues(updatedValues);
      } else {
        const { data } = await createRole({
          variables: {
            input: updatedValues,
          },
        });

        const { status, message } = data.createRole;
        if (status === "success") {
          handleOnSuccess();
          toggleDrawer("right", false)();
        }
        if (status === "error") {
          setErrorMsg(message);
          setLoading(false);
        }
      }

      setLoading(false);
    } catch (err) {
      setErrorMsg("Something went wrong!");
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

  // console.log(formik.values.permissions);

  // const handlePermissionToggle = (permissionName, actionType, currentValue) => {
  //   formik.setFieldValue(
  //     `permissions.${permissionName}.${actionType}`,
  //     !currentValue
  //   );
  // };

  const handlePermissionToggle = (permissionName, actionName, isEnabled) => {
    const updatedPermissions = {
      ...formik.values.permissions,
      [permissionName]: {
        ...formik.values.permissions[permissionName], // Deep clone the nested object
      },
    };

    if (actionName === "GET") {
      updatedPermissions[permissionName] = Object.keys(
        formik.values.permissions[permissionName]
      ).reduce((acc, key) => {
        acc[key] = key === "GET" ? isEnabled : false;
        return acc;
      }, {});
    } else {
      updatedPermissions[permissionName][actionName] = isEnabled;
      if (isEnabled && actionName !== "ALL") {
        updatedPermissions[permissionName]["GET"] = true;
      }
    }

    formik.setFieldValue("permissions", updatedPermissions);
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
              name="name"
              placeholder="Role Name"
              variant="outlined"
              className={classes.width100}
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              InputProps={{
                classes: {
                  input: classes.placeHolder,
                },
                className: classes.inputHeight,
              }}
            />
            <Typography className={classes.permissonTitle}>
              Role Permissions
            </Typography>
            {/* {Object.entries(formik.values.permissions).filter(([key]) => key === "User").map(([key, value]) => [ */}
            {Object.entries(formik.values.permissions).map(([key, value]) => [
              value ? (
                <Switch
                  key={key + value.label}
                  value={value}
                  permissionLabel={labels[key]}
                  permissionName={key}
                  componentName="Role"
                  formik={formik}
                  handlePermissionToggle={handlePermissionToggle}
                />
              ) : null,
            ])}
            {errorMsg.length > 0 && (
              <Typography variant="subtitle1" className={classes.error}>
                {errorMsg}
              </Typography>
            )}
            <Button
              color="primary"
              disabled={loading}
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
        )}
      </Grid>
      <ConfirmationModal
        handleClose={buttonOneClick}
        open={openConfirmationModal}
        heading="Edit Role"
        subtitle="Are you sure you want to edit role?"
        button1="Cancel"
        button2="Edit"
        onButton1Click={buttonOneClick}
        onButton2Click={buttonTwoClick}
      />
    </Container>
  );
};

export default CreateRole;

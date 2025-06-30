/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import * as yup from "yup";
import { useFormik } from "formik";
import { useQuery, useMutation } from "@apollo/client";
import {
  Button,
  CircularProgress,
  Grid,
  TextField,
  Dialog,
  DialogContent,
  Box,
  Typography,
} from "@material-ui/core";

import ConfirmationModal from "Components/Modal/ConfirmationModal";
import { SEARCH_COLLECTIONS } from "graphql/query/admin";
import Table from "Components/Table/Table";
import { UPDATE_FEATURED_COLLECTION } from "graphql/mutation/admin";
import { ReactComponent as CloseIcon } from "Assets/Svg/close.svg";
import { useStyles } from "./ModalStyles";
import "./styles.scss";

const validationSchema = yup.object({
  name: yup.string().required("Collection name is required"),
});

const EditFeaturedCollection = ({
  open,
  handleClose,
  heading,
  button1,
  handleOnEditSuccess,
}) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [collections, setCollection] = useState([]);
  const [dataNotFound, setDataNotFound] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [openConfirmationModal, setOpenConfirmationModal] =
    React.useState(false);
  const [updateFeaturedCollection] = useMutation(UPDATE_FEATURED_COLLECTION);
  const { data } = useQuery(SEARCH_COLLECTIONS, {
    variables: {
      orderBy: "createdAt_DESC",
      first: 100,
      filters: searchQuery
        ? {
            isFeaturedBool: "false",
            name: searchQuery,
          }
        : "",
    },
  });

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
      const response = await updateFeaturedCollection({
        variables: {
          input: {
            id: collectionId,
            isFeatured: true,
          },
        },
      });

      const { status, message } = response.data.featuredCollection;

      // Error
      if (status === "error") {
        setErrorMsg(message);
      } else {
        // Collection featured Successfully
        setOpenConfirmationModal(false);
        handleClose();
        handleOnEditSuccess();
        setLoading(false);
        setSearchQuery("");
        setCollection([]);
      }
    } catch (err) {
      setErrorMsg("Something went wrong !");
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setErrorMsg("");
      setDataNotFound(false);
      setSearchQuery(values.name);
    } catch (err) {
      setLoading(false);
      setErrorMsg("Something went wrong !");
    }
  };

  const loadData = async () => {
    const list = await data?.collections?.edges?.map(
      (collection) => collection.node
    );
    setCollection(list);
    if (list.length === 0) {
      setDataNotFound(true);
    }
  };

  useEffect(() => {
    if (data) {
      loadData();
    }
  }, [data]);

  const handleViewButton = () => {};
  const handleEditButton = () => {};
  const handleDeleteButton = () => {};
  const handleAddButton = (id) => {
    setCollectionId(id);
    setOpenConfirmationModal(true);
  };

  const TABLE_HEAD = [
    {
      id: "id",
      flag: "id",
      label: "Sr.No",
      alignRight: false,
    },
    {
      id: "name",
      flag: "name",
      label: "Collection Name",
      alignRight: false,
    },
    {
      id: "actions",
      flag: {
        read: false,
        edit: false,
        remove: false,
        add: true,
      },
      callback: {
        handleViewButton,
        handleEditButton,
        handleDeleteButton,
        handleAddButton,
      },
      label: "Actions",
      alignRight: true,
    },
  ];

  const formik = useFormik({
    initialValues: {
      name: "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

  return (
    <>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
        classes={{ paper: classes.dialogPaper5 }}
      >
        <DialogContent classes={{ root: classes.dialogContext1 }}>
          <div
            role="button"
            tabIndex={0}
            onKeyDown={() => {
              handleClose();
              setSearchQuery("");
              setCollection([]);
            }}
            onClick={() => {
              handleClose();
              setSearchQuery("");
              setCollection([]);
            }}
            className={classes.topBar2}
          >
            <span className={classes.title1}>{heading}</span>
            <span className={`${classes.onHover} ${classes.closeBtn1}`}>
              <CloseIcon />
            </span>
          </div>
          <Box className="emailVerify" id="alert-dialog-description">
            <form noValidate autoComplete="off" onSubmit={formik.handleSubmit}>
              <Grid container style={{ marginTop: "5vh" }}>
                <Grid item xs={1} sm={2} md={2} xl={2} />
                <Grid item xs={10} sm={8} md={8} xl={8}>
                  <TextField
                    id="name"
                    name="name"
                    placeholder="Collection Name"
                    className="inputRounded"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    variant="outlined"
                    InputProps={{
                      className: classes.inputHeight,
                      classes: {
                        input: classes.placeHolder,
                      },
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
            <Box className={classes.dataBox}>
              {dataNotFound && (
                <Typography className={classes.text1}>
                  No Collection Found!
                </Typography>
              )}
              {collections.length > 0 && (
                <Table
                  noPagination
                  USERLIST={collections}
                  TABLE_HEAD={TABLE_HEAD}
                />
              )}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      <ConfirmationModal
        handleClose={handleConfirmationClose}
        open={openConfirmationModal}
        heading="Add Collection"
        subtitle="Are you sure you want to add this collection in featured collection list?"
        button1="Cancel"
        button2="Confirm"
        onButton1Click={buttonOneClick}
        onButton2Click={buttonTwoClick}
      />
    </>
  );
};
export default EditFeaturedCollection;

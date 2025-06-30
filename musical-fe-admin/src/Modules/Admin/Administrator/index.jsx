/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/forbid-prop-types */
import React, { useState } from "react";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import { useMutation } from "@apollo/client";

import CreateAdmin from "Components/Form/Create";
import SuccessModal from "Components/Modal/SuccessModal";
import ConfirmationModal from "Components/Modal/ConfirmationModal";
import { DELETE_ROLE, DELETE_ADMIN } from "graphql/mutation/admin";
import { tabStyles } from "./administratorStyles";
import AdminManagement from "./Components/AdminManagement/AdminManagement";
import RoleManagement from "./Components/RoleManagement/RoleManagement";
import TopBar from "./Components/TopBar/TopBar";
import CreateAdminForm from "./Components/AdminManagement/CreateAndEditForm1";
import CreateRoleForm from "./Components/RoleManagement/CreateAndEdit";

const TabPanel = (props) => {
  // eslint-disable-next-line object-curly-newline
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
};

TabPanel.propTypes = {
  children: PropTypes.node.isRequired,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

const a11yProps = (index) => ({
  id: `simple-tab-${index}`,
  "aria-controls": `simple-tabpanel-${index}`,
});

export default function Adminstrator() {
  const classes = tabStyles();
  // eslint-disable-next-line no-unused-vars
  const [deleteId, setDeleteId] = useState(null);
  const [edit, setEdit] = useState(false);
  const [delete1, setDelete] = useState(false);
  const [value, setValue] = useState(0);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [createConfirmation, setCreateConfirmation] = useState(false);
  const [editConfirmation, setEditConfirmation] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [actionPerformed, setActionPerformed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQueryAdmin, setSearchQueryAdmin] = useState("");
  const [searchQueryRole, setSearchQueryRole] = useState("");
  const [filter, setFilter] = useState(false);
  const [filter1, setFilter1] = useState(false);
  const [roleFilter, setRoleFilter] = useState();
  const [adminFilter, setAdminFilter] = useState();
  const [state, setState] = useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  const [deleteRole] = useMutation(DELETE_ROLE);
  const [deleteAdmin] = useMutation(DELETE_ADMIN);

  const [initialValues, setInitialValues] = useState({
    roleId: "",
    fullName: "",
    mobile: "",
    countryCode: "+91",
    email: "",
  });
  const [roleInitialValues, setRoleInitialValues] = useState();

  const handleDeleteClose = () => {
    setDelete(false);
  };

  const toggleDrawer = (anchor, open) => () => {
    setState({ ...state, [anchor]: open });
    handleDeleteClose();
    setDeleteConfirmation(false);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleSuceessClose = () => {
    setOpenSuccessModal(false);
    setCreateConfirmation(false);
    setEditConfirmation(false);
  };

  const disableEdit = () => {
    setEdit(false);
  };

  const handleDeleteButtonClick = (id) => {
    setDeleteId(id);
    setOpenDeleteModal(true);
    setDelete(true);
  };

  const handleOnDeleteSuccess = async () => {
    try {
      // Delete Admin
      if (value === 0) {
        // Delete admin api call
        const { data } = await deleteAdmin({
          variables: {
            where: {
              id: deleteId,
            },
          },
        });

        const { message, status } = data.deleteAdmin;

        if (status === "error") {
          setErrorMsg(message);
          setDelete(false);
        } else {
          setOpenSuccessModal(true);
          setDeleteConfirmation(true);
          setActionPerformed(true);
          setDelete(false);
          setTimeout(() => {
            setDeleteConfirmation(false);
          }, 2000);
        }
      }
      // Delete Role
      if (value === 1) {
        // Delete role api call
        const { data } = await deleteRole({
          variables: {
            where: {
              id: deleteId,
            },
          },
        });

        const { message, status } = data.deleteRole;
        // Success case
        if (status === "success") {
          setOpenSuccessModal(true);
          setDeleteConfirmation(true);
          setActionPerformed(true);
          setDelete(false);
          setTimeout(() => {
            setDeleteConfirmation(false);
          }, 2000);
        } else {
          setErrorMsg(message);
          setDelete(false);
        }
      }
    } catch (err) {
      setErrorMsg("Error in deleting role !!");
      setDelete(false);
    }
  };

  const handleOnEditSuccess = () => {
    setOpenSuccessModal(true);
    setEditConfirmation(true);
    setActionPerformed(true);
    setEdit(false);
    setTimeout(() => {
      setEditConfirmation(false);
    }, 2000);
  };

  const handleOnCreateSuccess = () => {
    setOpenSuccessModal(true);
    setCreateConfirmation(true);
    setActionPerformed(true);
    setTimeout(() => {
      setCreateConfirmation(false);
    }, 2000);
  };

  const onCreateClick = () => {
    if (value === 0) {
      setInitialValues({
        roleId: "",
        fullName: "",
        mobile: "",
        countryCode: "+91",
        email: "",
        permissions: {
          User: {
            BAN: false,
            GET: false,
          },
          Subscription: {
            ALL: false,
          },
          Distro: {
            ALL: false,
          },
          Release: {
            ALL: false,
          },
          Quest: {
            ALL: false,
          },
          Gamification: {
            ALL: false,
          },
        },
      });
    }
    if (value === 1) {
      setRoleInitialValues({
        name: "",
        permissions: {
          User: {
            BAN: false,
            GET: false,
          },
          Subscription: {
            ALL: false,
          },
          Distro: {
            ALL: false,
          },
          Release: {
            ALL: false,
          },
          Quest: {
            ALL: false,
          },
          Gamification: {
            ALL: false,
          },
        },
      });
    }
  };

  const buttonTwoClick = async (data) => {
    setEdit(true);
    if (value === 0) {
      toggleDrawer("right", true)();
      setInitialValues((prevValues) => ({
        ...prevValues,
        permissions: {
          User: {
            BAN: false,
            GET: false,
          },
          Subscription: {
            ALL: false,
          },
          Distro: {
            ALL: false,
          },
          Release: {
            ALL: false,
          },
          Quest: {
            ALL: false,
          },
          Gamification: {
            ALL: false,
          },
        },
        roleId: data,
      }));
    }
    if (value === 1) {
      toggleDrawer("right", true)();
      setRoleInitialValues((prevValues) => ({
        ...prevValues,
        permissions: {
          User: {
            BAN: false,
            GET: false,
          },
          Subscription: {
            ALL: false,
          },
          Distro: {
            ALL: false,
          },
          Release: {
            ALL: false,
          },
          Quest: {
            ALL: false,
          },
          Gamification: {
            ALL: false,
          },
        },
        roleId: data,
      }));
      // if (data) {
      //   setRoleInitialValues(data);
      // }
    }
  };

  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.tabBar}>
        <Tabs
          TabIndicatorProps={{ style: { background: "black", height: "2px" } }}
          className={classes.tabBox}
          value={value}
          onChange={handleChange}
          aria-label="simple tabs example"
        >
          <Tab
            className={classes.tabValue}
            label="Admin Management"
            {...a11yProps(0)}
          />
          <Tab
            className={classes.tabValue}
            label="Role Management"
            {...a11yProps(1)}
          />
        </Tabs>
      </AppBar>
      {value === 0 && (
        <TopBar
          title="Create Admin"
          setFilter={setFilter1}
          adminFilter={adminFilter}
          searchQuery={searchQueryAdmin}
          setAdminFilter={setAdminFilter}
          setActionPerformed={setActionPerformed}
          setSearchQuery={setSearchQueryAdmin}
          onCreateClick={onCreateClick}
          value={value}
          onButtonClick={toggleDrawer}
        />
      )}
      {value === 1 && (
        <TopBar
          title="Create Role"
          setActionPerformed={setActionPerformed}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          setFilter={setFilter}
          searchQuery={searchQueryRole}
          setSearchQuery={setSearchQueryRole}
          onCreateClick={onCreateClick}
          value={value}
          onButtonClick={toggleDrawer}
        />
      )}
      <TabPanel value={value} index={0}>
        <AdminManagement
          searchQuery={searchQueryAdmin}
          adminFilter={adminFilter}
          filter={filter1}
          errorMsg={errorMsg}
          setErrorMsg={setErrorMsg}
          actionPerformed={actionPerformed}
          setActionPerformed={setActionPerformed}
          handleEditButtonClick={buttonTwoClick}
          handleDeleteButtonClick={handleDeleteButtonClick}
        />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <RoleManagement
          filter={filter}
          roleFilter={roleFilter}
          searchQuery={searchQueryRole}
          errorMsg={errorMsg}
          setErrorMsg={setErrorMsg}
          actionPerformed={actionPerformed}
          setActionPerformed={setActionPerformed}
          handleEditButtonClick={buttonTwoClick}
          handleDeleteButtonClick={handleDeleteButtonClick}
        />
      </TabPanel>
      {value === 0 && edit ? (
        <CreateAdmin
          state={state}
          header="Edit Admin"
          disableEdit={disableEdit}
          toggleDrawer={toggleDrawer}
          setInitialValues={setInitialValues}
        >
          <CreateAdminForm
            edit={edit}
            initialValues={initialValues}
            handleOnSuccess={handleOnEditSuccess}
            toggleDrawer={toggleDrawer}
            setInitialValues={setInitialValues}
            flag="edit"
            onCreateClick={onCreateClick}
          />
        </CreateAdmin>
      ) : (
        value === 0 && (
          <CreateAdmin
            state={state}
            header="Create Admin"
            disableEdit={disableEdit}
            toggleDrawer={toggleDrawer}
            setInitialValues={setInitialValues}
          >
            <CreateAdminForm
              edit={edit}
              initialValues={initialValues}
              handleOnSuccess={handleOnCreateSuccess}
              toggleDrawer={toggleDrawer}
              flag="create"
              setInitialValues={setInitialValues}
            />
          </CreateAdmin>
        )
      )}
      {value === 1 && edit ? (
        <CreateAdmin
          state={state}
          header="Edit Role"
          disableEdit={disableEdit}
          toggleDrawer={toggleDrawer}
          setInitialValues={setInitialValues}
        >
          <CreateRoleForm
            edit={edit}
            initialValues={roleInitialValues}
            handleOnSuccess={handleOnEditSuccess}
            toggleDrawer={toggleDrawer}
            flag="edit"
            setRoleInitialValues={setRoleInitialValues}
          />
        </CreateAdmin>
      ) : value === 1 ? (
        <CreateAdmin
          state={state}
          header="Create Role"
          disableEdit={disableEdit}
          toggleDrawer={toggleDrawer}
          setInitialValues={setInitialValues}
        >
          <CreateRoleForm
            edit={edit}
            initialValues={roleInitialValues}
            handleOnSuccess={handleOnCreateSuccess}
            toggleDrawer={toggleDrawer}
            flag="create"
            setRoleInitialValues={setRoleInitialValues}
          />
        </CreateAdmin>
      ) : (
        ""
      )}
      {value === 0 && createConfirmation && (
        <SuccessModal
          handleClose={handleSuceessClose}
          open={openSuccessModal}
          heading="Admin Created"
          subtitle="New Admin created"
          type="create"
        />
      )}
      {value === 1 && createConfirmation && (
        <SuccessModal
          handleClose={handleSuceessClose}
          open={openSuccessModal}
          heading="Role Created"
          subtitle="New Role created"
          type="create"
        />
      )}
      {value === 0 && editConfirmation && (
        <SuccessModal
          handleClose={handleSuceessClose}
          open={openSuccessModal}
          heading="Edit Confirmation"
          subtitle="Admin edited successfully"
          type="edit"
        />
      )}
      {value === 1 && editConfirmation && (
        <SuccessModal
          handleClose={handleSuceessClose}
          open={openSuccessModal}
          heading="Edit Confirmation"
          subtitle="Role edited successfully"
          type="edit"
        />
      )}
      {value === 0 && deleteConfirmation && (
        <SuccessModal
          handleClose={handleSuceessClose}
          open={openSuccessModal}
          heading="Delete Confirmation"
          subtitle="Admin deleted successfully"
          type="delete"
        />
      )}
      {value === 1 && deleteConfirmation && (
        <SuccessModal
          handleClose={handleSuceessClose}
          open={openSuccessModal}
          heading="Delete Confirmation"
          subtitle="Role deleted successfully"
          type="delete"
        />
      )}
      {value === 0 && delete1 && (
        <ConfirmationModal
          handleClose={handleDeleteClose}
          open={openDeleteModal}
          heading="Delete Admin"
          subtitle="Are you sure you want to delete admin?"
          button1="Cancel"
          button2="Delete"
          onButton1Click={handleDeleteClose}
          onButton2Click={handleOnDeleteSuccess}
        />
      )}
      {value === 1 && delete1 && (
        <ConfirmationModal
          handleClose={handleDeleteClose}
          open={openDeleteModal}
          heading="Delete Role"
          subtitle="Are you sure you want to remove this role from this list? Once you delete this role, all the user will no longer be able to access the module is added under this role."
          button1="Cancel"
          button2="Delete"
          onButton1Click={handleDeleteClose}
          onButton2Click={handleOnDeleteSuccess}
        />
      )}
    </div>
  );
}

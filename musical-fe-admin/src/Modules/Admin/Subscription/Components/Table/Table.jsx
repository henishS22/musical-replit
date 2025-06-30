/* eslint-disable no-nested-ternary */
/* eslint-disable array-callback-return */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery } from "@apollo/client";
import { Box, Typography } from "@material-ui/core";

import { GET_SUBSCRIPTIONS } from "graphql/query/admin";
import Table from "Components/Table/Table";
import { Loader } from "Components/TableLoader";
import { formStyles } from "./TableStyles";
import { DELETE_SUBSCRIPTION_PLAN } from "graphql/mutation/admin";
import ConfirmationModal from "Components/Modal/ConfirmationModal";
import { toast } from "react-toastify";

const UsersList = ({
  setErrorMsg,
  errorMsg,
  searchQuery,
  actionPerformed,
  setActionPerformed,
  filter,
  userFilter,
  setSubId,
  subId,
  setOpenSubscriptionFormEdit,
  setOpenSubscriptionFormView,
  setModeSub,
}) => {
  const navigate = useNavigate();
  const classes = formStyles();
  const [users, setUsers] = useState([]);
  const [pageInfo, setPageInfo] = useState("");
  const [page, setPage] = useState(0);
  const [deleteModal, setDeleteModal] = useState(false);

  const [deletePersonalisedPlan, { loading: isDeleting }] = useMutation(
    DELETE_SUBSCRIPTION_PLAN
  );

  const { data, refetch, error, loading } = useQuery(GET_SUBSCRIPTIONS, {
    variables: {
      orderBy: "createdAt_ASC",
      first: 10,
      filters: { typeMatch: "subscription" },
    },
    fetchPolicy: "network-only",
  });

  const setAllUsers = async () => {
    if (data && data.subscriptions) {
      const list = await data.subscriptions?.edges?.map((user, index) => ({
        ...user?.node,
        id: user?.node?.id,
        srNo: index + 1,
        name: user?.node?.name,
        monthlyCost:
          user?.node?.interval === "Monthly" ? user?.node?.price : "-",
        oneTimeCost:
          user?.node?.interval === "Lifetime" ? user?.node?.price : "-",
        createdAt: user?.node?.createdAt,
      }));
      setPageInfo(data.subscriptions.pageInfo);
      setUsers(list);
      setErrorMsg("");
    }
    setPage(0);
  };

  const handleDeleteFunc = async (id) => {
    try {
      const response = await deletePersonalisedPlan({
        variables: {
          where: {
            id,
          },
        },
      });

      if (response.data.deleteSubscription?.status) {
        toast.success(
          response.data.deleteSubscription?.message || "Deleted Successfully"
        );
        setActionPerformed(true);
        setDeleteModal(false);
        refetch();
        setAllUsers();
      } else {
        toast.error(response.data.deleteSubscription?.message);
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong !");
    }
  };

  useEffect(() => {
    if (actionPerformed) {
      refetch();
      setActionPerformed(false);
      setAllUsers();
    }
    if (error) {
      setErrorMsg("Error in loading data !");
    }

    setAllUsers();
  }, [data, actionPerformed, error, searchQuery, userFilter]);

  const handleViewButton = (id) => {
    setOpenSubscriptionFormView(true);
    setSubId(id);
    setModeSub("view");
  };
  const handleEditButton = (id) => {
    setModeSub("edit");
    setOpenSubscriptionFormEdit(true);
    setSubId(id);
  };
  const handleDeleteButton = (id) => {
    setSubId(id);
    setDeleteModal(true);
  };

  const TABLE_HEAD = [
    {
      id: "srNo",
      flag: "srNo",
      label: "Sr.No",
      alignRight: false,
    },
    {
      id: "name",
      flag: "name",
      label: "Subscription Name",
      alignRight: false,
    },
    {
      id: "planCode",
      flag: "planCode",
      label: "Plan Code",
      alignRight: false,
    },
    {
      id: "monthlyCost",
      flag: "monthlyCost",
      label: "Monthly Cost (USD)",
      alignRight: false,
    },
    {
      id: "oneTimeCost",
      flag: "oneTimeCost",
      label: "Life Time Cost (USD)",
      alignRight: false,
    },
    {
      id: "createdAt",
      flag: "createdAt",
      label: "Creation Date",
      alignRight: false,
    },
    {
      id: "actions",
      flag: { read: true, edit: true, remove: true },
      callback: { handleViewButton, handleEditButton, handleDeleteButton },
      label: "Actions",
      alignRight: false,
    },
  ];

  return (
    <>
      {loading ? (
        <div className={classes.loadingText}>
          <span>Loading...</span>
        </div>
      ) : users && users.length > 0 ? (
        <Box className={classes.mainContainer2}>
          <Table
            USERLIST={users}
            page={page}
            // handleNextPage={handleNextPage}
            // handlePreviousPage={handlePreviousPage}
            TABLE_HEAD={TABLE_HEAD}
            noPagination
          />
        </Box>
      ) : errorMsg.length > 0 ? (
        <Box className={classes.mainContainer2}>
          <Typography variant="h2" className={classes.errorText}>
            {errorMsg}
          </Typography>
        </Box>
      ) : (
        <Box className={classes.mainContainer2}>
          <Typography variant="h5">No Data Found !</Typography>
        </Box>
      )}
      {deleteModal && (
        <ConfirmationModal
          isLoading={isDeleting}
          open={deleteModal}
          handleClose={() => setDeleteModal(false)}
          heading={"Delete Subscription Plan"}
          subtitle={"Are you sure you want to delete this Subscription Plan?"}
          button1={"Cancel"}
          button2={"Confirm"}
          onButton1Click={() => setDeleteModal(false)}
          onButton2Click={() => handleDeleteFunc(subId)}
        />
      )}
    </>
  );
};

export default UsersList;

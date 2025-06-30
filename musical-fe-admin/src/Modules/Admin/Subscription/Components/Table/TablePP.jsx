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
import { toast } from "react-toastify";
import ConfirmationModal from "Components/Modal/ConfirmationModal";
// import ViewNomineeStatus from "Components/Modal/ViewNomineeStatus";

const TablePP = ({
  setErrorMsg,
  errorMsg,
  searchQuery,
  actionPerformed,
  setActionPerformed,
  filter,
  userFilter,
  setOpenModalSubsPlanEdit,
  setOpenModalSubsPlanView,
  setModePP,
  setSubId,
  subId,
}) => {
  const classes = formStyles();
  const [users, setUsers] = useState([]);
  const [pageInfo, setPageInfo] = useState("");
  const [page, setPage] = useState(0);
  const [deleteModal, setDeleteModal] = useState(false);

  const [deletePersonalisedPlan] = useMutation(DELETE_SUBSCRIPTION_PLAN);

  const { data, refetch, error, loading, fetchMore } = useQuery(
    GET_SUBSCRIPTIONS,
    {
      variables: {
        orderBy: "createdAt_DESC",
        first: 10,
        filters: { typeMatch: "addon" },
      },
      fetchPolicy: "network-only",
    }
  );

  const setAllUsers = async () => {
    if (data && data.subscriptions) {
      const list = await data.subscriptions?.edges?.map((user, index) => ({
        ...user?.node,
        id: user?.node.id,
        name: user?.node?.name,
        monthlyCost:
          user?.node?.interval === "Monthly" ? user?.node?.price : "-",
        lifetimeCost:
          user?.node?.interval === "Lifetime" ? user?.node?.price : "-",
        yearlyCost: user?.node?.interval === "Yearly" ? user?.node?.price : "-",
      }));
      setPageInfo(data.subscriptions.pageInfo);
      setUsers(list);
      setErrorMsg("");
    }
    if (!data || error) {
      setPage(0);
    }
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

  const handleNextPage = () => {
    if (pageInfo && pageInfo.hasNextPage) {
      fetchMore({
        variables: {
          first: 10,
          after: pageInfo.endCursor,
          orderBy: "createdAt_DESC",
          filters: { typeMatch: "addon" },
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prevResult;
          const list = fetchMoreResult.subscriptions.edges.map(
            (user, index) => ({
              ...user?.node,
              id: user?.node?.id,
              name: user?.node?.name,
              monthlyCost:
                user?.node?.interval === "Monthly" ? user?.node?.price : "-",
              lifetimeCost:
                user?.node?.interval === "Lifetime" ? user?.node?.price : "-",
              yearlyCost:
                user?.node?.interval === "Yearly" ? user?.node?.price : "-",
            })
          );
          setUsers(list);
          setPageInfo(fetchMoreResult?.subscriptions?.pageInfo);
          setPage(page + 1);
          return fetchMoreResult;
        },
      });
    }
  };

  const handlePreviousPage = () => {
    if (pageInfo && pageInfo.hasPreviousPage) {
      fetchMore({
        variables: {
          first: undefined,
          last: 10,
          before: pageInfo.startCursor,
          orderBy: "createdAt_DESC",
          filters: { typeMatch: "addon" },
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prevResult;
          const list = fetchMoreResult.subscriptions.edges.map(
            (user, index) => ({
              ...user?.node,
              id: user?.node?.id,
              name: user?.node?.name,
              monthlyCost:
                user?.node?.interval === "Monthly" ? user?.node?.price : "-",
              lifetimeCost:
                user?.node?.interval === "Lifetime" ? user?.node?.price : "-",
              yearlyCost:
                user?.node?.interval === "Yearly" ? user?.node?.price : "-",
            })
          );
          setUsers(list);
          setPageInfo(fetchMoreResult?.subscriptions?.pageInfo);
          setPage(page - 1);
          return fetchMoreResult;
        },
      });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, actionPerformed, error, searchQuery, userFilter]);

  const handleViewButton = (id) => {
    setModePP("view");
    setOpenModalSubsPlanView(true);
    setSubId(id);
  };
  const handleEditButton = (id) => {
    setModePP("edit");
    setOpenModalSubsPlanEdit(true);
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
      label: "Plan Name",
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
      id: "yearlyCost",
      flag: "yearlyCost",
      label: "Yearly Cost (USD)",
      alignRight: false,
    },
    {
      id: "lifetimeCost",
      flag: "lifetimeCost",
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
        <Box className={classes.mainContainer}>
          <Table
            USERLIST={users}
            page={page}
            handleNextPage={handleNextPage}
            handlePreviousPage={handlePreviousPage}
            TABLE_HEAD={TABLE_HEAD}
            pageInfo={pageInfo}
          />
        </Box>
      ) : errorMsg.length > 0 ? (
        <Box className={classes.mainContainer}>
          <Typography variant="h2" className={classes.errorText}>
            {errorMsg}
          </Typography>
        </Box>
      ) : (
        <Box className={classes.mainContainer}>
          <Typography variant="h5">No Data Found !</Typography>
        </Box>
      )}
      {deleteModal && (
        <ConfirmationModal
          open={deleteModal}
          handleClose={() => setDeleteModal(false)}
          heading={"Delete Personalised Plan"}
          subtitle={"Are you sure you want to delete this Personalised Plan?"}
          button1={"Cancel"}
          button2={"Confirm"}
          onButton1Click={() => setDeleteModal(false)}
          onButton2Click={() => handleDeleteFunc(subId)}
        />
      )}
    </>
  );
};

export default TablePP;

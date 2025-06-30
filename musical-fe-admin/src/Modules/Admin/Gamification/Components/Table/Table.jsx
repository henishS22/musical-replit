/* eslint-disable no-nested-ternary */
/* eslint-disable array-callback-return */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Box, Typography } from "@material-ui/core";

import { GET_GAMIFICATION_LIST } from "graphql/query/admin";
import Table from "Components/Table/Table";
import { formStyles } from "./TableStyles";
import {
  UPDATE_GAMIFICATION_EVENT,
  UPDATE_GAMIFICATION_STATUS,
} from "graphql/mutation/admin";
import { toast } from "react-toastify";
import GamificationForm from "../Form/GamificationForm";

const UsersList = ({
  setErrorMsg,
  errorMsg,
}) => {
  const classes = formStyles();
  const [users, setUsers] = useState([]);
  const [pageInfo, setPageInfo] = useState("");
  const [page, setPage] = useState(0);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [updateEvent] = useMutation(UPDATE_GAMIFICATION_EVENT);
  const [updateStatus] = useMutation(UPDATE_GAMIFICATION_STATUS);

  const { data, refetch, error, loading, fetchMore } = useQuery(
    GET_GAMIFICATION_LIST,
    {
      variables: {
        orderBy: "createdAt_ASC",
        first: 10,
      },
      fetchPolicy: "network-only",
    }
  );

  const setAllUsers = async () => {
    if (data && data.gamificationList) {
      const list = await data.gamificationList?.edges?.map((user, index) => ({
        ...user?.node,
        id: user?.node?.id,
      }));
      setPageInfo(data.gamificationList.pageInfo);
      setUsers(list);
      setErrorMsg("");
    }

    if (!data || error) {
      setPage(0);
    }
  };

  useEffect(() => {
    if (error) {
      setErrorMsg("Error in loading data !");
    }
    setAllUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, error]);

  const handleNextPage = () => {
    if (pageInfo.hasNextPage) {
      fetchMore({
        variables: {
          first: 10,
          after: pageInfo.endCursor,
          orderBy: "createdAt_ASC",
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prevResult;

          // Update the users list with new data
          const newList = fetchMoreResult.gamificationList.edges.map(
            (user, index) => ({
              ...user?.node,
              id: user?.node?.id,
            })
          );
          setUsers(newList);
          // Update pageInfo
          setPageInfo(fetchMoreResult.gamificationList.pageInfo);

          // Increment page number
          setPage(page + 1);

          return fetchMoreResult;
        },
      });
    }
  };

  const handlePreviousPage = () => {
    if (pageInfo.hasPreviousPage) {
      fetchMore({
        variables: {
          last: 10,
          before: pageInfo.startCursor,
          orderBy: "createdAt_ASC",
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prevResult;

          // Update the users list with new data
          const newList = fetchMoreResult.gamificationList.edges.map(
            (user, index) => ({
              ...user?.node,
              id: user?.node?.id,
            })
          );
          setUsers(newList);

          // Update pageInfo
          setPageInfo(fetchMoreResult.gamificationList.pageInfo);

          // Decrement page number
          setPage(page - 1);

          return fetchMoreResult;
        },
      });
    }
  };

  const handleEditButton = (id) => {
    const item = users.find((user) => user.id === id);
    setSelectedItem(item);
    setEditDialog(true);
  };

  const handleUpdateSubmit = async (values) => {
    try {
      // First update the event details
      const eventResponse = await updateEvent({
        variables: {
          where: {
            id: selectedItem.id,
          },
          input: {
            name: values.name,
            occurrence: parseInt(values.occurrence),
            points: parseInt(values.points),
          },
        },
      });

      if (!eventResponse.data.updateEvent?.status) {
        toast.error(eventResponse.data.updateEvent?.message || "Update failed");
        return;
      }

      // Then update the status if it has changed
      if (values.isActive !== selectedItem.isActive) {
        const statusResponse = await updateStatus({
          variables: {
            where: {
              id: selectedItem.id,
            },
            input: {
              isActive: values.isActive,
            },
          },
        });

        if (!statusResponse.data.updateStatus?.status) {
          toast.error(
            statusResponse.data.updateStatus?.message || "Status update failed"
          );
          return;
        }
      }

      // If both updates were successful (or status didn't need updating)
      refetch();
      toast.success("Updated Successfully");
      setEditDialog(false);
    } catch (error) {
      toast.error("Something went wrong!");
      console.error("Update error:", error);
    }
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
      label: "Name",
      alignRight: false,
    },
    {
      id: "points",
      flag: "points",
      label: "Points",
      alignRight: false,
    },
    {
      id: "occurrence",
      flag: "occurrence",
      label: "Occurrence",
      alignRight: false,
    },
    {
      id: "createdById",
      flag: "createdById",
      label: "Created By",
      alignRight: false,
    },
    {
      id: "isActive",
      flag: "isActive",
      label: "Status",
      alignRight: false,
    },
    {
      id: "actions",
      flag: { edit: true },
      callback: { handleEditButton },
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
            handleNextPage={handleNextPage}
            handlePreviousPage={handlePreviousPage}
            TABLE_HEAD={TABLE_HEAD}
            pageInfo={pageInfo}
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
      <GamificationForm
        open={editDialog}
        handleClose={() => setEditDialog(false)}
        selectedItem={selectedItem}
        onSubmit={handleUpdateSubmit}
      />
    </>
  );
};

export default UsersList;

/* eslint-disable no-nested-ternary */
/* eslint-disable array-callback-return */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { Box, Typography } from "@material-ui/core";

import { GET_USER_ACTIVITY_LIST } from "graphql/query/admin";
import Table from "Components/Table/Table";
import { formStyles } from "./TableStyles";

const UsersList = ({ setErrorMsg, errorMsg, searchQuery }) => {
  const classes = formStyles();
  const [users, setUsers] = useState([]);
  const [pageInfo, setPageInfo] = useState("");
  const [page, setPage] = useState(0);

  const { data, error, loading, fetchMore } = useQuery(GET_USER_ACTIVITY_LIST, {
    variables: {
      first: 10,
      orderBy: "points_DESC",
      filters:
        searchQuery?.length !== 0
          ? {
              search: searchQuery,
            }
          : {},
    },
    fetchPolicy: "network-only",
  });

  const handleNextPage = () => {
    if (pageInfo.hasNextPage) {
      fetchMore({
        variables: {
          first: 10,
          after: pageInfo.endCursor,
          orderBy: "points_DESC",
          filters:
            searchQuery?.length !== 0
              ? {
                  search: searchQuery,
                }
              : {},
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prevResult;

          const list = fetchMoreResult.leaderboard.edges.map((activity) => ({
            ...activity.node,
            name: activity.node.userId.name,
            email: activity.node.userId.email,
          }));
          setUsers(list);
          setPageInfo(fetchMoreResult.leaderboard.pageInfo);
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
          orderBy: "points_DESC",
          filters:
            searchQuery?.length !== 0
              ? {
                  search: searchQuery,
                }
              : {},
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prevResult;

          const list = fetchMoreResult.leaderboard.edges.map((activity) => ({
            ...activity.node,
            name: activity.node.userId.name,
            email: activity.node.userId.email,
          }));
          setUsers(list);
          setPageInfo(fetchMoreResult.leaderboard.pageInfo);
          setPage(page - 1);

          return fetchMoreResult;
        },
      });
    }
  };

  const setAllUsers = async () => {

    if (data && data.leaderboard) {
      const list = data.leaderboard.edges.map((activity) => ({
        ...activity.node,
        name: activity.node.userId.name,
        email: activity.node.userId.email,
      }));
      setPageInfo(data.leaderboard.pageInfo);
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
  }, [data, error, searchQuery]);

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
      label: "Name",
      alignRight: false,
    },
    {
      id: "email",
      flag: "email",
      label: "Email",
      alignRight: false,
    },
    {
      id: "eventPerformed",
      flag: "eventPerformed",
      label: "Events Performed",
      alignRight: false,
    },
    {
      id: "eventPoints",
      flag: "eventPoints",
      label: "Events Points",
      alignRight: false,
    },
    {
      id: "questPerformed",
      flag: "questPerformed",
      label: "Quests Performed",
      alignRight: false,
    },
    {
      id: "questPoints",
      flag: "questPoints",
      label: "Quests Points",
      alignRight: false,
    },
    {
      id: "points",
      flag: "points",
      label: "Total Points",
      alignRight: false,
    },
    {
      id: "actions",
      flag: { read: false },
      callback: {},
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
    </>
  );
};

export default UsersList;

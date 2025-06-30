/* eslint-disable no-nested-ternary */
/* eslint-disable array-callback-return */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useQuery, useLazyQuery } from "@apollo/client";
import { Box, Typography } from "@material-ui/core";

import {
  // GET_ALL_USERS,
  GET_ALL_USERS_ADMIN,
  GET_ALL_USERS_ADMIN_NEXT,
  GET_ALL_USERS_ADMIN_PREV,
  GET_DISTROLIST,
} from "graphql/query/admin";
import Table from "Components/Table/Table";
import { Loader } from "Components/TableLoader";
import { formStyles } from "./TableStyles";
// import ViewNomineeStatus from "Components/Modal/ViewNomineeStatus";

const UsersList = ({
  setErrorMsg,
  errorMsg,
  searchQuery,
  actionPerformed,
  setActionPerformed,
  filter,
  userFilter,
}) => {
  const navigate = useNavigate();
  const classes = formStyles();
  const [users, setUsers] = useState([]);
  const [pageInfo, setPageInfo] = useState("");
  const [page, setPage] = useState(0);
  // const [openModal, setOpenModal] = React.useState(false);
  //const [id, setId] = useState("")

  // const handleCloseModal = () => {
  //   setOpenModal(false);
  // };

  const { data, refetch, error, loading } = useQuery(GET_DISTROLIST, {
    variables: {
      first: 10,
      orderBy: "createdAt_DESC",
      filters:
        searchQuery?.length === 0
          ? !filter
            ? {}
            : userFilter
          : {
              searchDistro: searchQuery,
            },
    },
    fetchPolicy: "network-only",
  });

  const [getNextPage, { loading: nextPageLoader }] =
    useLazyQuery(GET_DISTROLIST);
  const [getPrevPage, { loading: prevPageLoader }] =
    useLazyQuery(GET_DISTROLIST);

  const handleNextPage = async () => {
    if (pageInfo.hasNextPage) {
      const nextPageData = await getNextPage({
        variables: {
          first: 10,
          after: pageInfo.endCursor,
          orderBy: "createdAt_DESC",
          filters:
            searchQuery?.length === 0
              ? !filter
                ? {}
                : userFilter
              : {
                  searchDistro: searchQuery,
                },
        },
        fetchPolicy: "network-only",
      });

      if (nextPageData.data.distroList) {
        const list = await nextPageData.data.distroList.edges.map((user) => ({
          ...user.node,
          _status:
            user.node.status === "PENDING"
              ? "Pending"
              : user.node.status === "REJECTED"
              ? "Rejected"
              : "Approved",
          name: user.node.userId.username,
          createdAt: user.node.createdAt,
        }));
        setUsers(list);
        setPage(page + 1);
        setPageInfo(nextPageData.data.distroList.pageInfo);
        setErrorMsg("");
      }
    }
  };

  const handlePreviousPage = async () => {
    if (pageInfo.hasPreviousPage) {
      const prevPageData = await getPrevPage({
        variables: {
          last: 10,
          before: pageInfo.startCursor,
          orderBy: "createdAt_DESC",
          filters:
            searchQuery?.length === 0
              ? !filter
                ? {}
                : userFilter
              : {
                  walletAddress: searchQuery,
                },
        },
        fetchPolicy: "network-only",
      });
      if (prevPageData.data.distroList) {
        const list = await prevPageData.data.distroList.edges.map((user) => ({
          ...user.node,
          _status:
            user.node.status === "PENDING"
              ? "Pending"
              : user.node.status === "REJECTED"
              ? "Rejected"
              : "Approved",
          name: user.node.userId.username,
          createdAt: user.node.createdAt,
        }));
        setUsers(list);
        setPage(page - 1);
        setPageInfo(prevPageData.data.distroList.pageInfo);
        setErrorMsg("");
      }
    }
  };

  const setAllUsers = async () => {
    if (data && data.distroList) {
      const list = await data.distroList.edges.map((user) => ({
        ...user.node,
        _status:
          user.node.status === "PENDING"
            ? "Pending"
            : user.node.status === "REJECTED"
            ? "Rejected"
            : "Approved",
        name: user.node.userId.username,
        createdAt: user.node.createdAt,
      }));
      setPageInfo(data.distroList.pageInfo);
      setUsers(list);
      setErrorMsg("");
    }
    setPage(0);
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
    // setId(id)
    // setOpenModal(true)
    navigate("/admin/distro/view-request", { state: { id } });
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
      label: "User Name",
      alignRight: false,
    },
    {
      id: "_status",
      flag: "_status",
      label: "Status",
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
      flag: { read: true },
      callback: { handleViewButton },
      label: "Actions",
      alignRight: false,
    },
  ];

  return (
    <>
      {loading || nextPageLoader || prevPageLoader ? (
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

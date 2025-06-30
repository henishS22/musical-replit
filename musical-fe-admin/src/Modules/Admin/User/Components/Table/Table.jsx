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

  const { data, refetch, error, loading } = useQuery(GET_ALL_USERS_ADMIN, {
    variables: {
      first: 10,
      orderBy: "createdAt_DESC",
      filters:
        searchQuery?.length === 0
          ? !filter
            ? {}
            : userFilter
          : {
              name: searchQuery,
            },
    },
    fetchPolicy: "network-only",
  });

  const [getNextPage, { loading: nextPageLoader }] = useLazyQuery(
    GET_ALL_USERS_ADMIN_NEXT
  );
  const [getPrevPage, { loading: prevPageLoader }] = useLazyQuery(
    GET_ALL_USERS_ADMIN_PREV
  );

  const formatWalletAddresses = (wallets) => {
    // Filter out any empty addresses
    const nonEmptyAddresses = wallets.filter((wallet) => wallet.addr !== "");
    if (nonEmptyAddresses.length === 1) {
      // If only one address, return that address without any "+", just show the address
      return `${nonEmptyAddresses[0].addr?.slice(0, 8)}...`;
    } else if (nonEmptyAddresses.length > 1) {
      // If more than one address, show the first one with a "+" and the count of remaining addresses
      const firstAddr = `${nonEmptyAddresses[0].addr?.slice(0, 8)}...`;
      // const firstAddr = nonEmptyAddresses[0].addr;

      const remainingCount = nonEmptyAddresses.length - 1;
      return `${firstAddr} + ${remainingCount}`;
    }
    return "N/A"; // in case there are no addresses at all
  };

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
                  name: searchQuery,
                },
        },
        fetchPolicy: "network-only",
      });

      if (nextPageData.data.users) {
        const list = await nextPageData.data.users.edges.map((user) => ({
          ...user.node,
          wallet: formatWalletAddresses(user.node.wallets),
        }));
        setUsers(list);
        setPage(page + 1);
        setPageInfo(nextPageData.data.users.pageInfo);
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
      if (prevPageData.data.users) {
        const list = await prevPageData.data.users.edges.map((user) => ({
          ...user.node,
          wallet: formatWalletAddresses(user.node.wallets),
        }));
        setUsers(list);
        setPage(page - 1);
        setPageInfo(prevPageData.data.users.pageInfo);
        setErrorMsg("");
      }
    }
  };

  const setAllUsers = async () => {
    if (data && data.users) {
      const list = await data.users.edges.map((user) => ({
        ...user.node,
        wallet: formatWalletAddresses(user.node.wallets),
      }));
      setPageInfo(data.users.pageInfo);
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
    navigate("/admin/user/view-user", { state: { id } });
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
      id: "email",
      flag: "email",
      label: "Email Address",
      alignRight: false,
    },
    {
      id: "wallet",
      flag: "wallet",
      label: "Wallet Address",
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
          {/* <ViewNomineeStatus
        handleClose={handleCloseModal}
        open={openModal}
        heading="Nominee Details"
        subtitle=""
        type="delete"
        data={data}
        accountId={id}
      /> */}
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

/* eslint-disable no-nested-ternary */
/* eslint-disable array-callback-return */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useQuery, useLazyQuery } from "@apollo/client";
import { Box, Typography } from "@material-ui/core";

import { GET_RELEASE_LIST } from "graphql/query/admin";
import Table from "Components/Table/Table";
import { formStyles } from "./TableStyles";

const ReleaseList = ({
  setErrorMsg,
  errorMsg,
  // searchQuery,
  actionPerformed,
  setActionPerformed,
}) => {
  const navigate = useNavigate();
  const classes = formStyles();
  const [users, setUsers] = useState([]);
  const [pageInfo, setPageInfo] = useState("");
  const [page, setPage] = useState(0);

 
  const { data, refetch, error, loading } = useQuery(GET_RELEASE_LIST, {
    variables: {
      first: 10,
      orderBy: "createdAt_DESC",
    },
    fetchPolicy: "network-only",
  });

  const [getNextPage, { loading: nextPageLoader }] =
    useLazyQuery(GET_RELEASE_LIST);
  const [getPrevPage, { loading: prevPageLoader }] =
    useLazyQuery(GET_RELEASE_LIST);

  const handleNextPage = async () => {
    if (pageInfo.hasNextPage) {
      const nextPageData = await getNextPage({
        variables: {
          first: 10,
          after: pageInfo.endCursor,
          orderBy: "createdAt_DESC",
        },
        fetchPolicy: "network-only",
      });

      if (nextPageData.data.releaseList) {
        const list = await nextPageData.data.releaseList.edges.map((user) => ({
          ...user.node,
          TrackArtist: user?.node?.track?.artist,
          TrackName: user?.node?.trackId?.name,
          Collaborators: user?.node?.collaborators?.length,
          createdAt: user.node.createdAt,
        }));
        setUsers(list);
        setPage(page + 1);
        setPageInfo(nextPageData.data.releaseList.pageInfo);
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
        },
        fetchPolicy: "network-only",
      });
      if (prevPageData.data.releaseList) {
        const list = await prevPageData.data.releaseList.edges.map((user) => ({
          ...user.node,
          TrackArtist: user?.node?.track?.artist,
          TrackName: user?.node?.trackId?.name,
          Collaborators: user?.node?.collaborators?.length,
          createdAt: user.node.createdAt,
        }));
        setUsers(list);
        setPage(page - 1);
        setPageInfo(prevPageData.data.releaseList.pageInfo);
        setErrorMsg("");
      }
    }
  };

  const setAllUsers = async () => {
    if (data && data.releaseList) {
      const list = await data.releaseList.edges.map((user) => ({
        ...user.node,
        TrackArtist: user?.node?.track?.artist,
        TrackName: user?.node?.trackId?.name,
        Collaborators: user?.node?.collaborators?.length,
        createdAt: user.node.createdAt,
      }));
      setPageInfo(data.releaseList.pageInfo);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, actionPerformed, error]);

  const handleViewButton = (id) => {
    navigate("/admin/release/view-release", { state: { id } });
  };

  const TABLE_HEAD = [
    {
      id: "id",
      flag: "id",
      label: "Sr.No",
      alignRight: false,
    },
    {
      id: "TrackName",
      flag: "TrackName",
      label: "Track Name",
      alignRight: false,
    },
    {
      id: "TrackArtist",
      flag: "TrackArtist",
      label: "Track Artist",
      alignRight: false,
    },
    {
      id: "Collaborators",
      flag: "Collaborators",
      label: "Collaborators",
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

export default ReleaseList;

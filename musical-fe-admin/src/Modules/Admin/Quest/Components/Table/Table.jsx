/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-nested-ternary */
/* eslint-disable array-callback-return */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { Box, Typography } from "@material-ui/core";

import { GET_QUEST_LIST } from "graphql/query/admin";
import Table from "Components/Table/Table";
import { formStyles } from "./TableStyles";
import QuestForm from "../QuestForm";

const QuestList = ({
  setErrorMsg,
  errorMsg,
  searchQuery,
  actionPerformed,
  setActionPerformed,
  filter,
  userFilter,
  onEdit,
}) => {
  const classes = formStyles();
  const [users, setUsers] = useState([]);
  const [pageInfo, setPageInfo] = useState("");
  const [page, setPage] = useState(0);
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState(null);

  const { data, refetch, error, loading, fetchMore } = useQuery(
    GET_QUEST_LIST,
    {
      variables: {
        first: 10,
        orderBy: "createdAt_DESC",
        filters:
          searchQuery?.length === 0
            ? !filter
              ? {}
              : userFilter
            : {
                questSearch: searchQuery,
              },
      },
      fetchPolicy: "network-only",
    }
  );

  const handleNextPage = () => {
    if (pageInfo.hasNextPage) {
      fetchMore({
        variables: {
          first: 10,
          after: pageInfo.endCursor,
          orderBy: "createdAt_DESC",
          last: undefined,
          // filters: ...,
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prevResult;
          const list = fetchMoreResult.questList.edges.map((user) => ({
            ...user.node,
            createdAt: user.node.createdById.createdAt,
          }));
          setUsers(list);
          setPageInfo(fetchMoreResult.questList.pageInfo);
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
          first: undefined,
          last: 10,
          before: pageInfo.startCursor,
          orderBy: "createdAt_DESC",
          // filters: ...,
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prevResult;
          const list = fetchMoreResult.questList.edges.map((user) => ({
            ...user.node,
            createdAt: user.node.createdById.createdAt,
          }));
          setUsers(list);
          setPageInfo(fetchMoreResult.questList.pageInfo);
          setPage(page - 1);
          return fetchMoreResult;
        },
      });
    }
  };

  const setAllUsers = async () => {
    if (data && data.questList) {
      const list = await data.questList.edges.map((user) => ({
        ...user.node,
        createdAt: user.node.createdById.createdAt,
      }));
      setPageInfo(data.questList.pageInfo);
      setUsers(list);
      setErrorMsg("");
    }

    if (!data || error) {
      setPage(0);
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

  const handleEditButton = (id) => {
    const quest = users.find((item) => id === item.id)
    setSelectedQuest(quest);
    setIsOpenEditModal(true);
    if (onEdit) onEdit(quest);
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
      label: "Name",
      alignRight: false,
    },
    {
      id: "identifier",
      flag: "identifier",
      label: "Identifier",
      alignRight: false,
    },
    {
      id: "occurrence",
      flag: "occurrence",
      label: "Occurrence",
      alignRight: false,
    },
    {
      id: "points",
      flag: "points",
      label: "Points",
      alignRight: false,
    },
    {
      id: "createdAt",
      flag: "createdAt",
      label: "Creation Date",
      alignRight: false,
    },
    {
      id: "isPublished",
      flag: "isPublished",
      label: "Published",
      alignRight: false,
    },
    {
      id: "isPublishByAdmin",
      flag: "isPublishByAdmin",
      label: "Publishable by Admin",
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
      {selectedQuest && (
        <QuestForm
          open={isOpenEditModal}
          handleClose={() => setIsOpenEditModal(false)}
          setActionPerformed={setActionPerformed}
          mode="edit"
          quest={selectedQuest}
        />
      )}
    </>
  );
};

export default QuestList;

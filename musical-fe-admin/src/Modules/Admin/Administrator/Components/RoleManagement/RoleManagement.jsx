/* eslint-disable array-callback-return */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { Typography, Box } from "@material-ui/core";
import { useQuery, useLazyQuery } from "@apollo/client";
import { useNavigate } from "react-router";
import Table from "Components/Table/Table";
import {
  GET_ALL_ROLES,
  GET_NEXT_ROLES_PAGE,
  GET_PREV_ROLES_PAGE,
} from "graphql/query/admin";
import { formStyles } from "./RoleManagementStyles";
import Loader from "Components/Loader";

const RoleManagement = ({
  handleEditButtonClick,
  handleDeleteButtonClick,
  roleFilter,
  filter,
  actionPerformed,
  setActionPerformed,
  errorMsg,
  setErrorMsg,
  searchQuery,
}) => {
  const navigate = useNavigate();
  const classes = formStyles();
  const [roles, setRoles] = useState([]);
  const [pageInfo, setPageInfo] = useState("");
  const [page, setPage] = useState(0);
  const { data, refetch, error, loading } = useQuery(GET_ALL_ROLES, {
    variables: {
      first: 10,
      orderBy: "createdAt_DESC",
      filters: !filter
        ? {
            isActiveBool: "true",
            name: searchQuery.length === 0 ? "" : searchQuery,
          }
        : { ...roleFilter, isActiveBool: "true" },
    },
    fetchPolicy: "network-only",
  });

  const [getNextPage] = useLazyQuery(GET_NEXT_ROLES_PAGE);
  const [getPrevPage] = useLazyQuery(GET_PREV_ROLES_PAGE);

  const handleNextPage = async () => {
    if (pageInfo.hasNextPage) {
      const nextPageData = await getNextPage({
        variables: {
          first: 10,
          after: pageInfo.endCursor,
          orderBy: "createdAt_DESC",
          filters: !filter
            ? {
                isActiveBool: "true",
                name: searchQuery.length === 0 ? "" : searchQuery,
              }
            : { ...roleFilter, isActiveBool: "true" },
        },
        fetchPolicy: "network-only",
      });

      if (nextPageData.data.roles) {
        const list = await nextPageData.data.roles.edges.map((role) => ({
          ...role.node,
          createdByAdmin: role?.node?.createdBy?.fullName,
        }));
        setRoles(list);
        setPage(page + 1);
        setPageInfo(nextPageData.data.roles.pageInfo);
        setErrorMsg("");
      }
    }
  };

  const handlePreviousPage = async () => {
    if (pageInfo.hasPreviousPage) {
      const prevPageData = await getPrevPage({
        variables: {
          last: 10,
          after: pageInfo.startCursor,
          orderBy: "createdAt_DESC",
          filters: !filter
            ? {
                isActiveBool: "true",
                name: searchQuery.length === 0 ? "" : searchQuery,
              }
            : { ...roleFilter, isActiveBool: "true" },
        },
        fetchPolicy: "network-only",
      });

      if (prevPageData.data.roles) {
        const list = await prevPageData.data.roles.edges.map((role) => ({
          ...role.node,
          createdByAdmin: role?.node?.createdBy?.fullName,
        }));
        setRoles(list);
        setPage(page - 1);
        setPageInfo(prevPageData.data.roles.pageInfo);
        setErrorMsg("");
      }
    }
  };

  const handleViewButton = (id) => {
    navigate("/admin/administrator/view-role", { state: { id } });
  };

  const handleEditButton = (id) => {
    handleEditButtonClick(id);
  };
  const handleDeleteButton = (id) => {
    handleDeleteButtonClick(id);
  };

  const setAllRoles = async () => {
    // Display All Data
    if (data && data.roles) {
      const list = await data.roles.edges.map((role) => ({
        ...role.node,
        createdByAdmin: role?.node?.createdBy?.fullName,
      }));
      setPageInfo(data.roles.pageInfo);
      setRoles(list);
      setErrorMsg("");
    }
    setPage(0);
  };

  useEffect(() => {
    if (actionPerformed) {
      refetch();
      setActionPerformed(false);
    }
    if (error) {
      setErrorMsg("Error in loading data !");
    }

    setAllRoles();
  }, [data, actionPerformed, error, searchQuery, filter]);

  const TABLE_HEAD = [
    { id: "id", label: "Sr.No", alignRight: false },
    { id: "name", label: "Role Name", alignRight: false },
    { id: "createdByAdmin", label: "Created By", alignRight: false },
    { id: "createdAt", label: "Creation Date", alignRight: false },
    // {id:'isActive', label: 'Status', alignRight:false},
    {
      id: "actions",
      flag: { edit: true, remove: true },
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
      ) : roles.length > 0 ? (
        <Box className={classes.noDataBox}>
          {errorMsg.length > 0 && (
            <Typography variant="h2" className={classes.errorText}>
              {errorMsg}
            </Typography>
          )}
          <Table
            USERLIST={roles}
            TABLE_HEAD={TABLE_HEAD}
            handleNextPage={handleNextPage}
            handlePreviousPage={handlePreviousPage}
            page={page}
            setPage={setPage}
            pageInfo={pageInfo}
          />
        </Box>
      ) : errorMsg.length > 0 ? (
        <Box className={classes.noDataBox}>
          <Typography variant="h2" className={classes.errorText}>
            {errorMsg}
          </Typography>
        </Box>
      ) : (
        <Box className={classes.noDataBox}>
          <Typography variant="h5">No Data Found !</Typography>
        </Box>
      )}
    </>
  );
};

export default RoleManagement;

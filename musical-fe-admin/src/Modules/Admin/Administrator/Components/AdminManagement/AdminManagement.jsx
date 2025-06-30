/* eslint-disable array-callback-return */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@material-ui/core";
import { useQuery, useLazyQuery } from "@apollo/client";

import Table from "Components/Table/Table";
import { Loader } from "Components/TableLoader";
import {
  GET_ALL_ADMINS,
  GET_NEXT_ADMINS_PAGE,
  GET_PREV_ADMINS_PAGE,
} from "graphql/query/admin";
import { formStyles } from "./AdminManagementStyles";

const AdminManagement = ({
  handleEditButtonClick,
  handleDeleteButtonClick,
  searchQuery,
  actionPerformed,
  setActionPerformed,
  filter,
  adminFilter,
  errorMsg,
  setErrorMsg,
}) => {
  const classes = formStyles();
  const [admins, setAdmins] = useState([]);
  const [pageInfo, setPageInfo] = useState("");
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const { data, refetch, error, loading } = useQuery(GET_ALL_ADMINS, {
    variables: {
      first: 10,
      orderBy: "createdAt_DESC",
      filters: !filter
        ? {
            isActiveBool: "true",
            ...(searchQuery.length > 0 && { fullName: searchQuery }),
          }
        : {
            isActiveBool: "true",
            ...(adminFilter && { ...adminFilter }),
            ...(searchQuery.length > 0 && { fullName: searchQuery }),
          },
      // filters: !filter ? {
      //   search: searchQuery.length === 0 ? '' : searchQuery,
      // } : adminFilter,
    },
    fetchPolicy: "network-only",
  });

  const [getNextPage] = useLazyQuery(GET_NEXT_ADMINS_PAGE);
  const [getPrevPage] = useLazyQuery(GET_PREV_ADMINS_PAGE);

  const handleNextPage = async () => {
    if (pageInfo.hasNextPage) {
      const nextPageData = await getNextPage({
        variables: {
          first: 10,
          orderBy: "createdAt_DESC",
          after: pageInfo.endCursor,
          filters: {
            isActiveBool: "true",
            ...(adminFilter && { ...adminFilter }),
            ...(searchQuery.length > 0 && { fullName: searchQuery }),
          },
          fetchPolicy: "network-only",
        },
      });

      if (nextPageData.data.admins) {
        const list = await nextPageData.data.admins.edges.map((admin) => ({
          ...admin.node,
          role: admin.node.role.name,
        }));
        setAdmins(list);
        setPage(page + 1);
        setPageInfo(nextPageData.data.admins.pageInfo);
        setErrorMsg("");
      }
    }
  };

  const handlePreviousPage = async () => {
    if (pageInfo.hasPreviousPage) {
      const prevPageData = await getPrevPage({
        variables: {
          last: 10,
          orderBy: "createdAt_DESC",
          before: pageInfo.startCursor,
          filters: {
            isActiveBool: "true",
            ...(adminFilter && { ...adminFilter }),
            ...(searchQuery.length > 0 && { fullName: searchQuery }),
          },
        },
        fetchPolicy: "network-only",
      });

      if (prevPageData.data.admins) {
        const list = await prevPageData.data.admins.edges.map((admin) => ({
          ...admin.node,
          role: admin.node.role.name,
        }));
        setAdmins(list);
        setPage(page - 1);
        setPageInfo(prevPageData.data.admins.pageInfo);
        setErrorMsg("");
      }
    }
  };

  const handleViewButton = (id) => {
    navigate("/admin/administrator/details", { state: { id } });
  };

  const handleEditButton = (id) => {
    handleEditButtonClick(id);
  };
  const handleDeleteButton = (id) => {
    handleDeleteButtonClick(id);
  };

  const setAllAdmins = async () => {
    // Display All Data
    if (data && data.admins) {
      const list = await data.admins.edges.map((admin) => ({
        ...admin.node,
        role: admin.node.role.name,
      }));
      setPageInfo(data.admins.pageInfo);
      setAdmins(list);
      setErrorMsg("");
    }
    setPage(0);
  };

  useEffect(() => {
    if (actionPerformed) {
      refetch();
      setActionPerformed(false);
      setAllAdmins();
    }
    if (error) {
      setErrorMsg("Error in loading data !");
    }

    setAllAdmins();
  }, [data, actionPerformed, error, searchQuery]);

  const TABLE_HEAD = [
    {
      id: "id",
      flag: "Sr.No",
      label: "Sr.No",
      alignRight: false,
    },
    {
      id: "fullName",
      flag: "fullName",
      label: "Admin Name",
      alignRight: false,
    },
    {
      id: "role",
      flag: "role",
      label: "Role",
      alignRight: false,
    },
    {
      id: "email",
      flag: "email",
      label: "Email Id",
      alignRight: false,
    },
    {
      id: "countryCode",
      flag: "mobile",
      label: "Phone Number",
      alignRight: false,
    },
    // {
    //   id: 'isActive', flag: '', label: 'Status' , alignRight: false,
    // },
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
      ) : admins && admins.length > 0 ? (
        <Box style={{ minHeight: "100vh" }}>
          {errorMsg.length > 0 && (
            <Typography variant="h2" className={classes.errorText}>
              {errorMsg}
            </Typography>
          )}
          <Table
            USERLIST={admins}
            TABLE_HEAD={TABLE_HEAD}
            handleNextPage={handleNextPage}
            handlePreviousPage={handlePreviousPage}
            page={page}
            setPage={setPage}
            pageInfo={pageInfo}
          />
        </Box>
      ) : errorMsg.length > 0 ? (
        <Box style={{ minHeight: "70vh" }}>
          <Typography variant="h2" className={classes.errorText}>
            {errorMsg}
          </Typography>
        </Box>
      ) : (
        <Box style={{ minHeight: "70vh" }}>
          <Typography variant="h5">No Data Found !</Typography>
        </Box>
      )}
    </>
  );
};

export default AdminManagement;

import { Container, Grid, Typography } from "@material-ui/core";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useQuery } from "@apollo/client";
import { Link } from "react-router-dom";

import { labels } from "_mocks/permissonLabels";
import { Loader } from "Components/TableLoader/index";
import { VIEW_ROLE } from "graphql/query/admin";
import Switch from "../Switch/Switch";
import { useStyles } from "../AdminDetails/AdminDetailsStyle";

const ViewRole = () => {
  const classes = useStyles();
  const [errorMsg, setErrorMsg] = useState("");
  const { state } = useLocation();
  const { id = "" } = state || "";
  const { data, loading, error } = useQuery(VIEW_ROLE, {
    variables: {
      roleId: id,
    },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (state === null) setErrorMsg("No role exists !");
  }, [state]);

  if (loading) {
    return <Loader />;
  }

  if (error || errorMsg.length > 0) {
    return (
      <Container
        maxWidth={false}
        disableGutters
        className={classes.roleContainer}
      >
        <Typography variant="subtitle1" className={classes.error}>
          Something Went Wrong !
        </Typography>
      </Container>
    );
  }
  return (
    <Container
      maxWidth={false}
      disableGutters
      className={classes.roleContainer}
    >
      <Typography component="span" className={classes.path}>
        <Link to="/admin/administrator" className={classes.link}>
          Admin
        </Link>
        &gt;
        <Typography component="span" className={classes.cursorPointer}>
          {" "}
          View Role{" "}
        </Typography>
      </Typography>
      <Grid container className={classes.profileHeadContainer}>
        <Grid lg={8} md={12} xs={12} item>
          <Grid container>
            <Grid lg={12} md={12} sm={12} item>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  height: "100%",
                  marginTop: "-20px",
                }}
              >
                <table className="profileInfo">
                  <tbody>
                    <tr>
                      <td>Name</td>
                      <td>{data.role.name}</td>
                    </tr>
                    <tr>
                      <td>Created By</td>
                      <td>{data.role.createdBy.fullName}</td>
                    </tr>
                    <tr>
                      <td>Created Date</td>
                      <td>
                        {moment(data.role.createdAt).format(
                          "MMMM Do YYYY, h:mm:ss a"
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Grid>
          </Grid>
        </Grid>
        <Grid lg={2} item />
      </Grid>
      {data?.role?.permissions &&
        typeof data.role.permissions === "object" &&
        Object.entries(data.role.permissions).map(([key, value]) => {
          if (value && value.label) {
            return (
              <Switch
                key={key + value.label}
                value={value}
                permissionLabel={labels[key]}
                permissionName={key}
                componentName="Role"
              />
            );
          }
          return null;
        })}
    </Container>
  );
};
export default ViewRole;

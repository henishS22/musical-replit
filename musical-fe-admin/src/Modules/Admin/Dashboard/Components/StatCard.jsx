import React from "react";
import Icon from "@material-ui/core/Icon";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { GET_DASHBOARD_DATA } from "graphql/query/admin";
import { useQuery } from "@apollo/client";

import ArrowUp from "Assets/Svg/arrowUp.svg";
import ArrowDown from "Assets/Svg/arrowDown.svg";
import { statCardStyles } from "../dashboardStyles";
import FolderOpenIcon from "@material-ui/icons/FolderOpen";
import MusicVideoOutlinedIcon from "@material-ui/icons/MusicVideoOutlined";
import SubsIcon from "Assets/Svg/Capa_1.svg";
import GdriveIcon from "Assets/Svg/g1392.svg";
import DropBoxIcon from "Assets/Svg/Vector (1).png";
import PersonOutlineOutlinedIcon from "@material-ui/icons/PersonOutlineOutlined";
import IpfsStorageIcon from "Assets/Svg/ipfs.svg";

export default function SpacingGrid({ setGraphType }) {
  const { data } = useQuery(GET_DASHBOARD_DATA, {
    variables: { tab: "privacyPolicy" },
    fetchPolicy: "network-only",
  });

  const stats = [
    {
      icon: PersonOutlineOutlinedIcon,
      numCount: data?.dashboard?.userdata || "0",
      // perCount: '25',
      title: "Total No. of Users",
      color: "#D7FFF2",
      growth: true,
    },
    {
      // icon: Icon4,
      icon: FolderOpenIcon,
      numCount: data?.dashboard?.projectData || "0",
      // perCount: '25',
      title: "Total No. of Project",
      color: "#F4FF77",
      growth: true,
    },
    {
      icon: MusicVideoOutlinedIcon,
      numCount: data?.dashboard?.trackData || "0",
      perCount: "25",
      title: "Number of Music Crated",
      subtitle: "60,000 USDT",
      color: "#FFDBDF",
      growth: true,
    },
    {
      icon: SubsIcon,
      numCount: data?.dashboard?.subscription || "0",
      perCount: "25%",
      title: "Total Number of Subscription",
      subtitle: "10,000 USDT",
      color: "#D8FFB1",
      growth: true,
    },
    {
      icon: GdriveIcon,
      numCount: data?.dashboard?.driveStorage?.toFixed(4) || "0",
      // perCount: '25',
      title: "Storage Occupied G-Drive",
      color: "#ccccff",
      growth: true,
    },
  ];

  const classes = statCardStyles();
  return (
    <Grid
      container
      className={`${classes.root} ${classes.mainGrid}`}
      spacing={0}
    >
      <Grid item className={`${classes.wrapper}`}>
        <Grid container item lg={12} spacing={2}>
          {stats?.map((value) => (
            <Grid key={value.color} item lg={3}>
              <Paper
                className={classes.paper}
                style={{
                  backgroundColor: `${value.color}`,
                  borderRadius: "6px",
                }}
              >
                <Grid item className={classes.iconBox}>
                  <Typography
                    className={`${classes.icon} ${classes.backgroundTransparent}`}
                  >
                    <Icon>
                      {/* <img alt="imageAlt" src={value.icon} /> */}
                      {typeof value.icon === "string" ? (
                        <img alt="imageAlt" src={value.icon} />
                      ) : (
                        <value.icon />
                      )}
                    </Icon>
                  </Typography>
                </Grid>
                <Grid item>
                  {value.numCount ? (
                    <Grid
                      item
                      className={`${classes.dataBox} ${classes.dFlex}`}
                    >
                      {/* { value.subtitle && <Typography>{value.subtitle}</Typography> } */}
                      <Grid item>
                        <Paper className={classes.dataValues}>
                          {value.numCount}
                        </Paper>
                      </Grid>
                      {value?.showCount && (
                        <Grid item className={classes.dataGrid}>
                          {value.growth ? (
                            <Paper
                              className={`${classes.percantageValues} ${classes.perBox}`}
                            >
                              <Icon className={classes.perIcon}>
                                <img alt="imageAlt" src={ArrowUp} />
                              </Icon>
                              <Typography className={classes.arrow}>
                                {value?.perCount}%
                              </Typography>
                            </Paper>
                          ) : (
                            <Paper
                              className={`${classes.percantageValues} ${classes.negPerBox}`}
                            >
                              <Icon className={classes.negPerIcon}>
                                <img alt="imageAlt" src={ArrowDown} />
                              </Icon>
                              <Typography className={classes.arrow}>
                                {value.perCount}%
                              </Typography>
                            </Paper>
                          )}
                        </Grid>
                      )}
                    </Grid>
                  ) : (
                    <Grid item className={classes.mTop35}>
                      <Paper className={classes.dataValues}>
                        {value.perCount}%
                      </Paper>
                    </Grid>
                  )}
                  <Typography className={classes.titleBox}>
                    {value.title}
                  </Typography>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}

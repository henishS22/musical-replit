/* eslint-disable import/prefer-default-export */
import { makeStyles } from "@material-ui/core/styles";

const topBarStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: "25px",
    marginLeft: "20px",
    // marginBottom: '20px',
  },
  root1: {
    flexGrow: 1,
    marginTop: "25px",
    marginLeft: "0px !important",
  },
  positionRelative: {
    position: "relative",
  },
  dFlex1: {
    display: "flex",
    justifyContent: "flex-start",
  },
  button: {
    width: "auto",
    height: "40px",
    marginRight: "20px",
    background: `linear-gradient(175.57deg, #1db653 3.76%, #0e5828 96.59%)`,
    border: "none",
    fontStyle: "normal",
    color: "white",
    marginLeft: "15px",
    fontWeight: 450,
    fontSize: "14px",
    [theme.breakpoints.down("md")]: {
      width: "120px",
      padding: "10px 10px",
      fontSize: "10px",
    },
  },
  closeBtn: {
    marginTop: "2px",
    marginLeft: "10px",
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  dFlex: {
    display: "flex",
    justifyContent: "flex-end",
  },
}));

export { topBarStyles };

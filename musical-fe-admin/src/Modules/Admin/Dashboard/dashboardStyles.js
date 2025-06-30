/* eslint-disable object-curly-newline */
import { makeStyles } from "@material-ui/core/styles";

const requestStyles = makeStyles((theme) => ({
  pLeft: {
    paddingLeft: "15px",
  },
  header: {
    marginLeft: "0px",
    marginTop: "30px !important",
    fontWeight: 550,
    fontSize: "24px",
    marginBottom: "20px !important",
    color: "#000000",
  },
  mBottom: {
    marginBottom: "20px",
  },
  dFlex: {
    display: "flex",
    width: "100%",
  },
  w85: {
    width: "85%",
  },
  button: {
    width: "86px",
    height: "30px",
    backgroundColor: "black !important",
    color: "white !important",
    marginTop: "20px",
    fontStyle: "normal",
    marginLeft: "0px",
    fontWeight: 450,
    fontSize: "15px",
  },
  subContent: {
    fontWeight: 550,
    marginBottom: "10px !important",
    fontSize: "16px",
    color: "#000000",
  },
  content: {
    fontWeight: 550,
    fontSize: "14px",
    color: "#000000",
    opacity: 0.5,
    fontStyle: "normal",
    lineHeight: "20px",
  },
  time: {
    fontWeight: 550,
    fontSize: "14px",
    color: "#000000",
    opacity: 0.5,
  },
  timeStamp: {
    width: "15%",
    textAlign: "right",
    paddingRight: "0px",
    [theme.breakpoints.up("md")]: {
      paddingLeft: "50px",
    },
  },
}));

const statCardStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    minWidth: "260px",
    height: "124px",
    padding: "10px 25px",
    position: "relative",
    boxShadow: "none !important",
  },
  wrapper: {
    width: "100%",
  },
  control: {
    padding: theme.spacing(2),
  },
  icon: {
    position: "absolute",
    width: "16px",
    height: "14px",
    fontSize: "10px",
  },
  iconBox: {
    position: "absolute",
    width: "34px",
    height: "34px",
    paddingTop: "0px",
    cursor: "pointer",
    paddingLeft: "9px",
    right: 10,
    // background: 'rgba(0, 0, 0, 0.08)',
    borderRadius: "25px",
  },
  dataBox: {
    position: "absolute",
    top: "41px",
  },
  dataValues: {
    background: "transparent",
    color: "#000000",
    fontStyle: "normal",
    fontWeight: 550,
    fontSize: "25px",
    lineHeight: "51px",
    border: "none",
    boxShadow: "none",
    textDecoration: "none !important",
  },
  percantageValues: {
    background: "transparent",
    color: "#000000",
    fontStyle: "normal",
    fontWeight: 550,
    fontSize: "14px",
    lineHeight: "18px",
    border: "none",
    marginTop: "10px !important",
    boxShadow: "none",
  },
  noTextDecoration: {
    textDecoration: "none !important",
  },
  arrow: {
    fontStyle: "normal",
    fontWeight: 550,
    marginTop: "-22px",
    marginLeft: "17px",
    fontSize: "14px",
  },
  mainGrid: {
    marginTop: "15px",
    marginLeft: "15px",
  },
  justifySpaceAround: {
    justifyContent: "space-around",
  },
  backgroundTransparent: {
    backgroundColor: "transparent",
  },
  dFlex: {
    display: "flex",
  },
  dataGrid: {
    marginTop: "5px",
    marginLeft: "10px",
  },
  perBox: {
    color: "#16D194",
    fontWeight: "800",
  },
  perIcon: {
    fontSize: "15px",
    fontWeight: "1000",
  },
  negPerBox: {
    color: "red",
    fontWeight: "800",
  },
  negPerIcon: {
    marginRight: "5px",
    fontSize: "15px",
    fontWeight: "1000",
  },
  mTop35: {
    marginTop: "35px",
  },
  titleBox: {
    position: "absolute",
    background: "transparent",
    bottom: "15px",
    fontStyle: "normal",
    fontWeight: 550,
    color: "#000000",
    fontSize: "14px",
    boxShadow: "none",
  },
}));

const topBarStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: 120,
    position: "relative",
    padding: "0px",
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  mainDiv: {
    display: "flex !important",
    placeContent: "flex-end !important",
    padding: "0px 0px",
    marginTop: "-10px",
  },
  dropDown: {
    fontStyle: "normal",
    fontWeight: 550,
    color: "black",
    fontSize: "13px",
  },
  selectTag: {
    height: "40px",
    width: "125px",
    boxSizing: "border-box",
    borderRadius: "4px",
  },
  dropdownStyle: {
    marginTop: "46px",
  },
  loopIcon: {
    marginRight: "10px",
  },
  iconMore: {
    fontWeight: "400 ! important",
    marginRight: "5px",
  },
  loopText: {
    fontSize: "13px",
  },
  button: {
    width: "147px",
    height: "40px",
    background: `linear-gradient(175.57deg, #1db653 3.76%, #0e5828 96.59%)`,
    fontStyle: "normal",
    marginLeft: "15px",
    fontWeight: 450,
    fontSize: "15px",
  },
}));

const mainStyles = makeStyles(() => ({
  box: {
    paddingRight: "20px",
    minHeight: "100vh",
  },
}));

export { requestStyles, statCardStyles, topBarStyles, mainStyles };

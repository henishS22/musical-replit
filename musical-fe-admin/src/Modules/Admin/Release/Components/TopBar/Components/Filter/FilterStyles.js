/* eslint-disable import/prefer-default-export */
import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  typography: {
    padding: theme.spacing(2),
  },
  closeBtn: {
    position: "absolute",
    right: "5px",
    top: "5px",
    cursor: "pointer",
  },
  topBar: {
    position: "relative",
  },
  filterButton: {
    background: "white",
    boxShadow: "none",
    width: "150px",
    height: "40px",
    border: "1px solid #CCCCCC",
  },
  filterText: {
    fontSize: "14px",
    fontWeight: "550",
    marginRight: "30px",
  },
  popUp: {
    left: "260px",
    width: "355px",
    height: "380px",
    padding: "20px 20px",
  },
  popUp1: {
    left: "260px",
    width: "350px",
    maxWidth: "350px !important",
    height: "297px",
    padding: "15px",
  },
  popUp2: {
    left: "260px",
    width: "350px",
    maxWidth: "350px !important",
    padding: "15px",
  },

  popUp3: {
    maxWidth: "350px !important",
    marginTop: "7px",
    // backgroundColor: 'blue',
    // padding: '20px 35px 20px 20px',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 140,
    minHeight: 50,
  },
  inputLabel: {
    fontSize: "14px",
    color: "#606060",
    // fontFamily: 'Avenir LTStd-Book',
  },
  iconMore: {
    fontSize: "15px",
    display: "none !important",
    fontWeight: "bold",
  },
  selectTag: {
    background: "rgba(0, 0, 0, 0.02)",
    // border: '1px solid #CCCCCC',
    borderRadius: "4px",
    // paddingRight: '10px',
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  width100: {
    width: "100%",
  },
  width93: {
    width: "93%",
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 140,
    border: "1px solid #CCCCCC",
    borderRadius: "5px",
    marginBottom: theme.spacing(2),
    marginTop: "-7px",
    background: "rgba(0, 0, 0, 0.02)",
  },
  displayFlex: {
    display: "flex",
    flexDirection: "row",
  },
  dropdownStyle: {
    marginTop: "46px",
  },
  buttonReset: {
    width: "135px",
    height: "40px",
    backgroundColor: "transperent",
    fontStyle: "normal",
    fontWeight: 550,
    fontSize: "14px",
    color: "black",
    marginLeft: "8px",
    marginBottom: "8px",
    marginTop: "5px",
  },
  buttonApply: {
    width: "135px",
    height: "40px",
    background: `linear-gradient(175.57deg, #1db653 3.76%, #0e5828 96.59%)`,
    border: "none",
    fontStyle: "normal",
    marginLeft: "15px",
    fontWeight: 550,
    fontSize: "14px",
    marginBottom: "8px",
    marginTop: "5px",
  },
}));

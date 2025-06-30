/* eslint-disable import/prefer-default-export */
/* eslint-disable linebreak-style */
import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles({
  app: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100vh",
  },
  loginBox: {
    width: "25%",
    height: "auto",
    // border: '1px solid black',
    display: "inherit",
  },
  loginBox1: {
    height: "auto",
    width: "450px",
  },
  heading1: {
    fontSize: "40px",
    fontWeight: "bold",
    fontFamily: "Tomica",
    fontStyle: "normal",
    lineHeight: "51px",
    alignItems: "left",
  },
  heading2: {
    fontSize: "20px",
    // fontWeight: 'bold',
    fontFamily: "Tomica",
    fontStyle: "normal",
    lineHeight: "51px",
    marginLeft: "10px",
    paddingTop: "2px",
  },
  error: {
    fontSize: "16px",
    // fontWeight: 'bold',
    // fontFamily: 'Circular Std',
    fontStyle: "normal",
    lineHeight: "51px",
    color: "red",
    fontWeight: "bold",
    marginLeft: "10px",
    marginTop: "-10px",
  },
  heading3: {
    fontSize: "28px",
    fontWeight: "bold",
    // fontFamily: 'Circular Std',
    fontStyle: "normal",
    lineHeight: "51px",
  },
  heading4: {
    fontSize: "18px",
    fontWeight: "bold",
    // fontFamily: 'Circular Std',
    fontStyle: "normal",
    lineHeight: "28px",
    marginTop: "2vh",
    marginBottom: "3vh",
  },
  displayFlex: {
    display: "flex",
  },
  width100: {
    width: "100%",
  },
  loginForm: {
    paddingTop: "10px",
    width: "100%",
  },
  inputHeight: {
    "& input": {
      height: "1vh",
    },
    "&::placeholder": {
      color: "#ffff",
      lineHeight: "18px",
      fontWeight: "540",
      fontSize: "14px",
      opacity: 1,
    },
  },
  marginTop: {
    marginTop: "20px",
  },
  loginBtn: {
    top: "20px",
    color: "white",
    height: "40px",
    background: `linear-gradient(175.57deg, #1db653 3.76%, #0e5828 96.59%)`,
  },
  otpInput: {
    marginRight: "25px",
    height: "40px",
    width: "46px !important",
    marginTop: "20px",
    border: "1px solid #CCCCCC",
    borderRadius: "4px",
  },
  errorText: {
    color: "red",
    marginTop: "1vh",
    marginBottom: "-2vh",
  },
  placeHolder: {
    "&::placeholder": {
      color: "#606060",
      lineHeight: "18px",
      fontWeight: "540",
      fontSize: "14px",
      opacity: 1,
    },
  },
  "@media screen and (max-width: 768px)": {
    loginBox: {
      width: "85%",
    },
    otpInput: {
      marginRight: "20px",
      height: "2.9em",
      width: "3em !important",
      marginTop: "20px",
    },
  },
  "@media screen and (max-width: 1024px)": {
    loginBox1: {
      padding: "30px",
    },
    otpInput: {
      marginRight: "20px",
      height: "3em",
      width: "2.4em !important",
      marginTop: "20px",
    },
  },
  "@media screen and (width: 768px)": {
    otpInput: {
      marginRight: "20px",
      height: "3em",
      width: "2.9em !important",
      marginTop: "20px",
    },
  },
});

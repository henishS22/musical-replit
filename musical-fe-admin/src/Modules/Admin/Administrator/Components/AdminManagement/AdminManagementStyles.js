import { makeStyles } from "@material-ui/core/styles";

const formStyles = makeStyles(() => ({
  formBox: {
    display: "flex",
    flexDirection: "column",
  },
  errorText: {
    fontSize: "16px",
    fontStyle: "normal",
    lineHeight: "51px",
    color: "red",
    fontWeight: "bold",
    marginLeft: "0px",
    marginTop: "0px",
    marginBottom: "0px",
  },
  icon: {
    marginRight: 5,
  },
  width100: {
    width: "100%",
    backgroundColor: "#E5E5E5",
    marginTop: "25px !important",
    height: "40px",
    padding: "0px !important",
  },
  height35: {
    width: "100%",
    backgroundColor: "#E5E5E5",
    marginTop: "25px !important",
    height: "35px",
    padding: "0px !important",
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
  formControl: {
    width: "100%",
    padding: "0px !important",
  },
  selectLabel: {
    fontSize: "14px",
    color: "#606060",
  },
  selectLabel1: {
    marginTop: "-8px",
    color: "white !important",
  },
  colorWhite: {
    color: "white !important",
  },
  dFlex: {
    display: "flex",
  },
  darkBack: {
    backgroundColor: "black",
    color: "white !important",
  },
  inputHeight: {
    backgroundColor: "#E5E5E5",
    height: "40px",
    borderRadius: "4px",
    fontWeight: "550 !important",
    color: "black",
    fontSize: "14px",
    "&::placeholder": {
      textOverflow: "ellipsis !important",
      color: "red !important",
    },
  },
  inputHeight2: {
    backgroundColor: "#E5E5E5",
    height: "40px",
    borderRadius: "4px",
    fontWeight: "550 !important",
    color: "#606060",
    fontSize: "14px",
    "&::placeholder": {
      textOverflow: "ellipsis !important",
      color: "red !important",
    },
  },
  inputHeight1: {
    backgroundColor: "#E5E5E5",
    height: "40px",
    borderRadius: "4px",
    fontWeight: "550 !important",
    color: "black",
    fontSize: "14px",
    borderTopLeftRadius: "0px !important",
    borderBottomLeftRadius: "0px !important",
    marginLeft: "-3px",
    "&::placeholder": {
      textOverflow: "ellipsis !important",
      color: "black !important",
    },
  },
  permissonTitle: {
    fontSize: "18px",
    fontWeight: "550",
    marginTop: "20px !important",
    marginBottom: "0px",
  },
  roleTitle: {
    fontSize: "16px",
    fontWeight: "550",
    marginBottom: "20px",
  },
  roleBtnHeader: {
    fontSize: "14px",
    fontWeight: "550",
    marginBottom: "20px",
    marginLeft: "10px",
    marginRight: "20px",
  },
  submitBtn: {
    height: "40px",
    background: `linear-gradient(175.57deg, #1db653 3.76%, #0e5828 96.59%)`,
    margin: "30px 10px",
  },
  loadingText: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "16px",
    fontWeight: "550",
    height: "300px",
    margin: "auto",
    color: "black",
    textAlign: "center",
  },
}));

// eslint-disable-next-line import/prefer-default-export
export { formStyles };

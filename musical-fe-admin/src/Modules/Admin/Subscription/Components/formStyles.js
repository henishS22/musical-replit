/* eslint-disable import/prefer-default-export */
import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  onHover: {
    cursor: "pointer",
  },
  dialogPaper1: {
    minHeight: "500px",
    maxHeight: "700px",
    maxWidth: "500px",
    minWidth: "500px",
    borderRadius: "15px !important",
    [theme.breakpoints.down("xs")]: {
      minHeight: "400px",
      maxHeight: "600px",
      maxWidth: "400px",
      minWidth: "400px",
    },
  },
  dialogContext: {
    padding: "0px !important",
  },
  closeBtn: {
    position: "absolute",
    right: "25px",
    top: "25px",
  },
  //   topBar: {
  //     display: "flex",
  //     justifyContent: "center",
  //     height: "70px",
  //     borderBottom: "1px solid #00000026",
  //     alignItems: "center",
  //   },
  topBar: {
    position: "sticky",
    top: 0,
    backgroundColor: "white",
    zIndex: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderBottom: "1px solid #ccc",
  },
  title: {
    fontWeight: "bold",
    fontSize: "24px",
  },
  paddingTopForm: {
    paddingTop: "10px",
  },
  textField: {
    marginBottom: "20px",
    "& input": {
      padding: "10px",
      fontSize: "16px",
      alignItems: "center",
    },
    "& input:focus": {
      paddingBottom: "10px",
    },
    "& input::placeholder": {
      padding: "10px",
    },
    "& input:label": {
      padding: "10px",
    },
  },
  textFieldFeature: {
    marginBottom: "10px",
    "& input": {
      padding: "10px",
      fontSize: "16px",
      alignItems: "center",
    },
    "& input:focus": {
      paddingBottom: "10px",
    },
    "& input::placeholder": {
      padding: "10px",
    },
    "& input:label": {
      padding: "10px",
    },
  },
  radioCon: {
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
    justifyContent: "start",
    marginBottom: "20px",
  },
  radioGroup: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  radioChecked: {
    color: "#0e5828 !important",
    "& .MuiSvgIcon-root": {
      fontSize: 28,
    },
  },
  radio: {
    color: "grey !important",
    "& .MuiSvgIcon-root": {
      fontSize: 28,
    },
  },
  radioFeature: {
    color: "grey !important",
  },
  radioFeatureSelected: {
    color: "#0e5828 !important",
  },
  checkboxFeature: {
    color: "grey !important",
  },
  checkboxFeatureSelected: {
    color: "#0e5828 !important",
  },
  btnSub: {
    background: `linear-gradient(175.57deg, #1db653 3.76%, #0e5828 96.59%)`,
    border: "none",
    color: "white",
    fontWeight: "550",
    fontSize: "16px",
    width: "155px",
    height: "40px",
    boxShadow: "none",
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  formContent: {
    flex: 1,
    overflowY: "auto",
    padding: theme.spacing(3),
  },
  error: {
    color: "red",
    fontSize: "12px",
    margin: "5px 0px 0px 12px",
  },
}));

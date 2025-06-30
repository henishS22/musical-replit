import { makeStyles } from "@material-ui/core/styles";

const formStyles = makeStyles(() => ({
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
  mainContainer: {
    minHeight: "70vh",
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

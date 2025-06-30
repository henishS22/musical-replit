import { makeStyles } from "@material-ui/core/styles";

const tabStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    paddingRight: "0px",
  },
  paddingAll: {
    padding: "0px 20px",
  },
  tabBar: {
    boxShadow: "none !important",
    paddingLeft: "15px",
    backgroundColor: "white !important",
  },
  tabBox: {
    backgroundColor: "white !important",
    color: "black",
    borderBottom: "1px solid grey !important",
  },
  tabValue: {
    fontStyle: "normal",
    fontWeight: 550,
    fontSize: "19px",
    padding: "10px 30px",
    minWidth: "180px",
    textTransform: "none",
  },
  headBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0px",
    width: "100%",
  },
  headingText: {
    fontStyle: "normal",
    fontWeight: 550,
    fontSize: "20px",
    padding: "10px 0px",
    textTransform: "none",
  },
}));

// eslint-disable-next-line import/prefer-default-export
export { tabStyles };

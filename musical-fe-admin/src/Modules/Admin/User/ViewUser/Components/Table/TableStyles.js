import { makeStyles } from "@material-ui/core/styles";

const tabStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    paddingRight: "0px",
  },
  paddingAll: {
    padding: "0px 20px",
  },
  projectlisttable: {
    maxHeight: "500px",
    overflowY: "scroll",
    scrollbarWidth: "thin",
  },
}));

// eslint-disable-next-line import/prefer-default-export
export { tabStyles };

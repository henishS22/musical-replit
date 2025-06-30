import { makeStyles } from "@material-ui/core/styles";

const selectedStyles = makeStyles((theme) => ({
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
}));

// eslint-disable-next-line import/prefer-default-export
export { selectedStyles };

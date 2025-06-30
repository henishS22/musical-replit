/* eslint-disable import/prefer-default-export */
import { makeStyles } from "@material-ui/core/styles";

const buttonStyles = makeStyles((theme) => ({
  button: {
    width: "180px",
    height: "40px",
    marginRight: "20px",
    background: `linear-gradient(175.57deg, #1db653 3.76%, #0e5828 96.59%)`,
    border: "none",
    fontStyle: "normal",
    marginLeft: "15px",
    fontWeight: 450,
    fontSize: "15px",
    [theme.breakpoints.down("md")]: {
      width: "120px",
      padding: "10px 10px",
      fontSize: "10px",
    },
  },
}));

export { buttonStyles };

import React from "react";
import Button from "@material-ui/core/Button";
import { buttonStyles } from "./ButtonStyles";

// eslint-disable-next-line react/prop-types
export default function Button1({ onButtonClick, para, title }) {
  const classes = buttonStyles();
  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={() => onButtonClick(para)}
        className={classes.button}
      >
        {title}
      </Button>
    </div>
  );
}

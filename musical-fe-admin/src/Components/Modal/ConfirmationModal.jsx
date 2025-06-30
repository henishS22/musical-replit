/* eslint-disable react/prop-types */
import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import Box from "@material-ui/core/Box";
import { Button, CircularProgress, Grid, Typography } from "@material-ui/core";
import { useStyles } from "./ModalStyles";
import { ReactComponent as CloseIcon } from "../../Assets/Svg/close.svg";

const ConfirmationModal = ({
  open,
  handleClose,
  subtitle,
  heading,
  button1,
  button2,
  onButton1Click,
  onButton2Click,
  isLoading,
}) => {
  const classes = useStyles();
  return (
    <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="sm"
      classes={{ paper: classes.dialogPaper1 }}
    >
      <DialogContent classes={{ root: classes.dialogContext }}>
        <div
          role="button"
          tabIndex={0}
          onKeyDown={handleClose}
          onClick={handleClose}
          className={classes.topBar}
        >
          <span className={classes.title}>{heading}</span>
          <span className={`${classes.onHover} ${classes.closeBtn}`}>
            <CloseIcon />
          </span>
        </div>
        <Box id="alert-dialog-description">
          <Grid item style={{ marginTop: "4vh", padding: "0px 30px" }}>
            <Typography
              variant="body1"
              align="center"
              className={classes.subtitle}
            >
              {subtitle}
            </Typography>
          </Grid>
          <Grid
            item
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              marginTop: "4vh",
              marginBottom: "40px",
            }}
          >
            <Button
              variant="contained"
              size="small"
              className="confirmationModalButton1"
              style={{
                width: "155px",
                height: "40px",
                fontWeight: "550",
                color: "black",
                boxShadow: "none",
                fontSize: "14px",
              }}
              onClick={() => onButton1Click()}
            >
              {button1}
            </Button>
            <Button
              variant="contained"
              size="small"
              className="confirmationModalButton2"
              style={{
                width: "155px",
                height: "40px",
                fontWeight: "550",
                boxShadow: "none",
                fontSize: "14px",
                background: `linear-gradient(175.57deg, #1db653 3.76%, #0e5828 96.59%)`,
                color: "white",
              }}
              onClick={(e) => onButton2Click(e)}
            >
              {isLoading && (
                <CircularProgress
                  style={{
                    width: "20px",
                    height: "20px",
                    color: "#fff",
                    marginRight: "10px",
                  }}
                />
              )}
              {button2}
            </Button>
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
export default ConfirmationModal;

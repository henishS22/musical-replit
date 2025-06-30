/* eslint-disable react/prop-types */
import React from "react";
import { Dialog, DialogContent } from "@material-ui/core";

import { ReactComponent as CloseIcon } from "Assets/Svg/close.svg";
import EditPlatform from "./EditPlatformVariable";
import { useStyles } from "./ModalStyles";
import "./styles.scss";

const EditPlatformModal = ({
  open,
  handleClose,
  editId,
  heading,
  handleOnEditSuccess,
  variables,
  flag
}) => {
  const classes = useStyles();

  return (
    <>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
        classes={{ paper: classes.dialogPaper5 }}
      >
        <DialogContent classes={{ root: classes.dialogContext1 }}>
          <div
            role="button"
            tabIndex={0}
            onKeyDown={() => {
              handleClose();
            }}
            onClick={() => {
              handleClose();
            }}
            className={classes.topBar2}
          >
            <span className={classes.title1}>{heading}</span>
            <span className={`${classes.onHover} ${classes.closeBtn1}`}>
              <CloseIcon />
            </span>
          </div>
          <EditPlatform
            editId={editId}
            handleClose={handleClose}
            handleOnEditSuccess={handleOnEditSuccess}
            variables={variables}
            flag={flag}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
export default EditPlatformModal;

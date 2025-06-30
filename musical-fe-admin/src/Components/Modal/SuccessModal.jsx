/* eslint-disable react/prop-types */
import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Box from '@material-ui/core/Box';
import { Button, Grid, Typography } from '@material-ui/core';
import { useStyles } from './ModalStyles';
import SuccessIcon from '../../Assets/Svg/successIcon.svg';
import SuccessIcon2 from '../../Assets/Svg/successIcon2.svg';
import { ReactComponent as CloseIcon } from '../../Assets/Svg/close.svg';

const SuccessModal = ({
  open, handleClose, heading, subtitle, type, hasButton, buttonTitle, onButtonClick,
}) => {
  const classes = useStyles();

  return (
    <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="sm"
      classes={{ paper: classes.dialogPaper }}
    >
      <DialogContent>
        <div
          role="button"
          tabIndex={0}
          onKeyDown={handleClose}
          onClick={handleClose}
          className={classes.closeButton}
        >
          <span className={`${classes.onHover} ${classes.closeBtn}`}><CloseIcon /></span>
        </div>
        <Box id="alert-dialog-description">
          <Grid item>
            <img src={type === 'delete' ? SuccessIcon2 : SuccessIcon} alt="no" className={type === 'delete' ? classes.img2 : classes.img} />
          </Grid>
          <Grid item>
            <Typography variant="h6" align="center" className={classes.heading}>
              {heading}
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body1" align="center" className={classes.subtitle}>
              {subtitle}
            </Typography>
          </Grid>
          {hasButton
            && (
            <Grid item style={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={(e) => onButtonClick(e)}
              >
                {buttonTitle}
              </Button>
            </Grid>
            )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
export default SuccessModal;

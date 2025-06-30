/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import {
  Button, CircularProgress, Grid, Typography,
} from '@material-ui/core';
import OtpInput from 'react-otp-input';
import { useStyles } from './ModalStyles';
import { ReactComponent as CloseIcon } from '../../Assets/Svg/close.svg';
import './styles.scss';
// eslint-disable-next-line no-unused-vars

const CreateProfileOTPVerificationModal = ({
  open,
  handleClose,
  heading,
  button1,
}) => {
  const classes = useStyles();
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = React.useState(false);
  const [otp, setOTP] = useState('');
  const [error, setError] = useState('');

  const handleChange = (otpString) => {
    setOTP(otpString);
  };

  const handleSubmit = () => {
    setError('');
    if (otp.length < 6) setError('Please Enter Valid OTP');
    else {
      setLoading(true);
    }
  };

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
          <span className={`${classes.onHover} ${classes.closeBtn}`}><CloseIcon /></span>
        </div>
        <DialogContentText id="alert-dialog-description">
          <Grid container style={{ marginTop: '5vh' }}>
            <Grid item xs={1} sm={2} md={2} xl={2} />
            <Grid item xs={10} sm={8} md={8} xl={8}>
              <OtpInput
                value={otp}
                onChange={handleChange}
                numInputs={6}
                separator={false}
                inputStyle={classes.otpInput}
              />
            </Grid>
            <Grid item xs={1} sm={2} md={2} xl={2} />

          </Grid>
          {error.length > 0 && <Typography variant="subtitle1" className={classes.errorText}>{error}</Typography> }
          <Grid
            item
            style={{
              display: 'flex', justifyContent: 'space-evenly', marginTop: '4vh', marginBottom: '40px',
            }}
          >
            <Button
              variant="contained"
              size="small"
              style={{
                width: '155px', height: '40px', fontWeight: '550', color: 'black', boxShadow: 'none', fontSize: '14px',
              }}
              type="submit"
              onClick={() => handleSubmit()}
              className={classes.sendButton}
            >
              { loading && <CircularProgress size={20} style={{ color: 'white' }} />}
              { !loading && button1 }
            </Button>
          </Grid>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
};
export default CreateProfileOTPVerificationModal;

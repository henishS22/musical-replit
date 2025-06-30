/* eslint-disable react/prop-types */
import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
// import Box from '@material-ui/core/Box';
import { Button, DialogActions, DialogContentText, DialogTitle, Grid, Typography } from '@material-ui/core';
// import { useStyles } from './ModalStyles';
// import SuccessIcon from '../../Assets/Svg/successIcon.svg';
// import SuccessIcon2 from '../../Assets/Svg/successIcon2.svg';
// import { ReactComponent as CloseIcon } from '../../Assets/Svg/close.svg';

const SwitchNetwork = ({
  open, handleClose,switchNetwork,isSwitching
}) => {
//   const classes = useStyles();

  return (
    <Dialog open={open} onClose={handleClose}>
    <DialogTitle>Switch Network</DialogTitle>
    <DialogContent>
      <DialogContentText>
        To continue, please switch to the Lydia network.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose} color="primary" disabled={isSwitching}>
        Cancel
      </Button>
      <Button
        onClick={()=> switchNetwork('0x1cbc67c1e6')}
        color="secondary"
        variant="contained"
        disabled={isSwitching}
      >
        {isSwitching ? "Switching..." : "Switch Network"}
      </Button>
    </DialogActions>
  </Dialog>
  );
};
export default SwitchNetwork;

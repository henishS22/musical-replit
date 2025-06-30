/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import Box from "@material-ui/core/Box";
import { Grid, Typography } from "@material-ui/core";
import { useStyles } from "./ModalStyles";
import { ReactComponent as CloseIcon } from "../../Assets/Svg/close.svg";

const ViewNomineeStatus = ({ open, handleClose, data, accountId }) => {
  const classes = useStyles();
  const [nomineeList, setNomineesList] = useState([]);

  const filterNomineesById = (data, accountId) => {
    const account = data?.account?.edges.find(
      (account) => account.node._id === accountId
    );
    if (!account) {
      return `Account with ID ${accountId} not found.`;
    }
    const nomineeDetails = account?.node?.nominee.map((nominee, idx) => ({
      [`Nominee ${idx + 1}`]: {
        Name: nominee.name,
        WalletAddress: nominee.walletAddress,
        Email: nominee.email,
        Status: nominee.status,
        Relation: nominee.relation,
      },
    }));
    setNomineesList(nomineeDetails);
  };

  useEffect(() => {
    if (accountId) {
      filterNomineesById(data, accountId);
    }
  }, [accountId]);

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
          <span className={`${classes.onHover} ${classes.closeBtn}`}>
            <CloseIcon />
          </span>
        </div>
        <Box id="alert-dialog-description">
          <Grid item></Grid>
          <Grid item>
            {nomineeList?.map((nominee, index) => {
              const nomineeKey = `Nominee ${index + 1}`;
              const nomineeDetails = nominee[nomineeKey];
              return (
                <>
                  <Typography className={classes.heading}>
                    {nomineeKey}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    Name: {nomineeDetails?.Name}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    Status:{" "}
                    {nomineeDetails?.Status
                      ? nomineeDetails.Status.charAt(0).toUpperCase() +
                        nomineeDetails.Status.slice(1)
                      : ""}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    Relationship: {nomineeDetails?.Relation}
                  </Typography>
                </>
              );
            })}
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
export default ViewNomineeStatus;

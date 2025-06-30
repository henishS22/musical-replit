/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import {
  Button, CircularProgress, Grid, TextField, Dialog, DialogContent, Box, FormControl,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
} from '@material-ui/core';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useMutation } from '@apollo/client';
import mobileCode from '../../contracts/CountryCode.json'
import { UPDATE_NUMBER } from '../../graphql/mutation/admin';
import OtpModal from './VerifyOtp';
import { useStyles } from './ModalStyles';
import { ReactComponent as CloseIcon } from '../../Assets/Svg/close.svg';
import './styles.scss';

const validationSchema = yup.object({
  mobile: yup
    .string()
    .required('Mobile number is required')
    .matches(/^[0-9]+$/, 'Must be only digits'),
  countryCode: yup
    .string('Select the Country code')
    .required('Country code is required'),
});

const CreateProfileVerificationModal = ({
  id,
  open,
  handleClose,
  heading,
  button1,
  setActionPerformed,
}) => {
  const classes = useStyles();
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [UpdateNumber] = useMutation(UPDATE_NUMBER);

  const handleVerification = async (data) => {
    try {
      setLoading(true);
      const response = await UpdateNumber({
        variables: {
          input: data,
        },
      });
      const { status, message } = response.data.updateMobile;
      if (status === 'error') {
        setErrorMsg(message);
      } else {
        setFormData(data);
        handleClose();
        setOpenModal(true);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setErrorMsg('Something went wrong !');
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const formik = useFormik({
    initialValues: {
      mobile: '',
      countryCode: '+91',
      grantType: 'UPDATE',
      id,
    },
    validationSchema,
    onSubmit: (values) => {
      handleVerification(values);
    },
  });

  return (
    <>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="lg"
        classes={{ paper: classes.dialogPaper4 }}
      >
        <DialogContent classes={{ root: classes.dialogContext1 }}>
        <div
            role="button"
            tabIndex={0}
            onKeyDown={handleClose}
            onClick={handleClose}
            className={classes.topBar}
          >
            <span className={classes.titleMob}>{heading}</span>
            <span className={`${classes.onHover} ${classes.closeBtnPass}`}>
              <CloseIcon />
            </span>
          </div>
          <Box className={classes.phoneContainer} id="alert-dialog-description">
            <form noValidate autoComplete="off" onSubmit={formik.handleSubmit}>
              <Grid container style={{ marginTop: '5vh' }}>
                <Grid item xs={2} sm={2} md={2} xl={2} />
                <Box className={classes.dFlex}>
                  <Box>
                    <FormControl
                      variant="outlined"
                      className={classes.formControl}
                    >
                      <Select
                        id="stdcode"
                        name="countryCode"
                        className={`${classes.width100} ${classes.darkBack}`}
                        value={formik.values.countryCode}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.countryCode && Boolean(formik.errors.countryCode)}
                        helperText={formik.touched.countryCode && formik.errors.countryCode}
                        inputProps={{
                          classes: {
                            icon: classes.colorWhite,
                          },
                        }}
                      >
                        {mobileCode?.map((item, idx) => (
                            <MenuItem key={idx} value={item?.dial_code}>
                              {item?.emoji} {item?.dial_code}
                            </MenuItem>
                          ))}
                       
                      </Select>
                      <FormHelperText style={{ color: 'red' }}>{ formik.touched.countryCode && formik.errors.countryCode }</FormHelperText>

                    </FormControl>
                  </Box>
                  <TextField
                    id="mobile"
                    name="mobile"
                    placeholder="Admin Mobile Number"
                    variant="outlined"
                    className={classes.width100}
                    value={formik.values.mobile}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.mobile && Boolean(formik.errors.mobile)}
                    helperText={formik.touched.mobile && formik.errors.mobile}
                    InputProps={{
                      classes: {
                        input: classes.placeHolder,
                      },
                      className: classes.inputHeight1,
                    }}
                  />
                </Box>
                {errorMsg.length > 0 && <Typography variant="subtitle1" className={classes.errorText}>{errorMsg}</Typography>}
                <Grid item xs={1} sm={2} md={2} xl={2} />

              </Grid>
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
                    width: '155px', height: '40px', fontWeight: '550', color: 'white', boxShadow: 'none', fontSize: '14px',
                  }}
                  type="submit"
                  className={classes.sendButton}
                >
                  { loading && <CircularProgress size={20} style={{ color: 'white' }} />}
                  { !loading && button1 }
                </Button>
              </Grid>
            </form>
          </Box>
        </DialogContent>
      </Dialog>
      <OtpModal data={formData} setActionPerformed={setActionPerformed} open={openModal} handleClose={handleCloseModal} type="update" />
    </>

  );
};
export default CreateProfileVerificationModal;

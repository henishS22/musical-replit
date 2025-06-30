import React from "react";
import {
  Dialog,
  DialogContent,
  TextField,
  FormControl,
  FormControlLabel,
  Switch,
  Button,
  Box,
} from "@material-ui/core";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ReactComponent as CloseIcon } from "Assets/Svg/close.svg";
import { formStyles } from "../../styles";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  occurrence: Yup.number()
    .typeError("Occurrence must be a number")
    .required("Occurrence is required"),
  points: Yup.number()
    .typeError("Points must be a number")
    .required("Points is required"),
  isActive: Yup.boolean(),
});

const GamificationForm = ({ open, handleClose, selectedItem, onSubmit }) => {
  const classes = formStyles();

  const formik = useFormik({
    initialValues: {
      name: selectedItem?.name || "",
      occurrence: selectedItem?.occurrence || 0,
      points: selectedItem?.points || 0,
      isActive: selectedItem?.isActive || false,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      onSubmit(values);
    },
  });

  return (
    <Dialog
      open={open}
      aria-labelledby="edit-dialog-title"
      aria-describedby="edit-dialog-description"
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
          <span className={classes.title}>Edit Gamification</span>
          <span className={`${classes.onHover} ${classes.closeBtn}`}>
            <CloseIcon />
          </span>
        </div>
        <div className={classes.formContent}>
          <form
            className={classes.paddingTopForm}
            onSubmit={formik.handleSubmit}
          >
            <TextField
              id="name"
              label="Name"
              variant="outlined"
              fullWidth
              name="name"
              placeholder="Enter Name"
              className={classes.textField}
              onChange={formik.handleChange}
              value={formik.values.name}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />

            <TextField
              id="occurrence"
              label="Occurrence"
              variant="outlined"
              fullWidth
              name="occurrence"
              type="number"
              placeholder="Enter Occurrence"
              className={classes.textField}
              onChange={formik.handleChange}
              value={formik.values.occurrence}
              error={
                formik.touched.occurrence && Boolean(formik.errors.occurrence)
              }
              helperText={formik.touched.occurrence && formik.errors.occurrence}
            />

            <TextField
              id="points"
              label="Points"
              variant="outlined"
              fullWidth
              name="points"
              type="number"
              placeholder="Enter Points"
              className={classes.textField}
              onChange={formik.handleChange}
              value={formik.values.points}
              error={formik.touched.points && Boolean(formik.errors.points)}
              helperText={formik.touched.points && formik.errors.points}
            />

            <FormControl component="fieldset" style={{ width: "100%" }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.isActive}
                    onChange={formik.handleChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label="Active Status"
              />
            </FormControl>

            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                className={classes.btnSub}
                type="submit"
                variant="contained"
                color="primary"
              >
                Update
              </Button>
            </Box>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GamificationForm;

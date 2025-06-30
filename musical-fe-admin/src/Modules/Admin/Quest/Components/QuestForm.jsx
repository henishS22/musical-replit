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
import { formStyles } from "../styles";
import { useMutation } from "@apollo/client";
import {
  CREATE_QUEST,
  UPDATE_QUEST,
  UPDATE_QUEST_STATUS,
} from "graphql/mutation/admin";
import { toast } from "react-toastify";

const validationSchemaCreate = Yup.object({
  name: Yup.string().required("Name is required"),
  occurrence: Yup.number()
    .typeError("Occurrence must be a number")
    .required("Occurrence is required"),
  points: Yup.number()
    .typeError("Points must be a number")
    .required("Points is required"),
  identifier: Yup.string().required("Identifier is required"),
  description: Yup.string().required("Description is required"),
  isPublishByAdmin: Yup.boolean(),
  isPublish: Yup.boolean(),
});

const validationSchemaEdit = Yup.object({
  name: Yup.string().required("Name is required"),
  occurrence: Yup.number()
    .typeError("Occurrence must be a number")
    .required("Occurrence is required"),
  points: Yup.number()
    .typeError("Points must be a number")
    .required("Points is required"),
});

const QuestForm = ({
  open,
  handleClose,
  setActionPerformed,
  mode = "create",
  quest = null,
}) => {
  const classes = formStyles();
  const [createQuest, { loading: creating }] = useMutation(CREATE_QUEST);
  const [updateQuest, { loading: updating }] = useMutation(UPDATE_QUEST);
  const [updateQuestStatus, { loading: statusUpdating }] =
    useMutation(UPDATE_QUEST_STATUS);

  const isEdit = mode === "edit";

  // Local state for isPublish in edit mode
  const [isPublished, setIsPublished] = React.useState(quest?.isPublished || false);

  React.useEffect(() => {
    if (isEdit) setIsPublished(quest?.isPublished || false);
  }, [isEdit, quest]);

  const formik = useFormik({
    initialValues: isEdit
      ? {
          name: quest?.name || "",
          occurrence: quest?.occurrence || 0,
          points: quest?.points || 0,
        }
      : {
          name: "",
          occurrence: 0,
          points: 0,
          description:"",
          isPublishByAdmin: false,
          isPublished: false,
          identifier: "",
        },
    validationSchema: isEdit ? validationSchemaEdit : validationSchemaCreate,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (isEdit) {
          // 1. Update main fields
          const { data } = await updateQuest({
            variables: {
              input: {
                name: values.name,
                occurrence: Number(values.occurrence),
                points: Number(values.points),
                description:values.description
              },
              where: { id: quest.id },
            },
          });
          if (data.updateQuest.status) {
            // 2. If isPublish changed, update status
            if (isPublished !== quest.isPublish) {
              const statusRes = await updateQuestStatus({
                variables: {
                  where: { id: quest.id },
                  input: { isPublished },
                },
              });
              if (!statusRes.data.questStatus.status) {
                toast.error(
                  statusRes.data.questStatus.message ||
                    "Failed to update status"
                );
                return;
              }
            }
            toast.success(
              data.updateQuest.message || "Quest updated successfully"
            );
            setActionPerformed(true);
            handleClose();
          } else {
            toast.error(data.updateQuest.message || "Failed to update quest");
          }
        } else {
          const { data } = await createQuest({
            variables: {
              input: {
                name: values.name,
                occurrence: Number(values.occurrence),
                points: Number(values.points),
                isPublishByAdmin: values.isPublishByAdmin,
                isPublished: values.isPublish,
                identifier: values.identifier,
                description:values.description
              },
            },
          });
          if (data.createQuest.status) {
            toast.success(
              data.createQuest.message || "Quest created successfully"
            );
            setActionPerformed(true);
            handleClose();
          } else {
            toast.error(data.createQuest.message || "Failed to create quest");
          }
        }
      } catch (error) {
        toast.error(error.message || "Failed to submit quest");
      }
    },
  });

  return (
    <Dialog
      open={open}
      aria-labelledby="quest-dialog-title"
      aria-describedby="quest-dialog-description"
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
          <span className={classes.title}>
            {isEdit ? "Edit Quest" : "Create Quest"}
          </span>
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
              id="description"
              label="Description"
              variant="outlined"
              fullWidth
              name="description"
              placeholder="Enter Description"
              className={classes.textField}
              onChange={formik.handleChange}
              value={formik.values.description}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
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
            {!isEdit && (
              <>
                <TextField
                  id="identifier"
                  label="Identifier"
                  variant="outlined"
                  fullWidth
                  name="identifier"
                  placeholder="Enter Identifier"
                  className={classes.textField}
                  onChange={formik.handleChange}
                  value={formik.values.identifier}
                  error={
                    formik.touched.identifier &&
                    Boolean(formik.errors.identifier)
                  }
                  helperText={
                    formik.touched.identifier && formik.errors.identifier
                  }
                />
                <FormControl component="fieldset" style={{ width: "100%" }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formik.values.isPublishByAdmin}
                        onChange={formik.handleChange}
                        name="isPublishByAdmin"
                        color="primary"
                      />
                    }
                    label="Publishable by Admin"
                  />
                </FormControl>
                <FormControl component="fieldset" style={{ width: "100%" }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formik.values.isPublish}
                        onChange={formik.handleChange}
                        name="isPublish"
                        color="primary"
                      />
                    }
                    label="Published"
                  />
                </FormControl>
              </>
            )}
            {/* Show isPublish switch in edit mode */}
            {isEdit && (
              <FormControl component="fieldset" style={{ width: "100%" }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      name="isPublish"
                      color="primary"
                      disabled={statusUpdating}
                    />
                  }
                  label="Published"
                />
              </FormControl>
            )}
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                className={classes.btnSub}
                type="submit"
                variant="contained"
                color="primary"
                disabled={creating || updating || statusUpdating}
              >
                {creating || updating || statusUpdating
                  ? isEdit
                    ? "Updating..."
                    : "Creating..."
                  : isEdit
                  ? "Update"
                  : "Create"}
              </Button>
            </Box>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestForm;

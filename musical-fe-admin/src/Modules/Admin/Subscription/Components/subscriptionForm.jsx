import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  Checkbox,
  TextField,
  Radio,
} from "@material-ui/core";
import { ReactComponent as CloseIcon } from "../../../../Assets/Svg/close.svg";
import { useStyles } from "./formStyles";
import { useMutation, useQuery } from "@apollo/client";
import {
  GET_SUBSCRIPTION_BY_ID,
  SUBSCRIPTION_FEATURES,
} from "graphql/query/admin";
import {
  CREATE_SUBSCRIPTION_PLAN,
  UPDATE_SUBSCRIPTION_PLAN,
} from "graphql/mutation/admin";
import { toast } from "react-toastify";

// Yup validation schema
const validationSchema = Yup.object({
  costDuration: Yup.string().required("Select a cost duration"),
  planName: Yup.string().required("Plan name is required"),
  description: Yup.string().required("Description is required"),
  price: Yup.number()
    .typeError("Price must be a number")
    .required("Price is required"),
  features: Yup.array()
    .min(1, "Select at least one feature")
    .required("Features are required"),
});

const SubscriptionForm = ({
  open,
  handleClose,
  adminData,
  subId,
  setActionPerformed,
  modeSub,
}) => {
  const classes = useStyles();
  const [createPersonalisedPlan] = useMutation(CREATE_SUBSCRIPTION_PLAN);
  const [updatePersonalisedPlan] = useMutation(UPDATE_SUBSCRIPTION_PLAN);

  const {
    data: featuresList,
    refetch,
  } = useQuery(SUBSCRIPTION_FEATURES, {
    fetchPolicy: "network-only",
  });

  const {
    data: subscriptionDataById,
    refetch: refetchSubscriptionById,
  } = useQuery(GET_SUBSCRIPTION_BY_ID, {
    fetchPolicy: "network-only",
    variables: { subscriptionId: subId },
  });

  useEffect(() => {
    if ((modeSub === "edit" || modeSub === "view") && subId) {
      refetchSubscriptionById({ subscriptionId: subId });
    }
  }, [modeSub, subId, refetchSubscriptionById]);

  // Refetch the subscription features when the component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  const formik = useFormik({
    initialValues: {
      costDuration: subscriptionDataById?.subscription?.interval || "",
      planName: subscriptionDataById?.subscription?.name || "",
      description: subscriptionDataById?.subscription?.description || "",
      price: subscriptionDataById?.subscription?.price || 0,
      planCode: subscriptionDataById?.subscription?.planCode || "",
      features:
        featuresList?.subscriptionFeatures?.features.map((feature) => ({
          id: feature.featureKey || feature.id,
          name: feature.name,
          not_available_description: feature.not_available_description,
          description: feature.description,
          unit: feature.unit || "",
          limit: feature.limit,
          selected:
            subscriptionDataById?.subscription?.features?.find(
              (subFeature) =>
                subFeature.featureKey === feature.id && subFeature.available
            )?.available || false,
          // selected: subscriptionDataById?.subscription?.features?.find(
          //   (subFeature) =>
          //     subFeature.featureKey === feature.id && subFeature.available
          // ),
          limitValue:
            subscriptionDataById?.subscription?.features?.find(
              (subFeature) => subFeature.featureKey === feature.id
            )?.limit || undefined, // Store the limit value if available
        })) || [],
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const payload = {
        features: values.features.map((feature) => {
          const isSelected = feature.selected;
          return {
            featureKey: feature.id,
            available: isSelected,
            description: isSelected
              ? feature.description.replace(
                  "${limit}",
                  feature.limitValue || ""
                )
              : "not_available_description",
            limit:
              feature.selected && feature.limitValue
                ? feature?.limitValue?.toString()
                : undefined,
          };
        }),
        name: values.planName,
        description: values.description,
        planCode: values.planCode,
        price: Number(values.price),
        type: "subscription",
        ...(modeSub === "create"
          ? {
              status: "active",
              interval: values.costDuration,
              createdById: adminData.me.id,
            }
          : { updatedById: adminData.me.id }),
      };

      try {
        if (modeSub === "create") {
          const response = await createPersonalisedPlan({
            variables: { input: payload },
          });
          if (response.data.createSubscription?.status) {
            toast.success(
              response?.data?.createSubscription?.message ||
                "Subscription Plan created successfully"
            );
            handleClose();
            setActionPerformed(true);
          }
        } else if (modeSub === "edit") {
          const response = await updatePersonalisedPlan({
            variables: { where: { id: subId }, input: payload },
          });
          if (response.data.updateSubscription?.status) {
            toast.success(
              response?.data?.updateSubscription?.message ||
                "Subscription Plan updated successfully"
            );
            handleClose();
            setActionPerformed(true);
          }
        }
      } catch (error) {
        toast.error(error.message || "Failed to create Subscription Plan");
        console.error("Error creating Subscription Plan:", error);
      }
    },
  });

  const handleCheckboxChange = (index) => (event) => {
    const selected = event.target.checked;

    formik.setFieldValue(`features[${index}].selected`, selected);

    if (!selected) {
      formik.setFieldValue(`features[${index}].limitValue`, "");
    }
  };

  const handleLimitValueChange = (index) => (event) => {
    const updatedFeatures = [...formik.values.features];
    updatedFeatures[index].limitValue = event.target.value;
    formik.setValues({ ...formik.values, features: updatedFeatures });
  };

  const isViewMode = modeSub === "view";
  const isEditMode = modeSub === "edit";
  const isCreateMode = modeSub === "create";

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
          <span className={classes.title}>Subscription Plan</span>
          <span className={`${classes.onHover} ${classes.closeBtn}`}>
            <CloseIcon />
          </span>
        </div>
        <div className={classes.formContent}>
          <form
            className={classes.paddingTopForm}
            onSubmit={formik.handleSubmit}
          >
            {/* Cost Duration */}
            <FormLabel className={classes.label}>
              Select Cost Duration:
            </FormLabel>
            <div className={classes.radioCon}>
              <div className={classes.radioGroup}>
                <FormControlLabel
                  control={
                    <Radio
                      name="costDuration"
                      value="Monthly"
                      checked={formik.values.costDuration === "Monthly"}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur} // Mark it as touched on blur
                      error={
                        formik.touched.costDuration &&
                        Boolean(formik.errors.costDuration)
                      }
                      className={
                        formik.values.costDuration === "Monthly"
                          ? classes.radioChecked
                          : classes.radio
                      }
                      disabled={isViewMode || isEditMode}
                    />
                  }
                  label="Monthly"
                />

                <FormControlLabel
                  control={
                    <Radio
                      name="costDuration"
                      value="Lifetime"
                      checked={formik.values.costDuration === "Lifetime"}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur} // Mark it as touched on blur
                      error={
                        formik.touched.costDuration &&
                        Boolean(formik.errors.costDuration)
                      }
                      className={
                        formik.values.costDuration === "Lifetime"
                          ? classes.radioChecked
                          : classes.radio
                      }
                      disabled={isViewMode || isEditMode}
                    />
                  }
                  label="Lifetime"
                />
              </div>
              {formik.errors.costDuration && formik.touched.costDuration ? (
                <div className={classes.error}>
                  {formik.errors.costDuration}
                </div>
              ) : null}
            </div>

            {/* Plan Name */}
            <TextField
              id="planName"
              label="Plan Name"
              variant="outlined"
              fullWidth
              name="planName"
              placeholder="Enter Plan Name"
              className={classes.textField}
              onChange={formik.handleChange}
              value={formik.values.planName}
              error={formik.errors.planName && formik.touched.planName}
              helperText={
                formik.errors.planName && formik.touched.planName
                  ? formik.errors.planName
                  : null
              }
              disabled={isViewMode}
            />

            {/* plan code */}
            <TextField
              id="planCode"
              label="Plan Code"
              variant="outlined"
              fullWidth
              name="planCode"
              placeholder="Enter Plan Code"
              className={classes.textField}
              onChange={formik.handleChange}
              value={formik.values.planCode}
              error={formik.errors.planCode && formik.touched.planCode}
              helperText={
                formik.errors.planCode && formik.touched.planCode
                  ? formik.errors.planCode
                  : null
              }
              disabled={isViewMode}
            />

            {/* Description */}
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
              error={formik.errors.description && formik.touched.description}
              helperText={
                formik.errors.description && formik.touched.description
                  ? formik.errors.description
                  : null
              }
              multiline
              minRows={4}
              disabled={isViewMode}
            />

            {/* Price */}
            <TextField
              type="number"
              id="price"
              label={`Price (${
                subscriptionDataById?.subscription?.currency || "USD"
              })`}
              variant="outlined"
              fullWidth
              name="price"
              placeholder="Enter Price"
              className={classes.textField}
              onChange={formik.handleChange}
              value={formik.values.price}
              error={formik.errors.price && formik.touched.price}
              helperText={
                formik.errors.price && formik.touched.price
                  ? formik.errors.price
                  : null
              }
              disabled={isViewMode}
            />

            {/* Features with Checkboxes and Limit Field */}
            <FormControl component="fieldset" style={{ width: "100%" }}>
              <FormLabel component="legend">Select Features:</FormLabel>
              <Box>
                {formik.values.features.map((feature, index) => (
                  <div key={feature.id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name={`features[${index}].selected`}
                          checked={feature.selected}
                          onChange={handleCheckboxChange(index)}
                          disabled={isViewMode}
                          className={
                            feature.selected
                              ? classes.checkboxFeatureSelected
                              : classes.checkboxFeature
                          }
                        />
                      }
                      label={`${feature.name} ${
                        feature.unit ? `(${feature.unit})` : ""
                      }`}
                    />

                    {/* Display limit field only if the feature has a limit */}
                    {feature.limit && (
                      <TextField
                        type="number"
                        id={`features[${index}].limitValue`}
                        label={`Enter limit for ${feature.name}`}
                        variant="outlined"
                        fullWidth
                        name={`features[${index}].limitValue`}
                        placeholder="Enter limit"
                        className={`${classes.textFieldFeature}`}
                        onChange={handleLimitValueChange(index)} // Update the limit value handler
                        value={formik.values.features[index].limitValue}
                        error={
                          formik.errors.features?.[index]?.limitValue &&
                          formik.touched.features?.[index]?.limitValue
                        }
                        helperText={
                          formik.errors.features?.[index]?.limitValue &&
                          formik.touched.features?.[index]?.limitValue
                            ? formik.errors.features[index].limitValue
                            : null
                        }
                        disabled={isViewMode} // Disable limit field if feature is not selected
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  </div>
                ))}
              </Box>
            </FormControl>

            {formik.errors.features && formik.touched.features && (
              <div className={classes.error}>{formik.errors.features}</div>
            )}

            {!isViewMode && (
              <Box display={"flex"} justifyContent={"center"}>
                <Button
                  className={classes.btnSub}
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Submit
                </Button>
              </Box>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionForm;

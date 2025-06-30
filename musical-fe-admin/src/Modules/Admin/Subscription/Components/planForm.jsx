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
  Radio,
  RadioGroup,
  TextField,
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
  selectedFeature: Yup.string().required("Select a feature"),
  //   features: Yup.array().of(
  //     Yup.object().shape({
  //       id: Yup.string().required(),
  //       limitValue: Yup.string().when("limit", {
  //         is: true,
  //         then: Yup.string().required("Limit value is required for this feature"),
  //       }),
  //     })
  //   ),
});

const PlanForm = ({
  open,
  handleClose,
  onSubmit,
  adminData,
  subId,
  setActionPerformed,
  modePP,
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
  });

  useEffect(() => {
    if ((modePP === "edit" || modePP === "view") && subId) {
      refetchSubscriptionById({ subscriptionId: subId });
    }
  }, [modePP, subId, refetchSubscriptionById]);

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
      selectedFeature:
        subscriptionDataById?.subscription?.features?.[0]?.featureKey || "",
      limitValue: "",
      features: featuresList?.subscriptionFeatures?.features
        ? featuresList.subscriptionFeatures.features.map((feature) => {
            const isSelectedFeature =
              feature.id ===
              subscriptionDataById?.subscription?.features?.[0]?.featureKey;
            return {
              id: feature.featureKey || feature.id,
              limit: feature.limit,
              name: feature.name,
              not_available_description: feature.not_available_description,
              description: feature.description,
              unit: feature.unit || "",
              limitValue: isSelectedFeature
                ? subscriptionDataById?.subscription?.features?.[0]?.limit || ""
                : "", // Only populate limitValue for selected feature
            };
          })
        : [],
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      // Find the selected feature
      const selectedFeature = values.features.find(
        (feature) => feature.id === values.selectedFeature
      );

      // Ensure that selectedFeature is found and has the description
      const updatedDescription = selectedFeature
        ? selectedFeature.description.replace(
            "${limit}",
            selectedFeature.limitValue || ""
          )
        : "";

      // Build the payload
      const payload = {
        features: values.features
          .filter((feature) => feature.id === values.selectedFeature)
          .map((feature) => {
            return {
              available: true,
              description: updatedDescription,
              // name: feature.name,
              featureKey: feature.id,
              limit: feature.limitValue?.toString() || undefined,
              unit: feature.unit || "",
            };
          }),
        name: values.planName,
        description: values.description,
        planCode: values.planCode,
        price: Number(values.price),
        type: "addon",
        ...(modePP === "create"
          ? {
              status: "active",
              interval: values.costDuration,
              createdById: adminData.me.id,
            }
          : { updatedById: adminData.me.id }),
      };

      if (modePP === "create") {
        try {
          const response = await createPersonalisedPlan({
            variables: {
              input: payload,
            },
          });
          if (response.data.createSubscription?.status) {
            toast.success(
              response?.data?.createSubscription?.message ||
                "Subscription Plan created successfully"
            );
            handleClose();
            setActionPerformed(true);
          }
        } catch (error) {
          toast.error(error.message || "Failed to create Subscription Plan");
          console.error("Error creating Subscription Plan:", error);
        }
      } else if (modePP === "edit") {
        try {
          const response = await updatePersonalisedPlan({
            variables: {
              where: { id: subId },
              input: payload,
            },
          });
          if (response.data.updateSubscription?.status) {
            toast.success(
              response?.data?.updateSubscription?.message ||
                "Subscription Plan updated successfully"
            );
            handleClose();
            setActionPerformed(true);
          }
        } catch (error) {
          toast.error(error.message || "Failed to update Subscription Plan");
          console.error("Error updating Subscription Plan:", error);
        }
      }
    },
  });

  const isViewMode = modePP === "view";
  const isEditMode = modePP === "edit";

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
          <span className={classes.title}>Personalised Plan</span>
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
                      value="Yearly"
                      checked={formik.values.costDuration === "Yearly"}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur} // Mark it as touched on blur
                      error={
                        formik.touched.costDuration &&
                        Boolean(formik.errors.costDuration)
                      }
                      className={
                        formik.values.costDuration === "Yearly"
                          ? classes.radioChecked
                          : classes.radio
                      }
                      disabled={isViewMode || isEditMode}
                    />
                  }
                  label="Yearly"
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

            {/* plancode */}
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

            <FormControl component="fieldset" style={{ width: "100%" }}>
              <FormLabel component="legend">Select Feature:</FormLabel>
              <RadioGroup
                name="selectedFeature"
                value={formik.values.selectedFeature || ""}
                className={classes.radioGroupFeature}
                onChange={(e) => {
                  const newSelectedFeatureId = e.target.value;

                  // Clear limit values for all non-selected features
                  const updatedFeatures = formik.values.features.map(
                    (feature) => {
                      if (
                        feature.id !== newSelectedFeatureId &&
                        feature.limit
                      ) {
                        return { ...feature, limitValue: "" };
                      }
                      return feature;
                    }
                  );

                  // // Update both the selected feature and the updated features array
                  // formik.setValues({
                  //   ...formik.values,
                  //   selectedFeature: newSelectedFeatureId,
                  //   features: updatedFeatures,
                  // });
                  const selectedFeature = formik.values.features.find(
                    (feature) => feature.id === newSelectedFeatureId
                  );

                  formik.setValues({
                    ...formik.values,
                    selectedFeature: newSelectedFeatureId,
                    features: updatedFeatures,
                    limitValue: selectedFeature
                      ? selectedFeature.limitValue
                      : "", // Set limitValue for selected feature
                  });
                }}
              >
                {formik.values.features?.map((feature, index) => (
                  <div key={index}>
                    <FormControlLabel
                      control={
                        <Radio
                          value={feature.id}
                          checked={formik.values.selectedFeature === feature.id}
                          disabled={isViewMode}
                          className={
                            formik.values.selectedFeature === feature.id
                              ? classes.radioFeatureSelected
                              : classes.radioFeature
                          }
                        />
                      }
                      label={
                        featuresList?.subscriptionFeatures?.features[index]
                          .name +
                        " " +
                        (featuresList?.subscriptionFeatures?.features[index]
                          .unit
                          ? `(${featuresList?.subscriptionFeatures?.features[index].unit})`
                          : "")
                      }
                    />
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
                        onChange={formik.handleChange}
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
                        disabled={
                          formik.values.selectedFeature !== feature.id ||
                          isViewMode
                        }
                      />
                    )}
                  </div>
                ))}{" "}
              </RadioGroup>
            </FormControl>
            {formik.errors.selectedFeature &&
              formik.touched.selectedFeature && (
                <div className={classes.error}>
                  {formik.errors.selectedFeature}
                </div>
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

export default PlanForm;

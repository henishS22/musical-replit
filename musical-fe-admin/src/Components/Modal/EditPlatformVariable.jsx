/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import { CircularProgress, Typography } from "@material-ui/core";
import { useMutation } from "@apollo/client";

import { UPDATE_VARIABLE } from "graphql/mutation/admin";
import { SwitchStyles1, useStyles } from "./ModalStyles";

const EditPlatformVariable = ({
  variables,
  editId,
  handleOnEditSuccess,
  handleClose,
  flag,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [updateVariable] = useMutation(UPDATE_VARIABLE);
  const classes = useStyles();

  const handleSubmit = async (values) => {
    if(values.variables[4].value < values.variables[3].value){
      setErrorMsg("inactivity_threshold must be greater than inactivity_alert3 !");
    }else if(values.variables[3].value < values.variables[2].value){
      setErrorMsg("inactivity_alert3 must be greater than inactivity_alert2 !");
    }else if(values.variables[2].value < values.variables[1].value){
      setErrorMsg("inactivity_alert2 must be greater than inactivity_alert1  !");
    }
    else{
      try {
        setLoading(true);
        const response = await updateVariable({
          variables: {
            input: {
              variables: values.variables,
            },
            where: {
              id: editId,
            },
          },
        });
  
        const { status, message } = response.data.updateVariable;
        if (status === "error") {
          setErrorMsg(message);
        } else {
          handleOnEditSuccess();
          handleClose();
        }
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
        setErrorMsg("Something went wrong !");
      }
    }
  };

  return (
    <div className={classes.platformBox}>
      <Formik
        initialValues={{
          variables,
        }}
        onSubmit={(values) => {
          handleSubmit(values);
        }}
        render={({ values, setFieldValue }) => (
          <Form>
            <FieldArray
              name="variables"
              render={(arrayHelpers) => (
                <div>
                  {values.variables && values.variables.length > 0 && (
                    flag === "Platform Fee" ?
                      <div className={classes.dFlex2}>
                        <>
                          <Field
                            placeholder="Variable name"
                            className={classes.inputHeight2}
                            name={`variables.${0}.name`}
                            value={values.variables[0].name}
                            disabled
                          />
                          <Field
                            type="number"
                            placeholder="Value"
                            className={classes.inputHeight2}
                            style={{ width: "150px" }}
                            name={`variables.${0}.value`}
                            value={values.variables[0].value}
                          />
                        </>
                      </div>
                      : flag === "Nominee Status" && values.variables.slice(1).map((friend, index) => (
                        <div className={classes.dFlex2}>
                          <>
                            <Field
                              placeholder="Variable name"
                              className={classes.inputHeight2}
                              name={`variables.${index + 1}.name`}  // Adjust the index to match original array
                              value={values.variables[index + 1].name}
                            />
                            <Field
                              type="number"
                              placeholder="Value"
                              className={classes.inputHeight2}
                              style={{ width: "150px" }}
                              name={`variables.${index + 1}.value`}  
                              value={values.variables[index + 1].value}
                            />
                          </>

                        </div>
                      ))
                  )}
                  {values.variables.length > 0 && (
                    <div className={classes.dFlex3}>
                      {errorMsg.length > 0 && (
                        <Typography
                          variant="subtitle1"
                          className={classes.errorText1}
                        >
                          {errorMsg}
                        </Typography>
                      )}
                      <button className={classes.sendButton1} type="submit">
                        {loading && (
                          <CircularProgress
                            size={20}
                            style={{ color: "white" }}
                          />
                        )}
                        {!loading && "Update"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            />
          </Form>
        )}
      />
    </div>
  );
};

export default EditPlatformVariable;

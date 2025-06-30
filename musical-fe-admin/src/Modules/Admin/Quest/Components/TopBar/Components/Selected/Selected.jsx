import React from 'react';
import Selected from '@material-ui/core/Button';
import { ReactComponent as CloseIcon } from 'Assets/Svg/closeSmall.svg';
import { selectedStyles } from './SelectedStyles';

// eslint-disable-next-line react/prop-types
const SelectedFilter = ({ text }) => {
  const classes = selectedStyles();
  return (
    <Selected
      variant="contained"
      color="primary"
      className={classes.button}
    >
      <span>{text}</span>
      <span className={`${classes.onHover} ${classes.closeBtn}`}><CloseIcon /></span>
    </Selected>
  );
};

export default SelectedFilter;

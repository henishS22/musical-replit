import React from 'react';
import Selected from '@material-ui/core/Button';
import { ReactComponent as CloseIcon } from '../../Assets/Svg/closeSmall.svg';
import { selectedStyles } from './SelectedStyles';

// eslint-disable-next-line react/prop-types
const SelectedFilter = ({ text, onClick }) => {
  const classes = selectedStyles();
  return (
    <Selected
      onClick={onClick}
      variant="contained"
      color="primary"
      className={classes.button}
    >
      <span>{text}</span>
      <span label="clear" role="button" tabIndex={0} onKeyDown={onClick} className={`${classes.onHover} ${classes.closeBtn}`} onClick={onClick}><CloseIcon /></span>
    </Selected>
  );
};

export default SelectedFilter;

import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import clsx from 'clsx';
import { arrowDownStyles } from './ArrowDownStyles';

const CustomExpandMore = withStyles()(
  ({ className, ...rest }) => {
    const classes = arrowDownStyles();
    return (
      <ExpandMoreIcon
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...rest}
        className={clsx(className, classes.iconMore)}
      />
    );
  },
);

export default CustomExpandMore;

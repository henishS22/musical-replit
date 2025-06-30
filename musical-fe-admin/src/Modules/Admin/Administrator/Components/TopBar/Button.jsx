import React from 'react';
import Button from '@material-ui/core/Button';

import { buttonStyles } from '../../administratorStyles';

// eslint-disable-next-line react/prop-types
export default function Button1({ onButtonClick, onCreateClick, title }) {
  const classes = buttonStyles();
  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          onButtonClick('right', true)();
          onCreateClick();
        }}
        className={classes.button}
      >
        {title}
      </Button>
    </div>

  );
}

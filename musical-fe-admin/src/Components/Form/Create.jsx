/* eslint-disable react/prop-types */
import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import { Typography, Box, Icon } from '@material-ui/core';
import { useStyles } from './CreateStyles';
import CloseIcon from '../../Assets/Svg/close.svg';

export default function TemporaryDrawer({
  state, toggleDrawer, header, disableEdit, children,
  setInitialValues,
}) {
  const classes = useStyles();
  return (
    <div>
      {['left', 'right', 'top', 'bottom'].map((anchor) => (
        <React.Fragment key={anchor}>
          <Drawer
            anchor={anchor}
            open={state[anchor]}
            onClose={() => {
              toggleDrawer(anchor, false)();
              disableEdit();
            }}
          >
            <Box className={classes.mainFormBox}>
              <Box className={classes.topBox}>
                <Typography className={classes.topHeader}>{header}</Typography>
                <Icon
                  className={classes.closeBtn}
                  onClick={() => {
                    toggleDrawer(anchor, false)();
                    disableEdit();
                    setInitialValues({
                      roleId: '',
                      fullName: '',
                      mobile: '',
                      countryCode: '+91',
                      email: '',
                    });
                  }}
                >
                  <img alt="imageAlt" src={CloseIcon} className={classes.closeIcon} />
                </Icon>
              </Box>
              <Box className={classes.mainBox}>
                {children}
              </Box>
            </Box>
          </Drawer>
        </React.Fragment>
      ))}
    </div>
  );
}

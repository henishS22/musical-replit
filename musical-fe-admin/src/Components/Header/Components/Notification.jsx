import React from 'react';
import Popover from '@material-ui/core/Popover';
import { Typography, Box, Icon } from '@material-ui/core';
import { notficationStyles } from '../HeaderStyles';
import NotsIcon from '../../../Assets/Svg/Header/nots.svg';

// eslint-disable-next-line react/prop-types
export default function SimplePopover({ notificationAnchorEl, handleClose }) {
  const classes = notficationStyles();
  const open = Boolean(notificationAnchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <>
      <Popover
        id={id}
        open={open}
        anchorEl={notificationAnchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        classes={{
          paper: classes.overFlowMenu,
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        { open && <Box className={classes.toolTip} /> }
        <Box className={classes.notificationBox}>
          <Box className={classes.topBar}>
            <Typography className={classes.mark}>Mark all as read.</Typography>
            <Typography className={classes.link}>View All.</Typography>
          </Box>
          <Box className={classes.flexBox}>
            <Box className={classes.box1}>
              <Icon className={classes.icon}>
                <img alt="imageAlt" src={NotsIcon} />
              </Icon>
              <Typography className={classes.notDescpription}>Mason Added a New Artist</Typography>
            </Box>
            <Box className={classes.box2}>
              <Typography className={classes.notTime}>3hrs ago</Typography>
            </Box>
          </Box>
          <Box className={`${classes.flexBox} ${classes.backgroundGrey}`}>
            <Box className={classes.box1}>
              <Icon className={classes.icon}>
                <img alt="imageAlt" src={NotsIcon} />
              </Icon>
              <Typography className={classes.notDescpription}>Mason Added a New Artist</Typography>
            </Box>
            <Box className={classes.box2}>
              <Typography className={classes.notTime}>3hrs ago</Typography>
            </Box>
          </Box>
          <Box className={classes.flexBox}>
            <Box className={classes.box1}>
              <Icon className={classes.icon}>
                <img alt="imageAlt" src={NotsIcon} />
              </Icon>
              <Typography className={classes.notDescpription}>Mason Added a New Artist</Typography>
            </Box>
            <Box className={classes.box2}>
              <Typography className={classes.notTime}>3hrs ago</Typography>
            </Box>
          </Box>
          <Box className={`${classes.flexBox} ${classes.backgroundGrey}`}>
            <Box className={classes.box1}>
              <Icon className={classes.icon}>
                <img alt="imageAlt" src={NotsIcon} />
              </Icon>
              <Typography className={classes.notDescpription}>Mason Added a New Artist</Typography>
            </Box>
            <Box className={classes.box2}>
              <Typography className={classes.notTime}>3hrs ago</Typography>
            </Box>
          </Box>
          <Box className={classes.flexBox}>
            <Box className={classes.box1}>
              <Icon className={classes.icon}>
                <img alt="imageAlt" src={NotsIcon} />
              </Icon>
              <Typography className={classes.notDescpription}>Mason Added a New Artist</Typography>
            </Box>
            <Box className={classes.box2}>
              <Typography className={classes.notTime}>3hrs ago</Typography>
            </Box>
          </Box>
          <Box className={`${classes.flexBox} ${classes.backgroundGrey}`}>
            <Box className={classes.box1}>
              <Icon className={classes.icon}>
                <img alt="imageAlt" src={NotsIcon} />
              </Icon>
              <Typography className={classes.notDescpription}>Mason Added a New Artist</Typography>
            </Box>
            <Box className={classes.box2}>
              <Typography className={classes.notTime}>3hrs ago</Typography>
            </Box>
          </Box>
          <Box className={classes.flexBox}>
            <Box className={classes.box1}>
              <Icon className={classes.icon}>
                <img alt="imageAlt" src={NotsIcon} />
              </Icon>
              <Typography className={classes.notDescpription}>Mason Added a New Artist</Typography>
            </Box>
            <Box className={classes.box2}>
              <Typography className={classes.notTime}>3hrs ago</Typography>
            </Box>
          </Box>
          <Box className={`${classes.flexBox} ${classes.backgroundGrey}`}>
            <Box className={classes.box1}>
              <Icon className={classes.icon}>
                <img alt="imageAlt" src={NotsIcon} />
              </Icon>
              <Typography className={classes.notDescpription}>Mason Added a New Artist</Typography>
            </Box>
            <Box className={classes.box2}>
              <Typography className={classes.notTime}>3hrs ago</Typography>
            </Box>
          </Box>
          <Box className={`${classes.flexBox} ${classes.backgroundGrey}`}>
            <Box className={classes.box1}>
              <Icon className={classes.icon}>
                <img alt="imageAlt" src={NotsIcon} />
              </Icon>
              <Typography className={classes.notDescpription}>Mason Added a New Artist</Typography>
            </Box>
            <Box className={classes.box2}>
              <Typography className={classes.notTime}>3hrs ago</Typography>
            </Box>
          </Box>
        </Box>
      </Popover>
    </>
  );
}

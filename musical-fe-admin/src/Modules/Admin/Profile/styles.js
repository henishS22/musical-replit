/* eslint-disable import/prefer-default-export */

import { makeStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';

export const useStyles = makeStyles({
  app: {
    margin: '0% 2%',
    minHeight: '100vh',
  },
  cover: {
    width: 151,
  },
  link: {
    color: 'black',
    textDecoration: 'none',
    marginRight: '5px',
  },
  cursorPointer: {
    cursor: 'pointer',
    color: 'black',
    fontWeight: 'bold',
    marginLeft: '5px',
  },
  profileContainer: {
    marginLeft: '15%',
    marginTop: '5%',
  },
  profileImage: {
    display: 'flex',
  },
  accesLabel: {
    fontSize: '16px',
    fontWeight: 'bold',
    // textAlign: 'center',
    display: 'block',
  },
  labelWrap: {
    padding: '10px 0px',

  },
  permisionWrapperMain: {
    margin: '10px 0px',
  },
  permissionContainerWrapper: {
    paddingBottom: '15px',
    borderBottom: '1px solid #0c0c0c38',
  },
  switchBase: {
    color: 'grey',
    '&$checked': {
      color: 'green',
    },
    '&$checked + $track': {
      backgroundColor: green,
    },
  },
  profileInfo: {
    '&tr &td': {
      padding: '10px 80px 10px 0px',
    },
  },
  mTop: {
    marginTop: '-50px !important',
  },
  profileHeadContainer: {
    marginTop: '6vh',
  },
  path: {
    fontWeight: 'bold',
    display: 'flex',
  },
  formControlLabel: {
    // marginLeft: '0.8vh',
    fontSize: '14px',
    fontWeight: '550',
    marginLeft: '10px',
  },
});

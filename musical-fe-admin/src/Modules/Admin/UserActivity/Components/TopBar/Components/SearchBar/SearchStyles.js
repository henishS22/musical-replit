/* eslint-disable import/prefer-default-export */
import { makeStyles } from '@material-ui/core/styles';

const searchBarStyles = makeStyles((theme) => ({
  search: {
    borderRadius: '4px',
    paddingTop: '0px',
    position: 'static',
    height: '36px',
    color: 'black',
    border: '1px solid #CCCCCC',
    backgroundColor: 'rgba(0, 0, 0, 0.02);',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
    },

    [theme.breakpoints.up('sm')]: {
      width: 'auto',
    },

    [theme.breakpoints.up('md')]: {
      marginLeft: 0,
      width: '250px',
      height: '40px',
      color: 'black',
      background: 'rgba(0, 0, 0, 0.02);',
    },
  },
  searchClass: {
    borderRadius: '4px',
    paddingTop: '0px',
    position: 'static',
    marginRight: '22px',
    height: '36px',
    color: 'black',
    border: '1px solid #CCCCCC',
    backgroundColor: 'rgba(0, 0, 0, 0.02);',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
    },

    [theme.breakpoints.up('sm')]: {
      width: 'auto',
    },

    [theme.breakpoints.up('md')]: {
      marginLeft: 0,
      width: '250px',
      height: '40px',
      color: 'black',
      background: 'rgba(0, 0, 0, 0.02);',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    top: '0px',
    left: '0px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'black',
  },
  inputInput: {
    padding: theme.spacing(1.3, 1, 1, 0),
    color: 'black !important',
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
    '&::placeholder': {
      textOverflow: 'ellipsis !important',
      color: '#606060 !important',
      opacity: 1,
      fontSize: '14px',
    },
  },
}));

export { searchBarStyles };

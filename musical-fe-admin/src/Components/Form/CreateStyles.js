import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  list: {
    width: '500px !important',
  },
  mainFormBox: {
    width: '500px !important',
  },
  fullList: {
    width: '500px !important',
  },
  topBox: {
    height: '80px',
    position: 'relative',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: '10px 30px',
    borderBottom: '1px solid lightgrey',
  },
  topHeader: {
    fontSize: '24px',
    fontWeight: 550,
  },
  closeBtn: {
    position: 'absolute',
    right: '5%',
    top: '25%',
  },
  closeIcon: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  mainBox: {
    padding: '10px 25px',
  },
});

// eslint-disable-next-line import/prefer-default-export
export { useStyles };

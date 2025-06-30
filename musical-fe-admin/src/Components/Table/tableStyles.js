import { makeStyles, withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';

const tableHeaderStyles = makeStyles(() => ({
  header: {
    height: '40px',
    background: '#f2f2f2',
    padding: '0px 20px',
    boxSizing: 'border-box !important',
  },
  headerTitle: {
    fontSize: '14px !important',
    lineHeight: '18px',
    fontWeight: 550,
    textWrap: 'nowrap',
  },
}));

const tableStyles = makeStyles(() => ({
  mainBox: {
    marginLeft: '0px',
  },
  backgroundGrey: {
    background: '#f7f7f7',
  },
  box: {
    height: '50px',
    padding: '0px 20px !important',
    boxSizing: 'border-box !important',
    maxWidth: 'none !important',
  },
  content: {
    fontSize: '16px !important',
    lineHeight: '18px',
    fontWeight: 550,
    textWrap: 'nowrap',
  },
  contentLink: {
    fontSize: '16px !important',
    lineHeight: '18px',
    fontWeight: 550,
    textDecoration: 'underline',
    color: 'blue',
    marginRight: '50px !important',
    cursor: 'pointer',
  },
  iconRead: {
    height: '24px',
    width: '20px',
    marginRight: '15px',
    cursor: 'pointer',
  },
  iconEdit: {
    height: '20px',
    width: '20px',
    marginRight: '15px',
    cursor: 'pointer',
  },
  iconDelete: {
    height: '20px',
    width: '20px',
    marginRight: '15px',
    cursor: 'pointer',
  },
  email: {
    fontSize: '16px !important',
    lineHeight: '18px',
    fontWeight: 700,
  },
}));

const SwitchStyles = withStyles((theme) => ({
  root: {
    width: 45,
    height: 23,
    cursor: 'default',
    padding: 0,
    borderRadius: '20px',
    display: 'flex',
  },
  switchBase: {
    padding: 2,
    cursor: 'default',
    color: theme.palette.grey[500],
    '&$checked': {
      transform: 'translateX(24px)',
      color: '#27AE60',
      '& + $track': {
        opacity: 1,
        backgroundColor: '#E0DFE8',
        borderColor: '#E0DFE8',
      },
    },
  },
  thumb: {
    cursor: 'default',
    width: 17,
    height: 17,
    boxShadow: 'none',
  },
  track: {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: '#E0DFE8',
  },
  checked: {},
}))(Switch);

const paginationStyles = makeStyles(() => ({
  box: {
    display: "flex",
    paddingTop: "20px",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  title: {
    color: "#606060",
    fontSize: "14px",
    fontWeight: "450",
    marginRight: "5px",
    marginLeft: "5px",
  },
  input: {
    width: "50px",
    height: "30px",
    fontSize: "14px",
    background: "rgba(0, 0, 0, 0.02)",
    border: "1px solid #CCCCCC",
    borderRadius: "4px",
    paddingLeft: "10px",
  },
  arrowBox: {
    width: "30px",
    height: "30px",
    background: `linear-gradient(175.57deg, #1db653 3.76%, #0e5828 96.59%)`,
    borderRadius: "4px",
    marginLeft: "5px",
    position: "relative",
    cursor: "pointer",
  },
  disabledArrowBox: {
    pointerEvents: "none",
    width: "30px",
    height: "30px",
    background: "#CCCCCC",
    borderRadius: "4px",
    marginLeft: "5px",
    position: "relative",
    cursor: "pointer",
  },
  icon: {
    width: "6px",
    height: "10px",
    position: "absolute",
    top: "35%",
    left: "35%",
  },
}));
export {
  tableHeaderStyles,
  tableStyles,
  SwitchStyles,
  paginationStyles,
};

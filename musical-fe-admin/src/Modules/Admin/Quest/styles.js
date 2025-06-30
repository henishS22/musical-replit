import { makeStyles } from '@material-ui/core/styles';

const tabStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    paddingRight: '0px',
  },
  paddingAll: {
    padding: '0px 20px',
  },
  tabBar: {
    boxShadow: 'none !important',
    paddingLeft: '15px',
    backgroundColor: 'white !important',
  },
  tabBox: {
    backgroundColor: 'white !important',
    color: 'black',
    borderBottom: '1px solid grey !important',
  },
  tabValue: {
    fontStyle: 'normal',
    fontWeight: 550,
    fontSize: '19px',
    padding: '10px 30px',
    minWidth: '180px',
    textTransform: 'none',
  },
}));

// eslint-disable-next-line import/prefer-default-export
export { tabStyles };

export const formStyles = makeStyles((theme) => ({
  dialogPaper1: {
    minWidth: "500px",
    borderRadius: "10px",
  },
  dialogContext: {
    padding: "0px !important",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    borderBottom: "1px solid #e0e0e0",
  },
  title: {
    fontSize: "20px",
    fontWeight: "600",
  },
  closeBtn: {
    cursor: "pointer",
  },
  formContent: {
    padding: "20px",
  },
  paddingTopForm: {
    paddingTop: "20px",
  },
  textField: {
    marginBottom: "20px",
  },
  btnSub: {
    background: `linear-gradient(175.57deg, #1db653 3.76%, #0e5828 96.59%)`,
    border: "none",
    color: "white",
    fontWeight: "550",
    fontSize: "16px",
    width: "155px",
    height: "40px",
    boxShadow: "none",
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  onHover: {
    "&:hover": {
      opacity: 0.7,
    },
  },
}));

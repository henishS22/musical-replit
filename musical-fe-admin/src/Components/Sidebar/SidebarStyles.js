import { alpha, makeStyles } from "@material-ui/core/styles";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  "@global": {
    "*::-webkit-scrollbar": {
      display: "none",
    },
    "*::-webkit-scrollbar-track": {
      "-webkit-box-shadow": "inset 0 0 6px rgba(0,0,0,0.00)",
    },
    "*::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0,0,0,.1)",
      outline: "1px solid slategrey",
    },
  },
  grow: {
    flexGrow: 1,
  },
  headerTitle: {
    position: "absolute",
    width: "140px",
    height: "51px",
    left: "80px",
    fontStyle: "normal",
    fontWeight: 500,
    fontSize: "22px",
    lineHeight: "51px",
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    color: "#FFFFFF",
  },
  title: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  search: {
    borderRadius: "4px",
    paddingTop: "0px",
    paddingLeft: "55px !important",
    position: "relative",
    height: "36px",
    color: "white",
    backgroundColor: alpha(theme.palette.common.white, 0.25),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),

    [theme.breakpoints.up("sm")]: {
      marginLeft: "20px",
      width: "auto",
    },

    [theme.breakpoints.up("md")]: {
      marginLeft: 0,
      position: "absolute",
      width: "300px",
      height: "36px",
      right: "140px",
      color: "white",
      background: "rgba(255, 255, 255, 0.1)",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    top: "0px",
    left: "0px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "white",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    color: "white !important",
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
    "&::placeholder": {
      textOverflow: "ellipsis !important",
      color: "white !important",
    },
  },
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
  sectionMobile: {
    display: "flex",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  root: {
    display: "flex",
    position: "sticky",
  },
  appBar: {
    zIndex: "1200 !important",
    width: "100%",
    position: "fixed",
    height: "80px",
    paddingTop: "8px",
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: 'red',
    background: "linear-gradient(90deg, #0066FF 4.58%, #5200FF 98.19%)",
    // boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    [theme.breakpoints.up("md")]: {
      justifyContent: "normal",
      alignItems: "normal",
    },
  },
  icon: {
    // marginTop: '-12px !important',
    // opacity: 1,
    marginLeft: "8px",
    marginRight: "-7px",
  },
  icon2: {
    // marginTop: '-12px !important',
    // opacity: 1,
    marginLeft: "2px",
    marginRight: "-7px",
  },
  iconHeight: {
    height: "30px",
    width: "100%",
  },
  iconSelected: {
    marginLeft: "8px",
    marginRight: "-7px",
    opacity: 1,
    // marginTop: '-12px !important',
    "&:hover": {
      opacity: "1 !important",
      fontWeight: "bold !important",
    },
  },
  appBarShift: {
    paddingLeft: drawerWidth,
    width: "100%",
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  mobileMenu: {
    marginTop: "60px",
    padding: 0,
    position: "absolute",
  },
  menuSelected: {
    background: "#DDF5E5 !important",
    color: "black !important",
    borderRight: "5px solid #1DB653 !important",
    opacity: "1 !important",
    fontWeight: "600 !important",
  },
  hide: {
    display: "none",
  },
  drawer: {
    height: "100vh",
    width: drawerWidth,
    flexShrink: 0,
    paddingTop: "80px",
    whiteSpace: "nowrap",
    "&::-webkit-scrollbar": {
      display: "none !important",
    },
  },
  listItem: {
    height: "60px",
    opacity: 0.6,
    "&:hover": {
      opacity: 1,
    },
  },
  menuText: {
    marginTop: "6px",
    fontSize: "14px",
    fontWeight: "bold !important",
  },
  menuTextSelected: {
    marginTop: "4px",
    fontSize: "14px",
    fontWeight: "bold !important",
  },
  drawerOpen: {
    paddingTop: "70px !important",
    backgroundColor: "#ffffff",
    width: drawerWidth,
    height: "-webkit-fill-available",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    paddingTop: "70px !important",
    backgroundColor: "#F6F4FC !important",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9) + 1,
    },
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    // padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    backgroundColor: "white",
    //   padding: theme.spacing(2),
  },
}));

const notficationStyles = makeStyles((theme) => ({
  typography: {
    padding: theme.spacing(2),
  },
  notificationBox: {
    width: "425px",
    height: "491px",
  },
  mark: {
    fontStyle: "normal",
    fontWeight: 500,
    fontSize: "14px",
  },
  link: {
    color: "#5200FF",
    fontStyle: "normal",
    fontWeight: 450,
    fontSize: "12px",
    textDecoration: "underline",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid grey",
    padding: "10px",
  },
  flexBox: {
    height: "60px",
    display: "flex",
    padding: "15px 20px !important",
    boxSizing: "border-box",
    borderBottom: "1px solid grey",
  },
  backgroundGrey: {
    backgroundColor: "#f2f2f2",
  },
  box1: {
    width: "80%",
    display: "flex",
    fontStyle: "normal",
    fontWeight: 450,
    fontSize: "16px",
  },
  box2: {
    width: "20%",
    fontStyle: "normal",
    fontWeight: 450,
    fontSize: "14px",
    opacity: 0.5,
  },
  icon: {
    marginRight: "10px !important",
    marginTop: "-2px",
  },
}));

export { useStyles, notficationStyles };

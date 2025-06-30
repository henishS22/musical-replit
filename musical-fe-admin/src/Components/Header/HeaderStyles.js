import { makeStyles } from "@material-ui/core/styles";

// const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  primaryBtn: {
    height: "46px",
    width:"46px",
    background: `linear-gradient(175.57deg, #1db653 3.76%, #0e5828 96.59%)`,
    borderRadius: "50%",
    fontWeight: 600,
    fontSize: "16px",
    lineHeight: "20px",
    color: "#ffffff",
    // padding: "10px 20px",
    border: "none",
    cursor: "pointer",
  },
  headerTitle: {
    // position: 'absolute',
    // width: '140px',
    height: "51px",
    // left: '80px',
    fontStyle: "normal",
    margin: "0px 15px",
    marginLeft: "30px",
    fontWeight: 500,
    fontSize: "28px",
    lineHeight: "51px",
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    color: "#FFFFFF",
  },
  search: {
    borderRadius: "4px",
    paddingTop: "0px",
    // paddingLeft: '55px !important',
    position: "relative",
    height: "36px",
    color: "white",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
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
  wallet: {
    borderRadius: "4px",
    paddingTop: "0px",
    // paddingLeft: '55px !important',
    position: "relative",
    height: "36px",
    marginRight: theme.spacing(2),
    marginTop: "0px",
    [theme.breakpoints.up("sm")]: {
      marginLeft: "20px",
      width: "auto",
    },

    [theme.breakpoints.up("md")]: {
      marginLeft: 0,
      position: "absolute",
      width: "300px",
      height: "40px",
      right: "350px",
    },
  },
  spanHover: {
    "&:hover": {
      cursor: "pointer",
    },
  },
  menuIcon: {
    height: "24px",
    width: "28px",
  },
  mRight: {
    marginRight: "10px",
  },
  iconImage: {
    display: "flex",
    justifyContent: "center",
    height: "45px",
    width: "45px",
    borderRadius: "50%",
  },
  badge: {
    marginTop: "-5px",
    marginRight: "-10px",
  },
  profileIcon: {
    marginTop: "7px !important",
    marginLeft: "20px",
    marginRight: "10px",
    height: "30px",
    width: "30px",
  },
  menuItem: {
    fontSize: "16px",
    color: "black",
    height: "50px",
    fontWeight: "550",
    padding: "25px 20px",
  },
  notsIcon: {
    position: "absolute",
    top: "-10px",
    left: "-15px",
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
      // textOverflow: 'ellipsis !important',
      color: "white !important",
      fontSize: "14px",
      opacity: 1,
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
  appBar: {
    zIndex: "1200 !important",
    width: "100%",
    position: "fixed",
    height: "80px",
    paddingTop: "8px",
    alignItems: "center",
    justifyContent: "center",
    // background: 'linear-gradient(90deg, #3D83B5 0%, #70D99F 100%)',
    background: "#ffffff",
    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    [theme.breakpoints.up("md")]: {
      justifyContent: "normal",
      alignItems: "normal",
    },
  },
  appBarShift: {
    // paddingLeft: drawerWidth,
    width: "100%",
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  toolTip: {
    height: "20px",
    width: "20px",
    position: "absolute",
    right: "24% !important",
    top: "-20px",
    transform: "rotate(-45deg)",
    background: "white",
    borderTopRightRadius: "4px",
  },
  overFlowMenu: {
    overflow: "visible !important",
  },
  overFlowMenu1: {
    overflow: "visible !important",
    width: "125px",
    padding: "10px 0px",
    borderRadius: "5px",
  },
  mobileMenu: {
    marginTop: "22px",
    position: "absolute",
    minWidth: "200px !important",
    marginLeft: "25px",
    transition: "none !important",
    overflow: "visible !important",
  },
}));

const notficationStyles = makeStyles((theme) => ({
  typography: {
    padding: theme.spacing(2),
  },
  overFlowMenu: {
    overflow: "visible !important",
    marginTop: "18px",
  },
  toolTip: {
    height: "20px",
    width: "20px",
    position: "absolute",
    right: "19% !important",
    top: "-10px",
    borderTopRightRadius: "4px",
    transform: "rotate(-45deg)",
    background: "white",
  },
  notificationBox: {
    overflow: "scroll !important",
    width: "425px",
    height: "494px",
  },
  mark: {
    fontStyle: "normal",
    fontWeight: 500,
    fontSize: "13px",
    marginLeft: "10px",
  },
  link: {
    color: "#5200FF",
    fontStyle: "normal",
    fontWeight: 450,
    fontSize: "12px",
    textDecoration: "underline",
    cursor: "pointer",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #cecece",
    padding: "10px",
  },
  flexBox: {
    height: "60px",
    display: "flex",
    padding: "15px 20px !important",
    boxSizing: "border-box",
    borderBottom: "1px solid #cecece",
  },
  backgroundGrey: {
    backgroundColor: "#f3f3f3",
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
    fontSize: "13px",
    opacity: 0.5,
  },
  notTime: {
    fontSize: "15px",
    fontWeight: "550",
  },
  notDescpription: {
    fontWeight: 550,
    fontSize: "16px",
  },
  icon: {
    marginRight: "10px !important",
    marginTop: "-2px",
  },
}));

export { useStyles, notficationStyles };

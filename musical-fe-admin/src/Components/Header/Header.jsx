import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Icon,
  InputBase,
  Badge,
  Box,
  Fade,
  MenuItem,
  Menu,
  Button,
  Tooltip,
} from "@material-ui/core";
import { AccountCircle, MoreVert, Mail } from "@material-ui/icons";
import { useNavigate } from "react-router";
// import MetaMaskOnboarding from '@metamask/onboarding';
// import { useWeb3React } from '@web3-react/core';

// import { useEagerConnect, useInactiveListener } from '../../hooks';
// import { injected } from '../../utils/connectors';
// import Metamask from '../../Assets/Images/metamask.png';
import { useStyles } from "./HeaderStyles";
import Notification from "./Components/Notification";
import { ReactComponent as MenuIcon } from "../../Assets/Svg/Header/menubar.svg";
import { ReactComponent as NotificationsIcon } from "../../Assets/Svg/Header/bellicon.svg";
// import { ReactComponent as SearchIcon } from '../../Assets/Svg/Header/searchIcon.svg';
import ProfileImage from "../../Assets/Images/profileIcon.jpg";
import AdminLogo from "../../Assets/Images/Logo.webp";
import ConfirmationModal from "Components/Modal/ConfirmationModal";

const menuId = "primary-search-account-menu";
const mobileMenuId = "primary-search-account-menu-mobile";

export default function Sidebar({
  // eslint-disable-next-line react/prop-types
  open,
  handleDrawerOpen,
  handleDrawerClose,
  headerText,
  setMetamaskSuccessPopup,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [openLogoutConfirmation, setOpenLogoutConfirmation] = useState(false);
  // const [activatingConnector, setActivatingConnector] = useState();
  // const {
  //   account, activate, connector, active: walletActive, deactivate,
  // } = useWeb3React();
  // const onboarding = useRef();
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const classes = useStyles();
  const navigate = useNavigate();

  // const triedEager = useEagerConnect();

  // useInactiveListener(!triedEager || !!activatingConnector);

  // useEffect(() => {
  //   if (!onboarding.current) {
  //     onboarding.current = new MetaMaskOnboarding();
  //   }
  // }, []);

  // useEffect(() => {
  //   if (activatingConnector && activatingConnector === connector) {
  //     setActivatingConnector(undefined);
  //   }
  // }, [activatingConnector, connector]);

  // useEffect(() => {
  //   if (account && walletActive) {
  //     console.log('Account', account, walletActive);
  //   }
  //   if (MetaMaskOnboarding.isMetaMaskInstalled()) {
  //     if (account && account.length > 0) {
  //       onboarding.current.stopOnboarding();
  //     } else {
  //       // setMetamaskButtonText(CONNECT_TEXT);
  //     }
  //   }
  // }, [account]);

  // eslint-disable-next-line no-unused-vars
  // const onConnectWithMetamaskClick = async () => {
  //   if (MetaMaskOnboarding.isMetaMaskInstalled()) {
  //     setActivatingConnector(injected);
  //     await activate(injected);
  //     setMetamaskSuccessPopup(true);
  //   } else {
  //     onboarding.current.startOnboarding();
  //   }
  // };

  // eslint-disable-next-line no-unused-vars
  // const handleDisconnectWalletClick = () => {
  //   console.log('Wallet Disconnected');
  //   localStorage.setItem('shouldEagerConnect', false);
  //   deactivate();
  // };

  const handleClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = (from) => {
    setAnchorEl(null);
    if (from === "logout") {
      localStorage.removeItem("auth-token");
      navigate("/login");
    }
    handleMobileMenuClose();
  };

  const confirmLogout = () => {
    handleMenuClose("logout");
    setOpenLogoutConfirmation(false);
  };

  const renderMenu = (
    <Box className={classes.overFlowMenu}>
      <Menu
        id="fade-menu"
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transitioncomponent={Fade}
        className={classes.mobileMenu}
        keepMounted
        classes={{
          paper: classes.overFlowMenu1,
        }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        {isMenuOpen && (
          <Box className={classes.toolTip} transitioncomponent={Fade} />
        )}
        <MenuItem
          className={classes.menuItem}
          onClick={() => {
            handleMenuClose("profile");
            navigate("/admin/profile");
          }}
        >
          My Profile
        </MenuItem>
        <MenuItem
          className={classes.menuItem}
          // onClick={() => handleMenuClose("logout")}
          onClick={() => setOpenLogoutConfirmation(true)}
        >
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      {/* <MenuItem>
        <IconButton aria-label="show 4 new mails" color="inherit">
          <Badge badgeContent={4} color="secondary">
            <Mail />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem>
        <IconButton aria-label="show 11 new notifications" color="inherit">
          <Badge badgeContent={11} color="secondary">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <Notification notificationAnchorEl={notificationAnchorEl} handleClose={handleClose} /> */}
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  return (
    <>
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, classes.sectionDesktop, {
          [classes.appBarShift]: open,
        })}
        // title={<img src={LOGO} alt="noimage" />}
      >
        <Toolbar>
          <Box
            style={{
              marginRight: "50px",
              background: "white",
              padding: "10px",
              borderRadius: "50px",
            }}
          >
            <img src={AdminLogo} alt="large-logo" height={45} />
          </Box>
          {!open && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              className={classes.primaryBtn}
            >
              <MenuIcon />
            </IconButton>
          )}
          {open && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerClose}
              edge="start"
              className={classes.primaryBtn}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            className={`${classes.sectionDesktop} ${classes.headerTitle}`}
            noWrap
          >
            {headerText}
          </Typography>
          {/* <div className={`${classes.wallet}`}>
            {account ? (
              <Tooltip title="Disconnect Wallet">
                <Button
                  variant="contained"
                  className={classes.spanHover}
                  onClick={() => handleDisconnectWalletClick()}
                  style={{ background: 'linear-gradient(90deg, #c9c9c9 0%, #3D83B5 100%)', color: 'white' }}
                >
                  <img alt="imageAlt" src={Metamask} />
                  <Typography style={{ marginLeft: '20px' }}>
                    {' '}
                    {`${account.slice(0, 4)}...${account.slice(-4)}`}
                  </Typography>
                </Button>
              </Tooltip>
            )
              : (
                <Button variant="contained" style={{ background: 'linear-gradient(90deg, #c9c9c9 0%, #3D83B5 100%)', color: 'white' }} onClick={() => onConnectWithMetamaskClick()}>
                  <img alt="imageAlt" src={Metamask} />
                  <Typography style={{ marginLeft: '20px' }}>Connect Wallet</Typography>
                </Button>
              )}
          </div> */}
          {/* <div className={`${classes.search}`}>
            <div className={`${classes.searchIcon}`}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder="Search"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'search' }}
            />
          </div> */}
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            {/* <Tooltip title="Notifications"> */}
            {/* <IconButton aria-label="show 17 new notifications" onClick={handleClick} className={`${classes.mRight} header-right-icon`} color="inherit">
              <Badge variant="dot" color="secondary" className={classes.badge}>
                <NotificationsIcon className={classes.notsIcon} />
              </Badge>
            </IconButton> */}
            {/* </Tooltip> */}
            {/* <Tooltip title="Profile"> */}
            <IconButton
              className={`${classes.profileIcon} header-right-icon`}
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Icon className={classes.iconImage}>
                <img alt="imageAlt" src={ProfileImage} />
              </Icon>
            </IconButton>
            {/* </Tooltip> */}
          </div>
          <div className={classes.sectionMobile}>
            <IconButton
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="black"
            >
              <MoreVert color="black" />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, classes.sectionMobile, {
          [classes.appBarShift]: false,
        })}
      >
        <Toolbar>
          {!open && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              className={classes.primaryBtn}
            >
              <MenuIcon />
            </IconButton>
          )}
          {open && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              className={classes.primaryBtn}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            className={`${classes.sectionDesktop} ${classes.headerTitle}`}
            noWrap
          >
            {headerText}
          </Typography>
          {/* <div className={`${classes.wallet}`}>
            {account ? (
              <span
                title="Disconnect"
                role="button"
                tabIndex={0}
                onKeyDown={handleDisconnectWalletClick}
                className={classes.spanHover}
                onClick={() => handleDisconnectWalletClick()}
              >
                {`${account.slice(0, 4)}...${account.slice(-4)}`}
              </span>
            ) : (
              <Button
                variant="contained"
                style={{ background: 'linear-gradient(90deg, #c9c9c9 0%, #3D83B5 100%)', color: 'white' }}
                onClick={() => onConnectWithMetamaskClick()}
              >
                Connect Wallet
              </Button>
            )}
          </div> */}
          {/* <div className={`${classes.search}`}>
            <div className={`${classes.searchIcon}`}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder="Search"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'search' }}
            />
          </div> */}
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            <IconButton
              aria-label="show 17 new notifications"
              onClick={handleClick}
              className="header-right-icon"
              color="inherit"
            >
              <Badge badgeContent={17} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton
              className="header-right-icon"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </div>
          <div className={classes.sectionMobile}>
            <IconButton
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreVert />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
      {openLogoutConfirmation && (
        <ConfirmationModal
          handleClose={() => setOpenLogoutConfirmation(false)}
          open={openLogoutConfirmation}
          heading="Logout"
          subtitle={`Are you sure you want to logout?`}
          button1="Cancel"
          button2="Confirm"
          onButton1Click={() => setOpenLogoutConfirmation(false)}
          onButton2Click={confirmLogout}
        />
      )}
    </>
  );
}

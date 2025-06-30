import React from 'react';
import { Outlet } from 'react-router-dom';
import { styled } from '@material-ui/core/styles';

import Header from 'Components/Header/Header';
import Sidebar from 'Components/Sidebar/Sidebar';
import WalletConnectedPopup from 'Components/Modal/MetaMaskSuceessModal';

const RootStyle = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden',
});

const MainStyle = styled('div')(({ theme }) => ({
  flexGrow: 1,
  backgroundColor: 'white !important',
  overflow: 'auto',
  minHeight: '100%',
  paddingTop: '110px',
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('lg')]: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

const DashboardLayout = () => {
  const [open, setOpen] = React.useState(true);
  const [headerText, setHeaderText] = React.useState('Dashboard');
  const [metamaskSuccessPopup, setMetamaskSuccessPopup] = React.useState(false);

  const changeHeaderText = (text) => {
    setHeaderText(text);
  };
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleClose = () => {
    setMetamaskSuccessPopup(false);
  };

  React.useEffect(() => {
    if (metamaskSuccessPopup) {
      setTimeout(() => {
        setMetamaskSuccessPopup(false);
      }, 2000);
    }
  }, [metamaskSuccessPopup]);
  return (
    <>
      <RootStyle>
        <Header
          handleDrawerOpen={handleDrawerOpen}
          setMetamaskSuccessPopup={setMetamaskSuccessPopup}
          handleDrawerClose={handleDrawerClose}
          open={open}
          headerText={headerText}
        />
        <Sidebar open={open} setHeaderText={changeHeaderText} />
        <MainStyle>
          <Outlet />
          <WalletConnectedPopup open={metamaskSuccessPopup} handleClose={handleClose} />
        </MainStyle>
      </RootStyle>
    </>
  );
};

export default DashboardLayout;

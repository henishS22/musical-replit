import React, { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useEagerConnect, useInactiveListener } from 'hooks';
import Router from 'Routes';

function App() {
  const [activatingConnector, setActivatingConnector] = useState();
  const { connector, active } = useWeb3React();

  const triedEager = useEagerConnect();
  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  useInactiveListener(!triedEager || !!activatingConnector);

  if (active) {
    localStorage.setItem('shouldEagerConnect', true);
  }
  return (
    <>
      <Router />
    </>
  );
}

export default App;

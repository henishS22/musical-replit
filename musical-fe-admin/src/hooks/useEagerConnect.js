import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';

import { injected } from 'utils/connectors';

const useEagerConnect = () => {
  const { activate, active } = useWeb3React();

  const [tried, setTried] = useState(false);

  useEffect(() => {
    const shouldEagerConnect = localStorage.getItem('shouldEagerConnect');

    if (shouldEagerConnect === 'false') {
      return;
    }

    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true);
        });
      } else {
        setTried(true);
      }
    });
  }, [activate]);

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && active) {
      setTried(true);
    }
  }, [tried, active]);

  return tried;
};

export default useEagerConnect;

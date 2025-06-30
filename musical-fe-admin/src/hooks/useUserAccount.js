import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';

function UseUserAccount() {
  const [account, setAccount] = useState(null);
  const [currentLibrary, setCurrentLibrary] = useState(null);
  const {
  account: metamaskAccount, active, error, library,
  } = useWeb3React();
  useEffect(() => {
    if (active && metamaskAccount) {
      setAccount(metamaskAccount);
      setCurrentLibrary(library);
    }

    if (!metamaskAccount) {
      setAccount(null);
      setCurrentLibrary(null);
    }
  }, [active, error, account, metamaskAccount, library]);
  return { account, currentLibrary };
}

export default UseUserAccount;

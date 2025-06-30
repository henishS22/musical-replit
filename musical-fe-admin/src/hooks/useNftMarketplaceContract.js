import MarketPlace from 'contracts/MarketPlace.json';
import useContract from './useContract';

const useMarketplaceContract = () => (
  useContract(process.env.REACT_APP_NFT_MARKETPLACE_MAINNET_CONTRACT_ADDRESS,
    MarketPlace.abi, true));

export default useMarketplaceContract;

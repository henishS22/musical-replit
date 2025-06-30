import NFTMTV from 'contracts/NFTMtv.json';
import useContract from './useContract';

const useNFTMTVContract = () => (
  useContract(process.env.REACT_APP_NFT_MTV_RINKBY_CONTRACT_ADDRESS, NFTMTV.abi, true));

export default useNFTMTVContract;

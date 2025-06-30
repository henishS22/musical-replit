import Abi from '../contracts/LydiaStable.json';
import useContract from './useContract';

const useLydiaStableContract = () => (
  useContract(process.env.REACT_APP_LYDIA_STABLE_COIN_CONTRACT_ADDRESS,
    Abi.abi, true));

export default useLydiaStableContract;

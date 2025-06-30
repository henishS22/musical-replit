import Abi from '../contracts/LydiaMultiSign.json';
import useContract from './useContract';

const useLydiaMultiSignContract = () => (
  useContract(process.env.REACT_APP_LYDIA_MULTISIGN_TOKEN_CONTRACT_ADDRESS,
    Abi.abi, true));

export default useLydiaMultiSignContract;

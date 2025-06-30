import Abi from '../contracts/LydiaToken.json';
import useContract from './useContract';

const useLydiaToenContract = () => (
  useContract(process.env.REACT_APP_LYDIA_TOKEN_CONTRACT_ADDRESS,
    Abi.abi, true));

export default useLydiaToenContract;

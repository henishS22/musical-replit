import Abi from '../contracts/LydiaDistribution.json';
import useContract from './useContract';

const useLydiaDistributionContract = () => (
  useContract(process.env.REACT_APP_LYDIA_TOKEN_DISTRIBUTION_CONTRACT_ADDRESS,
    Abi.abi, true));

export default useLydiaDistributionContract;

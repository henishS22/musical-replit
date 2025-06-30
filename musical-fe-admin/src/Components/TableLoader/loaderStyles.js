import { makeStyles } from '@material-ui/core/styles';

const loaderStyles = makeStyles(() => ({
  mainComponent: {
    height: '70vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
}));

// eslint-disable-next-line import/prefer-default-export
export { loaderStyles };

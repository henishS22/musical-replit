import React from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { ReactComponent as LoopIcon } from 'Assets/Svg/loopIcon.svg';
import CustomExpandMore from 'Components/DropDownIcon/ArrowDown';
import { topBarStyles } from '../dashboardStyles';

export default function SimpleSelect() {
  const classes = topBarStyles();
  const [option, setOption] = React.useState('');

  const handleChange = (event) => {
    setOption(event.target.value);
  };
  const handleReload = () => {
    console.log('called');
  };
  return (
    <div className={classes.mainDiv}>
      <FormControl
        variant="outlined"
        className={classes.formControl}
        size="small"
      >
        <InputLabel
          id="demo-simple-select-outlined-label"
          className={classes.dropDown}
        >
          Last Week
        </InputLabel>
        <Select
          labelId="demo-simple-select-outlined-label"
          id="demo-simple-select-outlined"
          className={classes.selectTag}
          label="Last Week"
          value={option}
          onChange={handleChange}
          IconComponent={CustomExpandMore}
          MenuProps={{ classes: { paper: classes.dropdownStyle } }}
        >
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </FormControl>
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
        onClick={handleReload}
      >
        <LoopIcon className={classes.loopIcon} />
        <Typography className={classes.loopText}>
          Reload Data
        </Typography>
      </Button>
    </div>
  );
}

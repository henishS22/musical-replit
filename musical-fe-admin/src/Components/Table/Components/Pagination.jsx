/* eslint-disable react/prop-types */
import {
  Box, Typography, InputBase, Icon,
} from '@material-ui/core';
import React from 'react';
import { paginationStyles } from '../tableStyles';
import RightArrow from '../../../Assets/Svg/rightArrow.svg';
import LeftArrow from '../../../Assets/Svg/leftArrow.svg';

function Pagination({
  currentPage, handlePrevPage, handleNextPage,pageInfo
}) {
  const classes = paginationStyles();
  return (
    <Box className={classes.box}>
      <Typography className={classes.title}>Page</Typography>
      <InputBase
        readOnly
        placeholder="1"
        value={currentPage + 1}
        className={classes.input}
        inputProps={{ "aria-label": "search" }}
      />
      <Icon
        className={`${classes.arrowBox} ${
          pageInfo.hasPreviousPage ? classes.arrowBox : classes.disabledArrowBox
        }`}
        onClick={handlePrevPage}
      >
        <img alt="imageAlt" className={classes.icon} src={LeftArrow} />
      </Icon>
      <Icon
        className={`${
          pageInfo.hasNextPage ? classes.arrowBox : classes.disabledArrowBox
        }`}
        onClick={handleNextPage}
      >
        <img alt="imageAlt" className={classes.icon} src={RightArrow} />
      </Icon>
    </Box>
  );
}

export default Pagination;

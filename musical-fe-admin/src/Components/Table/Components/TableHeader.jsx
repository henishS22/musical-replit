/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/require-default-props */
import React from 'react';
import PropTypes from 'prop-types';
import {
  TableRow, TableCell, TableHead, TableSortLabel,
} from '@material-ui/core';
import { tableHeaderStyles } from '../tableStyles';

export default function UserListHead({
  // eslint-disable-next-line no-unused-vars
  rowCount,
  headLabel,
}) {
  const classes = tableHeaderStyles();
  return (
    <TableHead className={classes.header}>
      <TableRow>
        {headLabel.map((headCell) => {
          if (headCell.id === 'actions') {
            const {
              read, edit, remove, add,
            } = headCell.flag;
            if (!read && !edit && !remove && !add) return <></>;

            return (
              <TableCell
                className={classes.headerTitle}
                key={headCell.id}
                align={headCell.alignRight ? 'right' : 'left'}
              >
                <TableSortLabel
                  hideSortIcon
                >
                  {headCell.label}
                </TableSortLabel>
              </TableCell>
            );
          }
          if (headCell.flag === 'viewCollectiblepaymentMethod') {
            return (
              <TableCell
                className={classes.headerTitle}
                key={headCell.id}
                align="center"
              >
                <TableSortLabel
                  hideSortIcon
                >
                  {headCell.label}
                </TableSortLabel>
              </TableCell>
            );
          }
          return (
            <TableCell
              className={classes.headerTitle}
              key={headCell.id}
              align={headCell.alignRight ? 'right' : 'left'}
            >
              <TableSortLabel
                hideSortIcon
              >
                {headCell.label}
              </TableSortLabel>
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
}

UserListHead.propTypes = {
  rowCount: PropTypes.number,
  headLabel: PropTypes.array,
};

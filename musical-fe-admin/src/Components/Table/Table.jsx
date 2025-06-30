/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState } from "react";
import moment from "moment";
import {
  Table,
  TableRow,
  TableBody,
  Icon,
  TableCell,
  TableContainer,
  Select,
  MenuItem,
} from "@material-ui/core";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import Read from "../../Assets/Svg/view.svg";
import Edit from "../../Assets/Svg/edit.svg";
import Delete from "../../Assets/Svg/delete.svg";
import { tableStyles } from "./tableStyles";
import Pagination from "./Components/Pagination";
import Switch from "./Components/Switch";
import TableHeader from "./Components/TableHeader";
import { useNavigate } from "react-router";

function MainTable({
  USERLIST,
  TABLE_HEAD,
  handleNextPage,
  handlePreviousPage,
  page = 1,
  setPage,
  noPagination,
  data,
  pageInfo
}) {
  const classes = tableStyles();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();
  const isTrue = USERLIST?.length % rowsPerPage === 0;
  const maxPage = isTrue
    ? parseInt(USERLIST?.length / rowsPerPage, 10)
    : parseInt(USERLIST?.length / rowsPerPage, 10) + 1;

  const formatHash = (hash) => {
    if (hash === "N/A") {
      return hash;
    }
    return hash?.slice(0, 7) + "..." + hash?.slice(-5);
  };

  return (
    <>
      <TableContainer className={classes.mainBox}>
        <Table>
          <TableHeader headLabel={TABLE_HEAD} rowCount={USERLIST?.length} />
          <TableBody>
            {USERLIST?.map((row, index) => {
              const { id } = row;
              const finalClass =
                index % 2 === 0
                  ? classes.box
                  : `${classes.box} ${classes.backgroundGrey}`;
              return (
                <TableRow
                  hover
                  key={id}
                  tabIndex={-1}
                  role="checkbox"
                  className={finalClass}
                >
                  {TABLE_HEAD?.map((value, tindex) => {
                    const val = value.id;
                    const pageIndex = index;
                    if (tindex === 0) {
                      return (
                        <TableCell
                          key={value.id}
                          className={classes.content}
                          align="left"
                        >
                          {page * rowsPerPage + index + 1}
                        </TableCell>
                      );
                    }
                    if (
                      val === "status" ||
                      val === "isActive" ||
                      val === "isPublished"
                    ) {
                      return (
                        <TableCell
                          key={value.id}
                          className={classes.content}
                          align="left"
                        >
                          <Switch status={USERLIST[pageIndex][val]} />
                        </TableCell>
                      );
                    }
                    if (val === "countryCode") {
                      return (
                        <TableCell
                          key={value.id}
                          className={classes.content}
                          align="left"
                        >{`${row?.countryCode} ${row?.mobile}`}</TableCell>
                      );
                    }

                    // if (val === 'wallet') {
                    //   const walletId = USERLIST[pageIndex][val];
                    //   return <TableCell key={value.id} className={classes.content} align="left">{USERLIST[pageIndex] && walletId ? `${walletId?.slice(0, 8)}...` : 'N/A'}
                    //   </TableCell>;
                    // }

                    //projectlist
                    if (val === "projectName") {
                      const userlist = row.name;
                      return (
                        <TableCell
                          key={value.id}
                          className={classes.content}
                          align="left"
                        >
                          {userlist}
                        </TableCell>
                      );
                    }

                    if (val === "music") {
                      const userlist = row.music;
                      return (
                        <TableCell
                          key={value.id}
                          className={classes.content}
                          align="left"
                        >
                          {userlist}
                        </TableCell>
                      );
                    }

                    if (val === "mintedMusics") {
                      const userlist = row.minted_music;
                      return (
                        <TableCell
                          key={value.id}
                          className={classes.content}
                          align="left"
                        >
                          {userlist}
                        </TableCell>
                      );
                    }

                    if (val === "collaborators") {
                      const userlist = row.collaborations;
                      return (
                        <TableCell
                          key={value.id}
                          className={classes.content}
                          align="left"
                        >
                          {userlist && userlist.length > 0 ? userlist : "NA"}
                        </TableCell>
                      );
                    }

                    if (val === "createdBy") {
                      return (
                        <TableCell
                          key={value.id}
                          className={classes.content}
                          align="left"
                        >
                          {USERLIST[pageIndex] &&
                            USERLIST[pageIndex][val]?.fullName}
                        </TableCell>
                      );
                    }
                    if (val === "createdById") {
                      return (
                        <TableCell
                          key={value.id}
                          className={classes.content}
                          align="left"
                        >
                          {USERLIST[pageIndex] &&
                            USERLIST[pageIndex][val]?.fullName}
                        </TableCell>
                      );
                    }
                    if (val === "createdByUsername" || val === "currentOwner") {
                      const account = USERLIST[pageIndex][value.flag]?.wallet;
                      return (
                        <TableCell
                          key={value.id}
                          className={classes.content}
                          align="left"
                        >
                          <a
                            href={`${
                              process.env.REACT_APP_FRONT_END_POINT_URL_DEV
                            }/artist-profile/${
                              USERLIST[pageIndex][value.flag]?.id
                            }`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              padding: 0,
                              textDecoration: "underline",
                              margin: 0,
                            }}
                          >
                            {account
                              ? `${account?.slice(0, 4)}...${account?.slice(
                                  -4
                                )}`
                              : "----"}
                          </a>
                        </TableCell>
                      );
                    }
                    if (val === "isStatus") {
                      return (
                        <TableCell
                          key={value.id}
                          className={classes.content}
                          align="left"
                        >
                          {USERLIST[pageIndex] &&
                            USERLIST[pageIndex][value.flag]}
                        </TableCell>
                      );
                    }
                    if (val === "isPublishByAdmin") {
                      return (
                        <TableCell
                          key={value.id}
                          className={classes.content}
                          align="left"
                        >
                          {USERLIST[pageIndex] &&
                            USERLIST[pageIndex][value.flag] ? "Yes" : "No"}
                        </TableCell>
                      );
                    }
                    if (val === "createdAt") {
                      return (
                        <TableCell
                          key={value.id}
                          className={classes.content}
                          align="left"
                        >
                          {(USERLIST[pageIndex] &&
                            moment(USERLIST[pageIndex][val]).format(
                              "DD/MM/YYYY HH:mm"
                            )) ||
                            "Invalid Date"}
                        </TableCell>
                      );
                    }

                    if (val === "updatedAt") {
                      return (
                        <TableCell
                          key={value.id}
                          className={classes.content}
                          align="left"
                        >
                          {USERLIST[pageIndex] &&
                            moment(USERLIST[pageIndex][val]).format(
                              "MM/DD/YYYY HH:mm"
                            )}
                        </TableCell>
                      );
                    }
                    if (val === "roleCreatedBy") {
                      return (
                        <TableCell
                          key={value.id}
                          className={classes.content}
                          align="left"
                        >
                          {USERLIST[pageIndex] &&
                            moment(USERLIST[pageIndex]?.createdAt)
                              .local()
                              .format("MM/DD/YYYY HH:mm")}
                        </TableCell>
                      );
                    }
                    if (
                      value.flag === "adminRole" ||
                      value.flag === "collection"
                    ) {
                      return (
                        <TableCell
                          key={value.id}
                          className={classes.content}
                          align="left"
                        >
                          {USERLIST[pageIndex] && USERLIST[pageIndex][val]?.name
                            ? USERLIST[pageIndex][val]?.name
                            : "----"}
                        </TableCell>
                      );
                    }
                    if (value.flag === "viewCollectiblepaymentMethod") {
                      return (
                        <TableCell
                          key={value.id}
                          className={classes.content}
                          align="center"
                        >
                          {USERLIST[tindex][val]}
                        </TableCell>
                      );
                    }
                    if (
                      value.flag === "txnHash" ||
                      value.flag === "owner" ||
                      value.flag === "creator" ||
                      value.flag === "collectibleName"
                    ) {
                      return (
                        <TableCell
                          key={value.id}
                          className={
                            row?.token?.transactionHash
                              ? classes.contentLink
                              : classes.content
                          }
                          align="left"
                        >
                          <a
                            href={
                              row?.token?.transactionHash &&
                              `https://lydia-testnet-native.cloud.blockscout.com/tx/${row?.token?.transactionHash}`
                            }
                            target="_blank"
                          >
                            {row?.token?.transactionHash
                              ? formatHash(row?.token?.transactionHash)
                              : "N/A"}
                          </a>
                        </TableCell>
                      );
                    }
                    if (value.flag === "txnHashValidate") {
                      return (
                        <TableCell
                          key={value.id}
                          className={
                            row?.gift?.token?.transactionHash ||
                            row?.token?.transactionHash
                              ? classes.contentLink
                              : classes.content
                          }
                          align="left"
                        >
                          <a
                            href={
                              row?.gift?.token?.transactionHash
                                ? row?.gift?.token?.transactionHash
                                : row?.token?.transactionHash &&
                                  `https://lydia-testnet-native.cloud.blockscout.com/tx/${
                                    row?.gift?.token?.transactionHash
                                      ? row?.gift?.token?.transactionHash
                                      : row?.token?.transactionHash
                                  }`
                            }
                            target="_blank"
                          >
                            {row?.gift?.token?.transactionHash
                              ? formatHash(
                                  row?.gift?.token?.transactionHash || "N/A"
                                )
                              : formatHash(
                                  row?.token?.transactionHash || "N/A"
                                ) || "N/A"}
                          </a>
                        </TableCell>
                      );
                    }
                    if (value.flag === "tokenAmount") {
                      return (
                        <TableCell
                          key={value.id}
                          className={classes.content}
                          align="left"
                        >
                          {row?.token?.amount
                            ? `${row?.token?.amount} ${row?.token?.symbol}`
                            : "N/A"}
                          {}
                        </TableCell>
                      );
                    }
                    if (value.flag === "amount") {
                      return (
                        <TableCell
                          key={value.id}
                          className={classes.content}
                          align="left"
                        >
                          {row?.amount
                            ? `${row?.amount} ${row?.currency}`
                            : "N/A"}
                          {}
                        </TableCell>
                      );
                    }
                    if (value.flag === "variableType") {
                      return (
                        <TableCell
                          key={value.id}
                          className={classes.content}
                          align="left"
                        >
                          {row?.name === "Platform_Fee"
                            ? "Platform Fee"
                            : "Nominee Transfer"}
                          {}
                        </TableCell>
                      );
                    }
                    if (value.flag === "variableValue") {
                      return (
                        <TableCell
                          key={value.id}
                          className={classes.content}
                          align="left"
                        >
                          {row?.name === "Platform_Fee" ? (
                            `${data?.variables?.variables[0]?.value} USD`
                          ) : (
                            <div>
                              {`${data?.variables?.variables[1]?.name}: ${data?.variables?.variables[1]?.value}`}{" "}
                              Days, <br />
                              {`${data?.variables?.variables[2]?.name}: ${data?.variables?.variables[2]?.value}`}{" "}
                              Days, <br />
                              {`${data?.variables?.variables[3]?.name}: ${data?.variables?.variables[3]?.value}`}{" "}
                              Days, <br />
                              {`${data?.variables?.variables[4]?.name}: ${data?.variables?.variables[4]?.value}`}{" "}
                              Days, <br />
                              {`${data?.variables?.variables[5]?.name}: ${data?.variables?.variables[5]?.value}`}{" "}
                              Days, <br />
                            </div>
                          )}
                        </TableCell>
                      );
                    }

                    if (value.flag === "tokenIdWithLink") {
                      return (
                        <TableCell
                          key={value.id}
                          className={classes.content}
                          align="left"
                        >
                          <a
                            href="https://etherscan.io/address/0x9f7dd5ea934d188a599567ee104e97fa46cb4496#tokentxns"
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              padding: 0,
                              textDecoration: "none",
                              margin: 0,
                            }}
                          >
                            {USERLIST[pageIndex][val]}{" "}
                          </a>
                        </TableCell>
                      );
                    }
                    if (val === "actions" || val === "nomineeStatus") {
                      const { read, edit, remove, add } = value.flag || "";
                      const {
                        handleViewButton,
                        handleEditButton,
                        handleDeleteButton,
                        handleAddButton,
                      } = value?.callback || "";
                      if (!read && !edit && !remove && !add) return <></>;
                      return (
                        <TableCell
                          key={value.id}
                          className={classes.content}
                          align="left"
                        >
                          {read && (
                            <Icon
                              onClick={() =>
                                value.alt === "data"
                                  ? handleViewButton(row)
                                  : handleViewButton(row._id ? row._id : row.id)
                              }
                            >
                              <img
                                alt="imageAlt"
                                className={classes.iconRead}
                                src={Read}
                              />
                            </Icon>
                          )}
                          {edit && (
                            <Icon
                              onClick={() =>
                                handleEditButton(row?.id ? row?.id : row?.name)
                              }
                            >
                              <img
                                alt="imageAlt"
                                className={classes.iconEdit}
                                src={Edit}
                              />
                            </Icon>
                          )}
                          {remove && (
                            <Icon onClick={() => handleDeleteButton(row.id)}>
                              <img
                                alt="imageAlt"
                                className={classes.iconDelete}
                                src={Delete}
                              />
                            </Icon>
                          )}
                          {add && (
                            <Icon
                              style={{ cursor: "pointer" }}
                              onClick={() => handleAddButton(row.id)}
                            >
                              <AddCircleIcon />
                            </Icon>
                          )}
                        </TableCell>
                      );
                    }
                    return (
                      <TableCell
                        key={value.id}
                        className={classes.content}
                        // style={{ textTransform: "capitalize" }}
                        align="left"
                      >
                        {USERLIST[pageIndex][val] ? USERLIST[pageIndex][val] : "N/A" }
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {USERLIST.length > 0 && !noPagination && (
        <Pagination
          currentPage={page}
          maxPage={maxPage}
          handlePrevPage={handlePreviousPage}
          handleNextPage={handleNextPage}
          pageInfo={pageInfo}
        />
      )}
    </>
  );
}

export default MainTable;

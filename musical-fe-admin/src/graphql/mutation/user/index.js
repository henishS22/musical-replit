/* eslint-disable  */
import { gql } from "@apollo/client";

// User Management

export const VERIFY_USER = gql`
  mutation Mutation($input: Input!) {
    verifyUser(input: $input) {
      message
      status
    }
  }
`;

export const BLACKLIST_USER = gql`
  mutation Mutation($input: Input!) {
    blockUser(input: $input) {
      status
      message
    }
  }
`;

export const WHITELIST_USER = gql`
  mutation Mutation($input: Input!) {
    whiteListUser(input: $input) {
      message
      status
    }
  }
`;

export const BAN_USER = gql`
  mutation BanUser($input: BanUserInput!) {
    banUser(input: $input) {
      message
      status
    }
  }
`;

export const UPDATE_DISTRO_STATUS = gql`
  mutation Mutation(
    $input: UpdateStatusInput!
    $where: DistroWhereUpdateInput!
  ) {
    distroStatus(input: $input, where: $where) {
      message
      status
    }
  }
`;

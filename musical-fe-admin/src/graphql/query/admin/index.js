/* eslint-disable  */

import { gql } from "@apollo/client";

// Role Management

export const GET_ALL_ROLES = gql`
  query Roles(
    $orderBy: RoleOrderByInput!
    $after: String
    $before: String
    $first: Int
    $last: Int
    $filters: RoleWhereInput
  ) {
    roles(
      orderBy: $orderBy
      after: $after
      before: $before
      first: $first
      last: $last
      filters: $filters
    ) {
      edges {
        cursor
        node {
          id
          name
          isActive
          permissions {
            User {
              BAN
              GET
            }
            Subscription {
              ALL
            }
            Distro {
              ALL
            }
            Release {
              ALL
            }
            Quest {
              ALL
            }
            Gamification {
              ALL
            }
          }
          createdBy {
            id
            fullName
            email
            createdAt
            isBanned
          }
          createdAt
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;

export const GET_NEXT_ROLES_PAGE = gql`
  query Permissions(
    $first: Int
    $after: String
    $filters: RoleWhereInput
    $orderBy: RoleOrderByInput!
  ) {
    roles(first: $first, after: $after, filters: $filters, orderBy: $orderBy) {
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      edges {
        cursor
        node {
          id
          name
          isActive
          permissions {
            User {
              BAN
              GET
            }
            Subscription {
              ALL
            }
            Distro {
              ALL
            }
            Release {
              ALL
            }
            Quest {
              ALL
            }
            Gamification {
              ALL
            }
          }
          createdBy {
            id
            fullName
            email
            createdAt
            isBanned
          }
          createdAt
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;

export const GET_PREV_ROLES_PAGE = gql`
  query Permissions(
    $last: Int
    $before: String
    $filters: RoleWhereInput
    $orderBy: RoleOrderByInput!
  ) {
    roles(last: $last, before: $before, filters: $filters, orderBy: $orderBy) {
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      edges {
        cursor
        node {
          id
          name
          isActive
          permissions {
            User {
              BAN
              GET
            }
            Subscription {
              ALL
            }
            Distro {
              ALL
            }
            Release {
              ALL
            }
            Quest {
              ALL
            }
            Gamification {
              ALL
            }
          }
          createdBy {
            id
            fullName
            email
            createdAt
            isBanned
          }
          createdAt
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;

export const VIEW_ROLE = gql`
  query Query($roleId: String!) {
    role(id: $roleId) {
      id
      name
      isActive
      isBanned
      createdAt
      createdBy {
        id
        fullName
      }
      permissions {
        User {
          BAN
          GET
        }
        Subscription {
          ALL
        }
        Distro {
          ALL
        }
        Release {
          ALL
        }
        Quest {
          ALL
        }
        Gamification {
          ALL
        }
      }
    }
  }
`;

export const GET_ROLE_DETAILS = gql`
  query Role($roleId: String!) {
    role(id: $roleId) {
      id
      name
      isActive
      createdAt
      createdBy {
        id
        fullName
      }
      permissions {
        User {
          BAN
          GET
        }
        Subscription {
          ALL
        }
        Distro {
          ALL
        }
        Release {
          ALL
        }
        Quest {
          ALL
        }
        Gamification {
          ALL
        }
      }
    }
  }
`;

export const GET_DASHBOARD_DATA = gql`
  query Dashboard {
    dashboard {
      message
      status
      userdata
      projectData
      trackData
      subscription
      ipfsStorage
      dropboxStorage
      driveStorage
    }
  }
`;

export const SEARCH_ROLE = gql`
  query Query($filters: RoleWhereInput, $first: Int) {
    roles(filters: $filters, first: $first) {
      edges {
        cursor
        node {
          id
          name
          createdAt
          createdBy {
            fullName
            email
          }
          isActive
          permissions {
            User {
              BAN
              GET
            }
            Subscription {
              ALL
            }
            Distro {
              ALL
            }
            Release {
              ALL
            }
            Quest {
              ALL
            }
            Gamification {
              ALL
            }
          }
        }
      }
    }
  }
`;

// Admin Management

export const GET_ALL_ADMINS = gql`
  query Admins(
    $after: String
    $before: String
    $first: Int
    $last: Int
    $orderBy: AdminOrderByInput!
    $filters: AdminsWhereInput
  ) {
    admins(
      after: $after
      before: $before
      first: $first
      last: $last
      orderBy: $orderBy
      filters: $filters
    ) {
      edges {
        cursor
        node {
          id
          fullName
          email
          countryCode
          mobile
          isActive
          role {
            id
            name
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const GET_NEXT_ADMINS_PAGE = gql`
  query Admins(
    $orderBy: AdminOrderByInput!
    $first: Int
    $after: String
    $filters: AdminsWhereInput
  ) {
    admins(orderBy: $orderBy, first: $first, after: $after, filters: $filters) {
      edges {
        cursor
        node {
          id
          fullName
          email
          mobile
          countryCode
          profilePic
          role {
            id
            name
            isActive
          }
          createdAt
          isActive
          isVerified
          isBlocked
          isBanned
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;

export const GET_PREV_ADMINS_PAGE = gql`
  query Admins(
    $orderBy: AdminOrderByInput!
    $last: Int
    $before: String
    $filters: AdminsWhereInput
  ) {
    admins(orderBy: $orderBy, last: $last, before: $before, filters: $filters) {
      edges {
        cursor
        node {
          id
          fullName
          email
          mobile
          countryCode
          profilePic
          role {
            id
            name
            isActive
          }
          createdAt
          isActive
          isVerified
          isBlocked
          isBanned
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;

export const VIEW_ADMIN = gql`
  query Admin($adminId: String!) {
    admin(id: $adminId) {
      id
      fullName
      email
      permissions {
        User {
          BAN
          GET
        }
        Subscription {
          ALL
        }
        Distro {
          ALL
        }
        Release {
          ALL
        }
        Quest {
          ALL
        }
        Gamification {
          ALL
        }
      }
      mobile
      countryCode
      profilePic
      role {
        id
        name
        isActive
        createdAt
        permissions {
          User {
            BAN
            GET
          }
          Subscription {
            ALL
          }
          Distro {
            ALL
          }
          Release {
            ALL
          }
          Quest {
            ALL
          }
          Gamification {
            ALL
          }
        }
      }
      createdBy {
        id
        fullName
      }
      createdAt
      isActive
      isBanned
    }
  }
`;

export const GET_ADMIN_DETAILS = gql`
  query Admin($adminId: String!) {
    admin(id: $adminId) {
      id
      fullName
      email
      permissions {
        User {
          BAN
          GET
        }
        Subscription {
          ALL
        }
        Distro {
          ALL
        }
        Release {
          ALL
        }
        Quest {
          ALL
        }
        Gamification {
          ALL
        }
      }
      mobile
      countryCode
      profilePic
      role {
        id
        name
        isActive
        createdAt
        permissions {
          User {
            BAN
            GET
          }
          Subscription {
            ALL
          }
          Distro {
            ALL
          }
          Release {
            ALL
          }
          Quest {
            ALL
          }
          Gamification {
            ALL
          }
        }
      }
      createdBy {
        id
        fullName
      }
      createdAt
      isActive
      isBanned
    }
  }
`;

export const SEARCH_ADMIN = gql`
  query Admins($orderBy: AdminOrderByInput!, $first: Int) {
    admins(orderBy: $orderBy, first: $first) {
      edges {
        cursor
        node {
          id
          fullName
          email
          mobile
          countryCode
          profilePic
          role {
            id
            name
            isActive
            permissions {
              User {
                BAN
                GET
              }
              Subscription {
                ALL
              }
              Distro {
                ALL
              }
              Release {
                ALL
              }
              Quest {
                ALL
              }
              Gamification {
                ALL
              }
            }
          }
          createdAt
          isActive
          isVerified
          isBlocked
          isBanned
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;

// Admin Profile

export const ADMIN_PROFILE = gql`
  query Me {
    me {
      id
      fullName
      email
      mobile
      countryCode
      createdAt
      role {
        name
      }
    }
  }
`;

// Category Management
export const GET_ALL_CATEGORIES = gql`
  query Query(
    $first: Int
    $filters: CategoryWhereInput
    $orderBy: CategoryOrderByInput!
  ) {
    categories(first: $first, filters: $filters, orderBy: $orderBy) {
      edges {
        node {
          id
          name
          createdAt
          description
          createdBy {
            fullName
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;

export const GET_NEXT_CATEGORIES = gql`
  query Query(
    $first: Int
    $filters: CategoryWhereInput
    $orderBy: CategoryOrderByInput!
    $after: String
  ) {
    categories(
      first: $first
      filters: $filters
      orderBy: $orderBy
      after: $after
    ) {
      edges {
        node {
          id
          name
          createdAt
          description
          createdBy {
            fullName
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;

export const GET_PREV_CATEGORIES = gql`
  query Query(
    $first: Int
    $filters: CategoryWhereInput
    $orderBy: CategoryOrderByInput!
    $before: String
  ) {
    categories(
      first: $first
      filters: $filters
      orderBy: $orderBy
      before: $before
    ) {
      edges {
        node {
          id
          name
          createdAt
          description
          createdBy {
            fullName
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;

// User management
export const GET_ALL_USERS_ADMIN = gql`
  query Users(
    $orderBy: UserOrderByInput!
    $first: Int
    $filters: UsersWhereInput
    $after: String
    $before: String
    $last: Int
  ) {
    users(
      orderBy: $orderBy
      first: $first
      filters: $filters
      after: $after
      before: $before
      last: $last
    ) {
      edges {
        node {
          id
          email
          createdAt
          name
          wallets {
            addr
            provider
          }
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;
export const GET_ALL_USERS = gql`
  query Users(
    $orderBy: UserOrderByInput!
    $first: Int
    $filters: UsersWhereInput
  ) {
    users(orderBy: $orderBy, first: $first, filters: $filters) {
      edges {
        cursor
        node {
          id
          fullName
          username
          email
          description
          mobile
          address
          countryCode
          profilePic
          coverPic
          wallet
          createdAt
          socialLinks {
            facebook
            twitter
            instagram
            blog
            website
            discord
          }
          isVerified
          isBlocked
          isBanned
          isProfileDetailsUpdated
          isWhitelisted
          isRequestForwhitelist
          isCollectionAccess
          collectionAccessStatus
          rejectReason
          isRequestedCollectionAccess
          tags
          totalVolume
          totalCollections
          totalNfts
          floorPrice
          isPublic
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;
export const VIEW_USER = gql`
  query User($userId: String!) {
    user(id: $userId) {
      user {
        id
        fullName
        name
        email
        mobile
        isBanned
        wallets {
          addr
          provider
        }
        profile_img
      }
      totalProject
      totalMusicTracks
      storage
      projectList {
        name
        music
        minted_music
        createdAt
        updatedAt
        collaborations {
          invitedForProject
          roles
          user
          permission
          split
          accepted
        }
      }
    }
  }
`;

export const GET_ALL_USERS_ADMIN_NEXT = gql`
  query Users(
    $orderBy: UserOrderByInput!
    $first: Int
    $filters: UsersWhereInput
    $after: String
  ) {
    users(orderBy: $orderBy, first: $first, filters: $filters, after: $after) {
      edges {
        node {
          id
          email
          createdAt
          name
          wallets {
            addr
            provider
          }
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;
export const GET_ALL_USERS_ADMIN_PREV = gql`
  query Users(
    $orderBy: UserOrderByInput!
    $filters: UsersWhereInput
    $before: String
    $last: Int
  ) {
    users(orderBy: $orderBy, filters: $filters, before: $before, last: $last) {
      edges {
        node {
          id
          email
          createdAt
          name
          wallets {
            addr
            provider
          }
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;

export const GET_NEXT_USERS = gql`
  query Query(
    $orderBy: UserOrderByInput!
    $first: Int
    $filters: UsersWhereInput
    $after: String
  ) {
    users(orderBy: $orderBy, first: $first, filters: $filters, after: $after) {
      edges {
        cursor
        node {
          id
          fullName
          username
          email
          description
          mobile
          address
          countryCode
          profilePic
          coverPic
          wallet
          createdAt
          socialLinks {
            facebook
            twitter
            instagram
            blog
            website
            discord
          }
          isVerified
          isBlocked
          isBanned
          isProfileDetailsUpdated
          isWhitelisted
          isRequestForwhitelist
          isCollectionAccess
          collectionAccessStatus
          rejectReason
          isRequestedCollectionAccess
          tags
          totalVolume
          totalCollections
          totalNfts
          floorPrice
          isPublic
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;
export const GET_PREV_USERS = gql`
  query Query(
    $orderBy: UserOrderByInput!
    $last: Int
    $filters: UsersWhereInput
    $before: String
  ) {
    users(orderBy: $orderBy, last: $last, filters: $filters, before: $before) {
      edges {
        cursor
        node {
          id
          fullName
          username
          email
          description
          mobile
          address
          countryCode
          profilePic
          coverPic
          wallet
          createdAt
          socialLinks {
            facebook
            twitter
            instagram
            blog
            website
            discord
          }
          isVerified
          isBlocked
          isBanned
          isProfileDetailsUpdated
          isWhitelisted
          isRequestForwhitelist
          isCollectionAccess
          collectionAccessStatus
          rejectReason
          isRequestedCollectionAccess
          tags
          totalVolume
          totalCollections
          totalNfts
          floorPrice
          isPublic
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;

// Platform Variables

export const GET_ALL_PLATFORM_VARIABLES = gql`
  query Query {
    variables {
      variables {
        isActive
        name
        value
      }
      id
    }
  }
`;
export const GET_ALL_FEATURED_COLLECTION = gql`
  query Collections(
    $orderBy: CollectionOrderByInput!
    $first: Int
    $filters: CollectionWhereInput
  ) {
    collections(orderBy: $orderBy, first: $first, filters: $filters) {
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      edges {
        cursor
        node {
          id
          name
          description
        }
      }
    }
  }
`;
export const GET_NEXT_FEATURED_COLLECTION = gql`
  query Collections(
    $orderBy: CollectionOrderByInput!
    $first: Int
    $filters: CollectionWhereInput
    $after: String
  ) {
    collections(
      orderBy: $orderBy
      first: $first
      filters: $filters
      after: $after
    ) {
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      edges {
        cursor
        node {
          id
          name
          description
        }
      }
    }
  }
`;
export const GET_PREV_FEATURED_COLLECTION = gql`
  query Collections(
    $orderBy: CollectionOrderByInput!
    $first: Int
    $filters: CollectionWhereInput
    $before: String
  ) {
    collections(
      orderBy: $orderBy
      first: $first
      filters: $filters
      before: $before
    ) {
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      edges {
        cursor
        node {
          id
          name
          description
        }
      }
    }
  }
`;
export const SEARCH_COLLECTIONS = gql`
  query Collections(
    $orderBy: CollectionOrderByInput!
    $first: Int
    $filters: CollectionWhereInput
  ) {
    collections(orderBy: $orderBy, first: $first, filters: $filters) {
      edges {
        cursor
        node {
          id
          name
        }
      }
    }
  }
`;

// Import Collection

export const GET_ALL_IMPORT_COLLECTION_REQUEST = gql`
  query Forms($orderBy: FormOrderByInput!, $first: Int) {
    forms(orderBy: $orderBy, first: $first) {
      edges {
        node {
          id
          collectionName
          collectionAddress
          collectionTotalNFTCount
          ownerAddress
          category {
            name
          }
          status
          isDeleted
          pendingNFTs
          collectionDescription
          collectionLinkExampleUri
          contactInfo
          avatar
          backgroundImg
        }
        cursor
      }
      pageInfo {
        endCursor
        startCursor
        hasPreviousPage
        hasNextPage
      }
    }
  }
`;

export const GET_NEXT_IMPORT_COLLECTION_REQUEST = gql`
  query Forms($orderBy: FormOrderByInput!, $first: Int, $after: String) {
    forms(orderBy: $orderBy, first: $first, after: $after) {
      edges {
        node {
          id
          collectionName
          collectionAddress
          collectionTotalNFTCount
          ownerAddress
          category {
            name
          }
          status
          isDeleted
          pendingNFTs
          collectionDescription
          collectionLinkExampleUri
          contactInfo
          avatar
          backgroundImg
        }
        cursor
      }
      pageInfo {
        endCursor
        startCursor
        hasPreviousPage
        hasNextPage
      }
    }
  }
`;

export const GET_PREV_IMPORT_COLLECTION_REQUEST = gql`
  query Forms($orderBy: FormOrderByInput!, $first: Int, $before: String) {
    forms(orderBy: $orderBy, first: $first, before: $before) {
      edges {
        node {
          id
          collectionName
          collectionAddress
          collectionTotalNFTCount
          ownerAddress
          category {
            name
          }
          status
          isDeleted
          pendingNFTs
          collectionDescription
          collectionLinkExampleUri
          contactInfo
          avatar
          backgroundImg
        }
        cursor
      }
      pageInfo {
        endCursor
        startCursor
        hasPreviousPage
        hasNextPage
      }
    }
  }
`;

export const VIEW_COLLECTION_REQUEST = gql`
  query Form($formId: String!) {
    form(id: $formId) {
      id
      collectionName
      collectionAddress
      collectionTotalNFTCount
      ownerAddress
      category {
        name
      }
      owner {
        username
      }
      createdAt
      status
      isDeleted
      pendingNFTs
      collectionDescription
      collectionLinkExampleUri
      contactInfo
      avatar
      backgroundImg
    }
  }
`;

// Collectibles
export const GET_COLLECTIBLES = gql`
  query Items($orderBy: ItemOrderByInput!, $first: Int) {
    items(orderBy: $orderBy, first: $first) {
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      edges {
        cursor
        node {
          id
          currentOwner {
            wallet
            id
          }
          createdBy {
            wallet
            id
          }
          tokenId
          title
          collection {
            name
          }
          nftType
          isImportedNFT
        }
      }
    }
  }
`;

export const GET_NEXT_COLLECTIBLES = gql`
  query Items($orderBy: ItemOrderByInput!, $first: Int, $after: String) {
    items(orderBy: $orderBy, first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      edges {
        cursor
        node {
          id
          currentOwner {
            wallet
            id
          }
          createdBy {
            wallet
            id
          }
          tokenId
          title
          collection {
            name
          }
          nftType
          isImportedNFT
        }
      }
    }
  }
`;

export const GET_PREV_COLLECTIBLES = gql`
  query Items($orderBy: ItemOrderByInput!, $first: Int, $before: String) {
    items(orderBy: $orderBy, first: $first, before: $before) {
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      edges {
        cursor
        node {
          id
          currentOwner {
            wallet
            id
          }
          createdBy {
            wallet
            id
          }
          tokenId
          title
          collection {
            name
          }
          nftType
          isImportedNFT
        }
      }
    }
  }
`;

export const VIEW_COLLECTIBLE = gql`
  query Item($itemId: String!) {
    item(id: $itemId) {
      id
      title
      description
      tokenId
      mediaUrl
      previewImage
      collection {
        name
      }
      currentOwner {
        wallet
      }
      nftContractAddress
      royalties
      numberOfCopies
      properties {
        trait_type
        value
      }
      tokenUri
      isBlockchainVerified
      blockchainCurrency
      initialPrice
      isUnlockable
      unlockableContent
      isAdultContent
      isBlackListed
      isActive
      isDeleted
      createdBy {
        wallet
      }
      status
      blockchainItemId
      isImportedNFT
    }
  }
`;

//CMS Queries
export const GET_ALL_CMS = gql`
  query Query {
    getAllCms {
      content
      createdAt
      id
      tab
      title
      updatedAt
    }
  }
`;

export const GET_CMS_BY_TAB = gql`
  query GetCmsByTab($tab: CmsTab!) {
    getCmsByTab(tab: $tab) {
      content
      createdAt
      id
      tab
      title
      updatedAt
    }
  }
`;

export const GET_TRANSACTION_DATA = gql`
  query Transactions(
    $orderBy: TransactionOrderByInput!
    $filters: TransactionWhereInput
    $first: Int
    $last: Int
    $before: String
    $after: String
  ) {
    transactions(
      orderBy: $orderBy
      filters: $filters
      first: $first
      last: $last
      before: $before
      after: $after
    ) {
      message
      status
      edges {
        cursor
        node {
          token {
            name
            symbol
            price
            amount
            transactionFee
            transactionHash
            transferStatus
          }
          gift {
            token {
              transferFailureReason
              transactionHash
              symbol
              name
              amount
              transferStatus
            }
          }
          _id
          _account
          wallet
          paymentType
          amount
          currency
          customerId
          paymentId
          paymentIdClientSecret
          createdAt
          updatedAt
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;

export const GET_TRANSACTION_DATA_PREV = gql`
  query Transactions(
    $orderBy: TransactionOrderByInput!
    $filters: TransactionWhereInput
    $first: Int
    $last: Int
    $before: String
    $after: String
  ) {
    transactions(
      orderBy: $orderBy
      filters: $filters
      first: $first
      last: $last
      before: $before
      after: $after
    ) {
      message
      status
      edges {
        cursor
        node {
          token {
            name
            symbol
            price
            amount
            transactionFee
            transactionHash
            transferStatus
          }
          _id
          _account
          wallet
          paymentType
          amount
          currency
          customerId
          paymentId
          paymentIdClientSecret
          createdAt
          updatedAt
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;
export const GET_TRANSACTION_DATA_NEXT = gql`
  query Transactions(
    $orderBy: TransactionOrderByInput!
    $filters: TransactionWhereInput
    $first: Int
    $last: Int
    $before: String
    $after: String
  ) {
    transactions(
      orderBy: $orderBy
      filters: $filters
      first: $first
      last: $last
      before: $before
      after: $after
    ) {
      message
      status
      edges {
        cursor
        node {
          token {
            name
            symbol
            price
            amount
            transactionFee
            transactionHash
            transferStatus
          }
          _id
          _account
          wallet
          paymentType
          amount
          currency
          customerId
          paymentId
          paymentIdClientSecret
          createdAt
          updatedAt
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;

export const SUBSCRIPTION_FEATURES = gql`
  query SubscriptionFeatures {
    subscriptionFeatures {
      features {
        id
        name
        unit
        limit
        description
        not_available_description
      }
    }
  }
`;

export const GET_SUBSCRIPTIONS = gql`
  query Subscriptions(
    $orderBy: SubscriptionOrderByInput!
    $after: String
    $before: String
    $first: Int
    $last: Int
    $filters: SubscriptionWhereInput
  ) {
    subscriptions(
      orderBy: $orderBy
      after: $after
      before: $before
      first: $first
      last: $last
      filters: $filters
    ) {
      edges {
        cursor
        node {
          id
          coinflowPlanId
          name
          planCode
          description
          type
          price
          interval
          duration
          currency
          features {
            featureKey
            description
            not_available_description
            available
            limit
            unit
          }
          status
          createdById
          updatedById
          createdAt
          updatedAt
          isDeleted
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;

export const GET_SUBSCRIPTION_BY_ID = gql`
  query Subscription($subscriptionId: String!) {
    subscription(id: $subscriptionId) {
      id
      coinflowPlanId
      name
      planCode
      description
      type
      price
      interval
      duration
      currency
      features {
        featureKey
        description
        not_available_description
        available
        limit
        unit
      }
      status
      createdById
      updatedById
      createdAt
      updatedAt
      isDeleted
    }
  }
`;

export const GET_DISTROLIST = gql`
  query DistroList(
    $orderBy: DistroOrderByInput!
    $after: String
    $before: String
    $first: Int
    $last: Int
    $filters: DistroWhereInput
  ) {
    distroList(
      orderBy: $orderBy
      after: $after
      before: $before
      first: $first
      last: $last
      filters: $filters
    ) {
      edges {
        cursor
        node {
          id
          userId {
            id
            fullName
            username
            name
            email
          }
          message
          status
          createdAt
          updatedAt
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;

export const GET_DISTRO_BY_ID = gql`
  query Distro($distroId: String!) {
    distro(id: $distroId) {
      id
      userId {
        id
        fullName
        username
        name
        email
        description
        mobile
        address
        countryCode
        profilePic
        coverPic
        wallet
        profile_img
        createdAt
        socialLinks {
          facebook
          twitter
          instagram
          blog
          website
          discord
        }
        isVerified
        isBlocked
        isBanned
        isProfileDetailsUpdated
        isWhitelisted
        isRequestForwhitelist
        isCollectionAccess
        collectionAccessStatus
        rejectReason
        isRequestedCollectionAccess
        tags
        totalVolume
        totalCollections
        totalNfts
        floorPrice
        isPublic
        wallets {
          addr
          provider
        }
      }
      spotify
      youtube
      userName
      tiktok
      apple
      instagram
      x
      message
      status
      createdAt
      updatedAt
    }
  }
`;

export const GET_GAMIFICATION_LIST = gql`
  query GamificationList(
    $orderBy: GamificationOrderByInput!
    $first: Int
    $after: String
    $before: String
  ) {
    gamificationList(
      orderBy: $orderBy
      first: $first
      after: $after
      before: $before
    ) {
      edges {
        cursor
        node {
          id
          occurrence
          points
          identifier
          name
          isActive
          createdById {
            id
            fullName
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;

export const GET_GAMIFICATION_BY_ID = gql`
  query Gamification($gamificationId: String!) {
    gamification(id: $gamificationId) {
      id
      occurrence
      points
      identifier
      name
      isActive
      createdById {
        id
        fullName
        profilePic
      }
    }
  }
`;

export const GET_USER_ACTIVITY_LIST = gql`
  query Leaderboard(
    $orderBy: LeaderboardOrderByInput!
    $after: String
    $before: String
    $first: Int
    $last: Int
    $filters: LeaderboardWhereInput
  ) {
    leaderboard(
      orderBy: $orderBy
      after: $after
      before: $before
      first: $first
      last: $last
      filters: $filters
    ) {
      edges {
        cursor
        node {
          _id
          userId {
            id
            fullName
            username
            name
            email
          }
          questPerformed
          questPoints
          eventPerformed
          eventPoints
          points
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;

export const GET_RELEASE_LIST = gql`
  query ReleaseList(
    $orderBy: ReleaseOrderByInput!
    $first: Int
    $after: String
    $before: String
    $filters: ReleaseWhereInput
  ) {
    releaseList(
      orderBy: $orderBy
      first: $first
      after: $after
      before: $before
      filters: $filters
    ) {
      edges {
        cursor
        node {
          id
          userId
          projectId
          isSendForRelease
          track {
            artist
            language
            trackId
          }
          artist {
            performerCredit
            writeCredit
            additionalCredit
            role
            genre
          }
          collaborators {
            userName
            userImage
            splitValue
            walletAddress
            id
          }
          trackMetadata {
            labelName
            copyrightName
            copyrightYear
            countryOfRecording
            trackISRC
            lyrics
          }
          ownership {
            ownership
            territories
          }
          compositionRights {
            composerName
            percentageOfOwnership
            rightsManagement
          }
          releaseStatus {
            previouslyReleased
            upc
            releaseDate
          }
          createdAt
          updatedAt
          trackId {
            id
            name
            extension
            size
            duration
            imageWaveBig
            imageWaveSmall
            metadata_id
            createdAt
            updatedAt
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;

export const GET_RELEASE_BY_ID = gql`
  query Release($releaseId: String!) {
    release(id: $releaseId) {
      metadata {
        id
        userId
        projectId
        isSendForRelease
        track {
          artist
          language
          trackId
        }
        artist {
          performerCredit
          writeCredit
          additionalCredit
          role
          genre
        }
        collaborators {
          userName
          userImage
          splitValue
          walletAddress
          id
        }
        trackMetadata {
          labelName
          copyrightName
          copyrightYear
          countryOfRecording
          trackISRC
          lyrics
        }
        ownership {
          ownership
          territories
        }
        compositionRights {
          composerName
          percentageOfOwnership
          rightsManagement
        }
        releaseStatus {
          previouslyReleased
          upc
          releaseDate
        }
        createdAt
        updatedAt
        trackId {
          id
          name
          extension
          size
          duration
          imageWaveBig
          imageWaveSmall
          metadata_id
          createdAt
          updatedAt
        }
      }
      audioUrl
    }
  }
`;

export const GET_QUEST_LIST = gql`
  query QuestList(
    $orderBy: QuestOrderByInput!
    $filters: QuestWhereInput
    $last: Int
    $first: Int
    $before: String
    $after: String
  ) {
    questList(
      orderBy: $orderBy
      filters: $filters
      last: $last
      first: $first
      before: $before
      after: $after
    ) {
      edges {
        cursor
        node {
          id
          occurrence
          points
          identifier
          isPublished
          name
          isPublishByAdmin
          isActive
          createdById {
            id
            fullName
            createdAt
            isActive
            isVerified
            isBlocked
            isBanned
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;

/* eslint-disable  */

import { gql } from "@apollo/client";

// Role Management

export const CREATE_ROLE = gql`
  mutation CreateRole($input: CreateRoleInput!) {
    createRole(input: $input) {
      message
      status
    }
  }
`;

export const UPDATE_ROLE = gql`
  mutation UpdateRole($where: RoleWhereUpdateInput!, $input: UpdateRoleInput!) {
    updateRole(where: $where, input: $input) {
      message
      status
    }
  }
`;

export const DELETE_ROLE = gql`
  mutation DeleteRole($where: RoleWhereUpdateInput!) {
    deleteRole(where: $where) {
      message
      status
    }
  }
`;

// Admin Management

export const CREATE_ADMIN = gql`
  mutation CreateAdmin($input: CreateAdminInput!) {
    createAdmin(input: $input) {
      message
      status
    }
  }
`;

export const EDIT_ADMIN = gql`
  mutation UpdateAdmin(
    $where: AdminWhereUpdateInput!
    $input: UpdateAdminInput!
  ) {
    updateAdmin(where: $where, input: $input) {
      message
      status
    }
  }
`;
export const DELETE_ADMIN = gql`
  mutation DeleteAdmin($where: AdminWhereUpdateInput!) {
    deleteAdmin(where: $where) {
      message
      status
    }
  }
`;
export const DISABLE_ADMIN = gql`
  mutation DisableAdmin($input: disableAdminInput!) {
    disableAdmin(input: $input) {
      message
      status
    }
  }
`;

export const UPDATE_PASSWORD = gql`
  mutation UpdatePassword($input: UpdatePasswordInput!) {
    updatePassword(input: $input) {
      message
      status
      referenceCode
      mobile
      countryCode
    }
  }
`;
export const UPDATE_NUMBER = gql`
  mutation UpdateMobile($input: UpdateMobileInput!) {
    updateMobile(input: $input) {
      message
      referenceCode
      status
      mobile
      countryCode
    }
  }
`;

// Category Management

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      message
      status
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory(
    $where: CategoryWhereUniqueInput!
    $input: UpdateCategoryInput!
  ) {
    updateCategory(where: $where, input: $input) {
      message
      status
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($input: CategoryWhereUniqueInput) {
    deleteCategory(input: $input) {
      message
      status
    }
  }
`;

// Platform Variables

export const UPDATE_VARIABLE = gql`
  mutation UpdateVariable(
    $input: UpdateVariableInput!
    $where: VariableWhereUpdateInput!
  ) {
    updateVariable(input: $input, where: $where) {
      message
      status
    }
  }
`;

export const UPDATE_FEATURED_COLLECTION = gql`
  mutation FeaturedCollection($input: CollectionFeaturedInput!) {
    featuredCollection(input: $input) {
      message
      status
    }
  }
`;

// Import collection

export const APPROVE_IMPORT_COLLECTION_REQUEST = gql`
  mutation ImportCollection($input: ImportCollectionInput!) {
    importCollection(input: $input) {
      message
      status
    }
  }
`;
export const REJECT_IMPORT_COLLECTION_REQUEST = gql`
  mutation UpdateForm($where: FormWhereUniqueInput!, $input: UpdateFormInput!) {
    updateForm(where: $where, input: $input) {
      message
      status
    }
  }
`;

// CMS
export const CREATE_CMS = gql`
  mutation CreateCms($input: CreateCmsInput!) {
    createCms(input: $input) {
      message
      status
    }
  }
`;

export const UPDATE_CMS = gql`
  mutation UpdateCms($updateCmsId: ID!, $input: UpdateCmsInput!) {
    updateCms(id: $updateCmsId, input: $input) {
      message
      status
    }
  }
`;

export const DELETE_CMS = gql`
  mutation DeleteCms($deleteCmsId: ID!) {
    deleteCms(id: $deleteCmsId) {
      message
      status
    }
  }
`;

export const GRAPH_MUTATION = gql`
  mutation Graph($input: graphInput!) {
    graph(input: $input) {
      message
      status
      graphdata {
        chainNumber
        arrMonth {
          data1 {
            value
            datetime
          }
          data2 {
            value
            datetime
          }
          data3 {
            value
            datetime
          }
          data4 {
            value
            datetime
          }
          data5 {
            value
            datetime
          }
          data6 {
            value
            datetime
          }
          data7 {
            value
            datetime
          }
          data8 {
            value
            datetime
          }
          data9 {
            value
            datetime
          }
          data10 {
            value
            datetime
          }
          data11 {
            value
            datetime
          }
          data12 {
            value
            datetime
          }
          data13 {
            value
            datetime
          }
          data14 {
            value
            datetime
          }
          data15 {
            value
            datetime
          }
          data16 {
            value
            datetime
          }
          data17 {
            value
            datetime
          }
          data18 {
            value
            datetime
          }
          data19 {
            value
            datetime
          }
          data20 {
            value
            datetime
          }
          data21 {
            value
            datetime
          }
          data22 {
            value
            datetime
          }
          data23 {
            value
            datetime
          }
          data24 {
            value
            datetime
          }
          data25 {
            value
            datetime
          }
          data26 {
            value
            datetime
          }
          data27 {
            value
            datetime
          }
          data28 {
            value
            datetime
          }
          data29 {
            value
            datetime
          }
          data30 {
            value
            datetime
          }
          data31 {
            value
            datetime
          }
        }
      }
    }
  }
`;

export const CREATE_SUBSCRIPTION_PLAN = gql`
  mutation CreateSubscription($input: CreateSubscriptionInput!) {
    createSubscription(input: $input) {
      status
      message
      subscription {
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
      }
    }
  }
`;

export const UPDATE_SUBSCRIPTION_PLAN = gql`
  mutation UpdateSubscription(
    $where: SubscriptionWhereUpdateInput!
    $input: UpdateSubscriptionInput!
  ) {
    updateSubscription(where: $where, input: $input) {
      status
      message
      subscription {
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
      }
    }
  }
`;

export const DELETE_SUBSCRIPTION_PLAN = gql`
  mutation DeleteSubscription($where: SubscriptionWhereUpdateInput!) {
    deleteSubscription(where: $where) {
      status
      message
    }
  }
`;

export const UPDATE_GAMIFICATION_EVENT = gql`
  mutation UpdateEvent(
    $where: GamificationWhereUpdateInput!
    $input: GamificationUpdateInput!
  ) {
    updateEvent(where: $where, input: $input) {
      message
      status
    }
  }
`;

export const UPDATE_GAMIFICATION_STATUS = gql`
  mutation UpdateStatus(
    $where: GamificationWhereUpdateInput!
    $input: GamificationStatusInput!
  ) {
    updateStatus(where: $where, input: $input) {
      message
      status
    }
  }
`;

export const CREATE_QUEST = gql`
  mutation CreateQuest($input: CreateQuestInput!) {
    createQuest(input: $input) {
      message
      status
    }
  }
`;
export const UPDATE_QUEST = gql`
  mutation UpdateQuest(
    $input: QuestUpdateInput!
    $where: QuestWhereUpdateInput!
  ) {
    updateQuest(input: $input, where: $where) {
      message
      status
    }
  }
`;

export const UPDATE_QUEST_STATUS = gql`
  mutation QuestStatus(
    $where: QuestWhereUpdateInput!
    $input: QuestStatusInput!
  ) {
    questStatus(where: $where, input: $input) {
      message
      status
    }
  }
`;
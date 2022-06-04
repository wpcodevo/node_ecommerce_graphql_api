import { gql } from 'apollo-server-express';

const typeDefs = gql`
  scalar DateTime
  type Query {
    # Product
    products: ProductDataResult!
    product(id: ID!): Product
    # Category
    category(id: ID!): Category
    categories: CategoryDataResult!
    # User
    users: UserDataResult!
    user(id: ID!): AdminGetUser
    # Review
    review(id: ID!): ReviewData
    reviews: [ReviewData!]!
    # Auth
    refreshAccessToken: refreshAccessTokenData!
  }

  type refreshAccessTokenData {
    status: String!
    accessToken: String!
  }

  type ProductDataResult {
    status: String!
    results: Int!
    products: [Product!]!
  }

  type CategoryDataResult {
    status: String!
    results: Int!
    categories: [Category!]!
  }

  type UserDataResult {
    status: String!
    results: Int!
    users: [AdminGetUser!]!
  }

  type AdminGetUser {
    id: ID!
    name: String!
    email: String!
    photo: String!
    role: String!
    active: Boolean!
    verified: Boolean!
    passwordChangedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input CreateProductInput {
    name: String!
    description: String!
    quantity: Int!
    price: Float!
    imageCover: String!
    images: [String!]
    category: ID!
  }

  input CreateCategoryInput {
    name: String!
    image: String!
    description: String
  }

  input UpdateCategoryInput {
    name: String
    image: String
    description: String
  }

  input UpdateProductInput {
    name: String
    description: String
    quantity: Int
    price: Float
    imageCover: String
    images: [String]
    category: ID
  }

  input SignUpInput {
    name: String!
    email: String!
    password: String!
    passwordConfirm: String!
    photo: String
  }

  input AdminCreateUserInput {
    name: String!
    email: String!
    password: String!
    passwordConfirm: String!
    photo: String
    role: String
    verified: Boolean!
  }

  input AdminUpdateUserInput {
    name: String
    email: String
    password: String
    passwordConfirm: String
    photo: String
    role: String
  }

  type UserData {
    id: ID!
    name: String!
    email: String!
    photo: String!
    role: String!
    createdAt: DateTime
    updatedAt: DateTime
  }

  input UpdateUserInput {
    name: String
    email: String
    photo: String
  }

  type SignUpData {
    status: String!
    message: String!
    user: UserData!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type LoginData {
    status: String!
    accessToken: String!
  }

  type PasswordDataResult {
    status: String!
    message: String!
  }

  input ResetPasswordInput {
    token: String!
    password: String!
    passwordConfirm: String!
  }

  input UpdatePasswordInput {
    passwordCurrent: String!
    password: String!
    passwordConfirm: String!
  }

  input CreateReviewInput {
    review: String!
    rating: Float!
    user: ID!
    product: ID!
  }

  type ReviewData {
    id: ID!
    review: String!
    rating: String!
    user: ID!
    product: ID!
    createdAt: DateTime
    updatedAt: DateTime
  }

  input UpdateReviewInput {
    review: String
    rating: Float
  }

  type Mutation {
    # Auth
    loginUser(input: LoginInput!): LoginData!
    signupUser(input: SignUpInput!): SignUpData!
    verifyUser(id: ID!, code: String!): Boolean!
    forgotPassword(email: String!): PasswordDataResult!
    resetPassword(input: ResetPasswordInput!): PasswordDataResult!
    updatePassword(input: UpdatePasswordInput!): PasswordDataResult!
    # User
    createUser(input: AdminCreateUserInput!): AdminGetUser!
    updateUser(id: ID!, input: AdminUpdateUserInput!): AdminGetUser!
    deleteUser(id: ID!): Boolean!
    getMe: UserData!
    updateMe(input: UpdateUserInput!): SignUpData!
    deleteMe: Boolean!
    # Product
    createProduct(input: CreateProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
    # Category
    createCategory(input: CreateCategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
    # Review
    createReview(input: CreateReviewInput!): ReviewData!
    updateReview(id: ID!, input: UpdateReviewInput!): ReviewData!
    deleteReview(id: ID!): Boolean!
  }

  type Product {
    id: ID!
    name: String!
    description: String!
    quantity: Int!
    price: Float!
    avgRating: Float!
    numRating: Int!
    imageCover: String!
    images: [String!]!
    category: Category
    reviews: [ReviewData!]!
    slug: String!
    createdAt: DateTime
    updatedAt: DateTime
  }

  type Category {
    id: ID!
    name: String!
    image: String!
    description: String
    products: [Product!]!
    createdAt: DateTime
    updatedAt: DateTime
  }
`;

export default typeDefs;

import { ApolloError } from 'apollo-server-core';

const handleCastError = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  throw new ApolloError(message, 'GRAPHQL_VALIDATION_FAILED');
};

const handleValidationError = (error) => {
  const message = Object.values(error.errors).map((el) => el.message);
  throw new ApolloError(
    `Invalid input: ${message.join(', ')}`,
    'GRAPHQL_VALIDATION_FAILED'
  );
};

const errorHandler = (err) => {
  switch (err.name) {
    case 'CastError':
      return handleCastError(err);
    case 'ValidationError':
      return handleValidationError(err);
    default:
      throw new ApolloError(err.message);
  }
};

export default errorHandler;

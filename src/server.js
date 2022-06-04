import http from 'http';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import config from 'config';
import cors from 'cors';
import connectDB from './utils/connectDB';
import typeDefs from './schemas';
import logger from './utils/logger';
import app from './app';
import { Mutation, Query } from './resolvers';
import DateTime from './resolvers/datetime';
import getAuthUser from './middleware/authUser';
import restrictTo from './middleware/restrictTo';

const httpServer = http.createServer(app);

const corsOptions = {
  origin: ['https://studio.apollographql.com', 'http://localhost:8000'],
  credentials: true,
};

app.use(cors(corsOptions));

const resolvers = {
  DateTime,
  Query,
  Mutation,
};

(async function () {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    context: async ({ req, res }) => ({ req, res, getAuthUser, restrictTo }),
  });

  // CONNECT DB
  await connectDB();

  // START APOLLO SERVER
  await server.start();

  server.applyMiddleware({ app, cors: corsOptions });

  const port = config.get('port');

  await new Promise((resolve) => httpServer.listen(port, '0.0.0.0', resolve));
  logger.info(
    `🔥Server started at http://localhost:${port}${server.graphqlPath}`
  );
})();

process.on('unhandledRejection', (err) => {
  logger.info('UNHANDLED REJECTION 🔥🔥 Shutting down...');
  console.error('Error🔥', err.message);

  httpServer.close(async () => {
    process.exit(1);
  });
});

import { query } from 'express';
import { buildSchema } from 'graphql';

const schema = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updateAt: String!
    }

    type User {
        _id: ID!
        email: String!
        password: String
        name: String!
        status: String!
        posts: [Post!]!
    }

    input UserInputData {
        email: String!
        password: String!
        name: String! 
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
    }

        schema {
            mutation: RootMutation
        }
`);

export default schema;

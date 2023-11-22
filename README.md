# Nest Auth

This app showcases real-world Authentication and Authorization techniques with NestJS from access to refresh tokens, and everything in between:

1. JWT-based authentication (refresh tokens, invalidating tokens)
2. Role-based Access Control
3. Claims-based Authorization
4. Policy-based Authorization
5. Integrate API Keys feature
6. Implement server-side sessions
7. Two-factor (2FA) authentication
8. Google authentication
9. Sessions with Passport

## Get started

1. Make sure you have docker installed on your local machine.
2. Duplicate the `.env.example` file and rename it to `.env`. Fill in the required variables.

```bash
# Install dependencies
$ npm install

# setup postgres and redis database with docker
$ docker compose up
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test the app using Postman

Import the file `NestAuth.postman_collection` in your Postman. It will add a new collection name `Nest Auth` in your workspace.

## License

Nest is [MIT licensed](LICENSE).

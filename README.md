# Nest Auth

## Installation

```bash
# Install dependencies
$ npm install
```

## Setup databases

Make sure you have docker installed on your local machine.

```bash
# setup postgres and redis with docker
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

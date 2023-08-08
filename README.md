# schnoz

schnoz is an online puzzle game where two players place units to score points.

## Apps and Packages

- `server`: a [Nest.js](https://nestjs.com/) app
- `web`: a [Next.js](https://nextjs.org/) app
- `coordinate-utils`: util function to interact with coordinates as used in the game
- `game-logic`: contains game logic such as game modes, placement rules and more
- `types`: all shared types, i.e. database types
- `eslint-config-custom`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `tsconfig`: `tsconfig.json`s used throughout the monorepo

## Develop

### Development database
To spin up a database for development spin up a docker container:

```sh
yarn start:db
```

Before serving, make sure you have the correct environment variables set in your `.env`. Use the contents of `packages/database/.env.local` into `packages/database/.env` or use the command:

```sh
cp packages/database/.env.local packages/database/.env
```

To develop all apps and packages, run the following command:

```
yarn dev
```


## Docker
To run a dockerized version of schnoz you can spawn `server`, `web` and `database` containers using `docker-compose`.

### Create `.env`
First, create an `.env` file in the `database` package with the connection string for the database. Depending on your environment, different values should be used:

#### With local database
Use the contents of `packages/database/.env.docker.local` into `packages/database/.env` or use the command:

```sh
cp packages/database/.env.docker.local packages/database/.env
```

#### Development-Environment
TBD

#### Staging-Environment
TBD

#### Production-Environment
TBD

### Build docker images
A docker network is required for the containers to communicate. Create one, if you did not already:

```sh
docker network create app_network
```

### Build docker images
```sh
COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose -f docker-compose.yml build
```

### Run docker images

```sh
docker-compose -f docker-compose.yml up -d
```


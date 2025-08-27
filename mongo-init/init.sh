#!/bin/bash
mongoimport --db fantazy_db --collection users --file /docker-entrypoint-initdb.d/users.json --jsonArray
mongoimport --db fantazy_db --collection players --file /docker-entrypoint-initdb.d/players.json --jsonArray
mongoimport --db fantazy_db --collection teams --file /docker-entrypoint-initdb.d/teams.json --jsonArray

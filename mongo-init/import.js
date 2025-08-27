db = db.getSiblingDB('fantazy_db');  // use your database

// Import players
const players = cat('/docker-entrypoint-initdb.d/players.json');
JSON.parse(players).forEach(p => db.players.insertOne(p));

// Import teams
const teams = cat('/docker-entrypoint-initdb.d/teams.json');
JSON.parse(teams).forEach(t => db.teams.insertOne(t));

// Import users
const users = cat('/docker-entrypoint-initdb.d/users.json');
JSON.parse(users).forEach(u => db.users.insertOne(u));

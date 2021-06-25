// const properties = require('./json/properties.json');
// const users = require('./json/users.json');
const {Pool} = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users


/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  // let user;
  // for (const userId in users) {
  //   user = users[userId];
  //   if (user.email.toLowerCase() === email.toLowerCase()) {
  //     break;
  //   } else {
  //     user = null;
  //   }
  // }
  // return Promise.resolve(user);
  return pool.query(`select * from users where email = $1`,[email.toLowerCase()])
    .then(res => {
      if (res) {
        console.log(res.rows[0]);
        return res.rows[0];
      } else
        return null;
    })
    .catch(err => {
      return err;
    });
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool.query(`select * from users where id = $1`,[id])
    .then(res => {
      if (res) {
        console.log(res.rows[0]);
        return res.rows[0];
      } else {
        return null;
      }
    });
};
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  // const userId = Object.keys(users).length + 1;
  // user.id = userId;
  // users[userId] = user;
  // return Promise.resolve(user);
  return pool.query(`INSERT INTO users(name, email, password)
  VALUES ($1, $2, $3)
  RETURNING *;`, [user.name, user.email, user.password])
    .then(res => {
      if (res) {
        console.log(res.rows[0]);
        return res.rows[0];
      } else {
        return null;
      }
    });
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return pool.query(
    `select * from reservations
     where guest_id = $1 
     and start_date < now()::date
     limit $2`, [guest_id, limit])
    .then(res => {
      if (res) {
        return res.rows;
      } else {
        return null;
      }
    })
    .catch(err => {
      return err;
    });
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  // const limitedProperties = {};
  // for (let i = 1; i <= limit; i++) {
  //   limitedProperties[i] = properties[i];
  // }
  // return Promise.resolve(limitedProperties);
  return pool.query('select * from properties limit $1',[limit])
    .then(result => {
      // console.log(result.rows[0]);
      return result.rows;
    }).catch(err => {
      return err;
    });
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};
exports.addProperty = addProperty;

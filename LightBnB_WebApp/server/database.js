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
    `select properties.*, *, avg(property_reviews.rating) as average_rating
     from reservations as r
     join properties on r.property_id = properties.id
     join property_reviews on properties.id = property_id
     where r.guest_id = $1 
     and r.end_date < now()::date
     group by r.id, properties.id
     limit $2;`, [guest_id, limit])
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
  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  // 3
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  //if no other query, push to queryParams, queryString starts with where
  if (options.owner_id) {
    queryParams.push(options.owner_id);
    if (queryParams.length === 1) {
      queryString += `where owner_id = $${queryParams.length}`;
    } else {
      queryString += `and owner_id = $${queryParams.length}`;
    }
  }

  // what if user just enter min or max?
  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    queryParams.push(options.minimum_price_per_night * 100, options.maximum_price_per_night * 100);
    if (queryParams.length === 2) {
      queryString += `where cost_per_night > $${queryParams.length - 1}
                      and cost_per_night < $${queryParams.length}`;
    } else {
      queryString += `and cost_per_night > $${queryParams.length - 1}
                      and cost_per_night < $${queryParams.length}`;
    }
  }

  if (options.minimum_rating) { 
    queryParams.push(options.minimum_rating);
    if (queryParams.leng === 1) {
      queryString += `where rating >= $${minimum_rating}`;
    } else {
      queryString += `and rating >= $${minimum_rating}`;
    }
  }

  // 4
  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 5
  console.log(queryString, queryParams);

  // 6
  return pool.query(queryString, queryParams).then((res) => res.rows);
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  // const propertyId = Object.keys(properties).length + 1;
  // property.id = propertyId;
  // properties[propertyId] = property;
  // return Promise.resolve(property);
  return pool.query(`
  insert into properties (owner_id, title, description, 
    thumbnail_photo_url, cover_photo_url, cost_per_night,
    street, city, province, post_code, country,
    parking_spaces, number_of_bathrooms, number_of_bedrooms)
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *;`,
  [property.owner_id, property.title, property.description,
    property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.street, property.city, property.province, property.post_code, property.country,
    property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms])
    .then(res => {
      if (res) {
        return res.rows[0];
      } else {
        return null;
      }
    })
    .catch(err => {
      return err;
    });
    
};
exports.addProperty = addProperty;

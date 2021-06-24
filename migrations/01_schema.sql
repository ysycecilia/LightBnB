DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS property_reviews CASCADE;

create table users (
  id serial primary key not NULL,
  name varchar(255) not NULL,
  email varchar(255) not NULL,
  password varchar(255) not NULL
);

create table properties (
  id serial primary key not NULL,
  owner_id integer references users(id) on delete CASCADE,
  title varchar(255) not NULL,
  description text,
  thumbnail_photo_url varchar(255) not NULL,
  cover_photo_url varchar(255) not NULL, 
  cost_per_night integer not NULL DEFAULT 0,
  parking_spaces integer not NULL DEFAULT 0,
  number_of_bathrooms integer not NULL DEFAULT 0,
  number_of_bedrooms integer not NULL DEFAULT 0,
  country varchar(255) not NULL,
  street varchar(255) not NULL,
  city varchar(255) not NULL,
  province varchar(255) not NULL,
  post_code varchar(255) not NULL,
  active boolean not NULL DEFAULT TRUE
);

create table reservations(
  id serial primary key not NULL,
  start_date DATE not NULL,
  end_date DATE not NULL,
  property_id integer references properties(id) on delete CASCADE,
  guest_id integer references users(id) on delete CASCADE
);

create table property_reviews(
  id serial primary key not NULL,
  guest_id integer REFERENCES users(id) on delete CASCADE,
  property_id integer REFERENCES properties(id) on delete CASCADE,
  reservation_id integer REFERENCES reservations(id) on delete CASCADE,
  rating smallint not NULL DEFAULT 0,
  message text
);
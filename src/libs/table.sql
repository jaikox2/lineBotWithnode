CREATE TABLE users(
   id serial PRIMARY KEY,
   lineId VARCHAR (50) UNIQUE NOT NULL,
   personalId VARCHAR (50) NOT NULL,
   name VARCHAR (50) NOT NULL,
   lastname VARCHAR (50) NOT NULL,
   dob VARCHAR (50) NOT NULL,
   phone VARCHAR (50) NOT NULL,
   createdAt VARCHAR (50) NOT NULL,
   updatedAt VARCHAR (50) NOT NULL,
   isLogin boolean,
   last_login VARCHAR (50) NOT NULL
)
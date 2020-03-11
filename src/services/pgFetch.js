const momenTz = require('moment-timezone');

const db = require('../libs/db');

function fetchUpsert(text, values) {
  return new Promise((resolve, reject) => {
    db
      .query(text, values)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

function fetchQuery(text, values) {
  return new Promise((resolve, reject) => {
    db
      .query(text, values)
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

function insertUsers(lineId, personalId, name, lastname, dob, phone) {
  return new Promise((resolve, reject) => {
    const text = `INSERT INTO 
    users(lineId, personalId, name, lastname, dob, phone, createdAt, updatedAt, isLogin, last_login) 
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
    const date = momenTz().tz('Asian/Bangkok').format('x');
    const values = [lineId, personalId, name, lastname, dob, phone, date, date, true, date];
    fetchUpsert(text, values).then((res) => {
      resolve(res);
    }).catch((error) => {
      reject(error);
    });
  });
}

function queryUsers(lineId) {
  return new Promise((resolve, reject) => {
    const text = 'SELECT * FROM users WHERE lineId=$1 ORDER BY id DESC;';
    const values = [lineId];
    fetchQuery(text, values).then((res) => {
      resolve(res);
    }).catch((error) => {
      reject(error);
    });
  });
}

function updateLogout(lineId) {
  return new Promise((resolve, reject) => {
    const text = 'UPDATE users SET isLogin=false WHERE lineId=$1;';
    const values = [lineId];
    fetchQuery(text, values).then((res) => {
      resolve(res);
    }).catch((error) => {
      reject(error);
    });
  });
}

module.exports = {
  insertUsers,
  queryUsers,
  updateLogout,
};

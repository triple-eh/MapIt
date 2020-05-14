/*
 * All routes for api/users are defined here
 */

const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get("/", (req, res) => {
    db.query(`SELECT * FROM users;`)
      .then(data => {
        const users = data.rows;
        res.json({ users });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  router.get("/:id", (req, res) => {
    let query = `SELECT * from users WHERE id=$1`;
    let params = [req.params.id];
    console.log(query, params);
    db.query(query, params)
      .then(data => {
        const user = data.rows[0];
        res.json(user);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  router.get("/:id/maps", (req, res) => {
    let query = `SELECT * from maps where created_by = $1`;
    let params = [req.params.id];
    console.log(query, params);
    db.query(query, params)
      .then(data => {
        const maps = data.rows;
        res.json({ maps });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  router.get("/:id/locations", (req, res) => {
    let query = `SELECT * from locations where created_by = $1`;
    let params = [req.params.id];
    console.log(query, params);
    db.query(query, params)
      .then(data => {
        const locations = data.rows;
        res.json({ locations });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  router.get("/:id/favourites", (req, res) => {
    let query = `
    SELECT maps.* from maps
    JOIN favourites on favourites.map_id = maps.id
    JOIN users on favourites.user_id = users.id 
    WHERE favourites.user_id = $1
    `;
    let params = [req.params.id];
    console.log(query, params);
    db.query(query, params)
      .then(data => {
        const maps = data.rows;
        res.json({ maps });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  return router;
};

/*
 * All routes for api/locations are defined here
 */

const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get("/", (req, res) => {
    db.query(`SELECT * FROM locations;`)
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
  router.get("/:id", (req, res) => {
    let query = `SELECT * from locations WHERE id=$1`;
    let params = [req.params.id];
    console.log(query, params);
    db.query(query, params)
      .then(data => {
        const location = data.rows[0];
        res.json(location);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  router.get("/users/:id", (req, res) => {
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
  return router;
};

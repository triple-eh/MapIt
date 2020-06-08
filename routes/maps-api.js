/*
 * All routes for api/maps are defined here
 */

const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get("/", (req, res) => {
    let query = `SELECT * FROM maps`;
    console.log(query);
    db.query(query)
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
  router.get("/:id", (req, res) => {
    let query = `SELECT * from maps WHERE id=$1`;
    let params = [req.params.id];
    console.log(query, params);
    db.query(query, params)
      .then(data => {
        const map = data.rows[0];
        res.json(map);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  router.get("/:id/locations", (req, res) => {
    let query = `SELECT * from locations where map_id = $1 ORDER BY id`;
    let params = [req.params.id];
    console.log(query, params);
    db.query(query, params)
      .then(data => {
        const locations = data.rows;
        res.json(locations);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  return router;
};

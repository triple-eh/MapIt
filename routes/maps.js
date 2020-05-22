/*
 * All routes for maps are defined here
 */

const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get("/", (req, res) => {
    let query = `
    SELECT m.*, COUNT(f.id) as favs_count
    FROM (
      SELECT 
        maps.id,
        maps.name,
        maps.description,
        maps.created_by,
        CASE 
          WHEN loc.created_at is NULL THEN maps.created_at
          ELSE loc.created_at
        END as modified_at,
        CASE
          WHEN loc.created_by is NULL THEN maps.created_by
          ELSE loc.created_by
        END as modified_by
      FROM locations loc
      JOIN (
        SELECT map_id, max(created_at) as created_at
        FROM locations
        GROUP BY map_id
      ) locmax
      ON loc.map_id = locmax.map_id and loc.created_at = locmax.created_at
      RIGHT JOIN maps ON loc.map_id = maps.id
      ) m
    LEFT JOIN favourites f ON m.id = f.map_id
    GROUP BY 1, 2, 3, 4, 5, 6
    ORDER BY m.id;
    `;
    console.log(query);
    db.query(query)
      .then(data => {
        const maps = data.rows;
        res.render("index",{ maps });
        // res.json(maps);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
//   router.get("/:id", (req, res) => {
//     let query = `SELECT * from maps WHERE id=$1`;
//     let params = [req.params.id];
//     console.log(query, params);
//     db.query(query, params)
//       .then(data => {
//         const map = data.rows[0];
//         res.json(map);
//       })
//       .catch(err => {
//         res
//           .status(500)
//           .json({ error: err.message });
//       });
//   });
//   router.get("/:id/locations", (req, res) => {
//     let query = `SELECT * from locations where map_id = $1`;
//     let params = [req.params.id];
//     console.log(query, params);
//     db.query(query, params)
//       .then(data => {
//         const locations = data.rows;
//         res.json({ locations });
//       })
//       .catch(err => {
//         res
//           .status(500)
//           .json({ error: err.message });
//       });
//   });
  return router;
};

/*
 * All routes for maps are defined here
 */

const express = require('express');
const { isLoggedIn } = require('../lib/custom-middleware');
const { appendFavByStr } = require('../lib/helpers');
const router  = express.Router();
const apiKey = process.env.API_KEY;

module.exports = (db) => {
  router.get("/", (req, res) => {
    let query = `
    SELECT m.*, u1.name as user_name, u2.name as user_name_modified, COUNT(f.id) as favs_count
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
    LEFT JOIN users u1 ON m.created_by = u1.id
    LEFT JOIn users u2 ON m.modified_by = u2.id
    GROUP BY 1, 2, 3, 4, 5, 6, 7, 8
    ORDER BY m.id;
    `;
    console.log(query);
    db.query(query)
      .then(data => {
        const userId = req.session.userId;
        const maps = data.rows.map(map => appendFavByStr(map));
        res.render("index",{ maps, apiKey, userId });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  router.get("/new", isLoggedIn, (req, res) => {
    res.render("new-map", { apiKey });
  });
  router.post("/", isLoggedIn, (req, res) => {
    const userId = req.session.userId;
    const { mapName, mapDesc} = req.body;
    let query = `
    INSERT INTO maps
    (name, description, created_by)
    VALUES
    ($1, $2, $3)
    RETURNING *;
    `;
    let params = [mapName, mapDesc, parseInt(userId)];
    console.log(query, params);
    db.query(query,[mapName, mapDesc, parseInt(userId)])
      .then(data => {
        console.log("Added into maps:", data.rows[0]);
        res.redirect("/maps");
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  router.get('/:id', isLoggedIn, (req, res) => {
    let userId = req.session.userId;
    let query = `
    SELECT
      maps.id as map_id, maps.name as map_name, maps.description as map_desc, u1.name as created_by,
      locations.title as loc_title, locations.lat as lat, locations.lng as lng, locations.description as loc_desc,
      (SELECT COUNT(*) FROM favourites WHERE map_id = maps.id and user_id = $2) as is_fav,
      COUNT(favourites.id) as favs_count
    FROM maps
    LEFT JOIN locations ON maps.id = locations.map_id
    LEFT JOIN favourites on maps.id = favourites.map_id
    LEFT JOIN users u1 ON maps.created_by = u1.id
    WHERE maps.id = $1
    GROUP by 1, 2, 3, 4, 5, 6, 7, 8, 9
    `;
    console.log(query, [req.params.id, userId]);
    db.query(query,[parseInt(req.params.id),userId])
      .then(data => {
        const apiKey = process.env.API_KEY;
        const map = appendFavByStr(data.rows[0]);
        res.render("map", { map, apiKey, userId });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  return router;
};

/*
 * All routes for /users are defined here
 */

const express = require('express');
const router  = express.Router();
const apiKey = process.env.API_KEY;

module.exports = (db) => {
  router.get("/:id/maps", (req, res) => {
    let id = parseInt(req.params.id);
    let query = `
    SELECT DISTINCT m.*, COUNT(*) as favs_count
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
    LEFT JOIN locations l on m.id = l.map_id
    WHERE m.created_by = $1 or l.created_by = $1
    GROUP BY 1, 2, 3, 4, 5, 6
    ORDER BY m.id;
    `;
    console.log(query,id);
    db.query(query,[id])
      .then(data => {
        const maps = data.rows;
        console.log('Maps are', maps);
        res.render("index",{ maps, apiKey });
        // res.json(maps);
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
    let id = parseInt(req.params.id);
    db.query(query, [id])
      .then(data => {
        const maps = data.rows;
        console.log('Favourites are', maps);
        res.render("index", {maps, apiKey});
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  router.get("/:id/login", (req, res) => {
    let userId = req.params.id;
    db.query(`SELECT id FROM users WHERE id = $1`,[userId])
      .then(data => {
        console.log('Data rows is', data.rows);
        if (data.rows.length === 0) {
          res
            .status(404)
            .send(`User with id ${userId} doesn't exist`);
        } else {
          req.session.userId = userId;
          console.log('Session userId is', req.session.userId);
          res.redirect('/maps');
        }
      })
      .catch(err => {
        res
          .status(500)
          .json({error: err.message});
      });
  });
  router.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/maps");
  });
  router.put("/:userid/favourites/:mapid", (req, res) => {
    if (!req.session.userId) return res.send('Only logged in users can work with favourites');
    let userId = req.session.userId;
    let mapId = req.params.mapid;
    let query = `
    INSERT INTO favourites
    (user_id, map_id)
    VALUES
    ($1, $2)
    RETURNING *;
    `;
    console.log(query, userId, mapId);
    db.query(query,[userId, mapId])
    .then(data => {
      console.log("Added into favourites: ", data.rows[0]);
      res.redirect(req.headers.referer);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err});
    });    
  });
  router.delete("/:userid/favourites/:mapid", (req, res) => {
    if (!req.session.userId) return res.send('Only logged in users can work with favourites');
    let userId = req.params.userid;
    let mapId = req.params.mapid;
    let query = `
    DELETE from
    favourites
    WHERE user_id = $1 and map_id = $2
    RETURNING *;
    `;
    console.log(query, userId, mapId);
    db.query(query, [userId, mapId])
    .then(data => {
      console.log("Deleted the following", data.rows);
      res.redirect(req.headers.referer);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
  })
  return router;
};
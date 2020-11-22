/*
 * All routes for /locations are defined here
 */

const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.post("/", (req, res) => {
    if (!req.session.userId) return res.send('Only logged in users can add locations');
    const { locationTitle, locationUrl, locationDesc, lat, lng } = req.body;
    let mapId = req.headers.referer.split("/")[req.headers.referer.split("/").length - 1];
    let query = `
    INSERT INTO locations
    (title, image_url, description, lat, lng, created_by, map_id)
    VALUES
    ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
    `;
    let params = [locationTitle, locationUrl, locationDesc, lat, lng, parseInt(req.session.userId), parseInt(mapId)];
    console.log("Query ",query);
    console.log("params",params);
    db.query(query, params)
      .then(data => {
        console.log("Added into locations:", data.rows[0]);
        res.redirect(req.headers.referer);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  return router;
};

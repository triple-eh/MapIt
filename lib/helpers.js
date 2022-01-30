// REQUIRES: a map object containing favs_count key
// MODIFIES: map
// EFFECTS: adds favBy key converting favs_count to natural language
const appendFavByStr = (map) => {
  const count = map.favs_count;
  let str;
  if (count === "0") {
    str = "no one";
  } else {
    str = count + " " + (count === "1" ? "user" : "users");
  }
  map.favBy = str;
  return map;
};

module.exports = { appendFavByStr };
const express = require("express");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const bodyParser = require("body-parser");
const moment = require("moment");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 6969;
const dbUrl = process.env.MONGO_URI;
app.use(cors());
app.use(express.json());
function selectRandomFromArray(arr) {
  const rnd = Math.floor(Math.random() * arr.length);
  return arr[rnd];
}
function validatePirateExistene(req, res, next) {
  let reqId = req.params.id || req.body.id;
  fs.readFile("pirates.json", (err, data) => {
    if (err) throw err;
    let pirates = JSON.parse(data).crew;
    let pirate = pirates.find((p) => p.id == reqId);
    if (pirate) {
      next();
    } else {
      res.status("404").send("non existing pirate!");
    }
  });
}
function validatePirate(req, res, next) {
  let pirate = req.body;
  let isValdiBirthday = moment(pirate.birthday, "YYYY-MM-DD").isValid();
  let isValidBool =
    typeof pirate.has_wooden_leg === "boolean" ||
    pirate.has_wooden_leg == "true" ||
    pirate.has_wooden_leg == "false";
  if (isValdiBirthday && isValidBool && Number.isInteger(pirate.ship)) {
    //check ship exist
    fs.readFile("ships.json", (err, data) => {
      if (err) throw err;
      let ships = JSON.parse(data).ships;
      ship = ships.find((ship) => {
        return ship.id == pirate.ship;
      });
      if (ship) {
        next();
        return true;
      } else {
        res.status(400).send("bad request");
      }
    });
  } else {
    res.status(400).send("bad request");
  }
}
app.get("/pirates", async (req, res) => {
  fs.readFile("pirates.json", (err, data) => {
    if (err) throw err;
    let pirates = JSON.parse(data).crew;
    res.send(pirates);
  });
});

app.post("/pirates/new", validatePirate, async (req, res) => {
  fs.readFile("pirates.json", (err, data) => {
    if (err) throw err;
    let pirates = JSON.parse(data).crew;
    let maxId = 0;
    pirates.forEach((p) => {
      if (maxId < p.id) maxId = p.id;
    });
    const newId = maxId + 1;
    req.body.id = newId;
    let pirate = req.body;
    pirates.push(pirate);
    fs.writeFile("pirates.json", JSON.stringify({ crew: pirates }), () => {});
    res.send(newId.toString());
  });
});
app.post(
  "/pirates/:id/update",
  validatePirate,
  validatePirateExistene,
  async (req, res) => {
    let reqId = sanitize(parseInt(req.params.id));
    fs.readFile("pirates.json", (err, data) => {
      if (err) throw err;
      let pirates = JSON.parse(data).crew;
      let idx = pirates.findIndex((p) => p.id == reqId);
      pirates[idx] = { id: reqId, ...req.body };
      fs.writeFile("pirates.json", JSON.stringify({ crew: pirates }), () => {});
      res.status(200).send("ok");
    });
  }
);
app.post("/pirates/:id/delete", validatePirateExistene, async (req, res) => {
  let reqId = sanitize(req.params.id);
  if (!isNaN(parseInt(reqId))) {
    fs.readFile("pirates.json", (err, data) => {
      if (err) throw err;
      let pirates = JSON.parse(data).crew;
      let newJson = pirates.filter((p) => p.id != reqId);
      fs.writeFile("pirates.json", JSON.stringify({ crew: newJson }), () => {});
      res.status(200).send("ok");
    });
  } else {
    res.status(401).send("bad request");
  }
});
app.get("/pirates/:id", validatePirateExistene, async (req, res) => {
  let reqId = sanitize(req.params.id);
  fs.readFile("pirates.json", (err, data) => {
    if (err) throw err;
    let pirates = JSON.parse(data).crew;
    let requestedPirate = pirates.find((p) => p.id == reqId);
    res.send(requestedPirate);
  });
});

app.get("/ships", async (req, res) => {
  fs.readFile("ships.json", (err, data) => {
    if (err) throw err;
    let ships = JSON.parse(data).ships;
    res.send(ships);
  });
});
app.get("/ships/:id", async (req, res) => {
  let reqId = sanitize(req.params.id);
  fs.readFile("ships.json", (err, data) => {
    if (err) throw err;
    let ships = JSON.parse(data).ships;
    let requestedSpider = ships[reqId];
    res.send(requestedSpider);
  });
});
app.listen(port, () => console.log(`pirate-server running on port ${port}`));
function sanitize(v) {
  if (v instanceof Object) {
    for (var key in v) {
      if (/^\$/.test(key)) {
        delete v[key];
      } else {
        sanitize(v[key]);
      }
    }
  }
  return v;
}

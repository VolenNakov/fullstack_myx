const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const multer = require("multer");
const express = require("express");
const sqlite3 = require("sqlite3");

const db = new sqlite3.Database(
  __dirname + "/images.db",
  sqlite3.OPEN_READWRITE
);

const port = 3000;
const imageFolder = path.join(__dirname + "/uploads/");
const thumbnailFolder = path.join(__dirname + "/thumbnails/");

const upload = multer({ dest: imageFolder });

const app = express();
//App Middlewares
app.use(express.json());

//App routes

app.post("/images/", (req, res) => {
  const { pageNumber, pageSize } = req.body;
  const images = []; // Array for the image names
  try {
    db.get(`SELECT COUNT(id) FROM images`, (err, row) => {
      const total = row["COUNT(id)"];
      db.all(
        `SELECT * FROM images ORDER BY uploaded DESC LIMIT ${pageSize} OFFSET ${
          (pageNumber - 1) * pageSize
        }`,
        (err, rows) => {
          if (err) {
            return res.status(500).send(JSON.stringify(err));
          }
          rows.forEach((row) => {
            images.push(row.name);
          });
          res.status(200).send({
            images,
            paging: {
              currentPage: pageNumber,
              pageSize: pageSize,
              pageCount: Math.ceil(total / pageSize),
              total: total,
            },
          });
        }
      );
    });
  } catch (err) {
    res.status(500).send(`There was problem with your request: ${err}`);
  }
});

app.post("/upload/", upload.array("image"), async (req, res) => {
  const { files } = req;
  console.log(new Date().toLocaleString("bg-BG"));
  const file = files[0];
  await sharp(file.path)
    .resize(256, 256)
    .toFormat("webp")
    .toFile(thumbnailFolder + file.filename + ".webp");

  db.run(
    "INSERT INTO images(name, originalname, uploaded) VALUES (?,?,?)",
    [file.filename, file.originalname, Date.now()],
    (err) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send({ imageName: file.filename });
    }
  );
});

app.delete("/delete/", (req, res) => {
  const { imageName } = req.body;
  const imagePath = imageFolder + imageName;
  const thumbnailPath = thumbnailFolder + imageName + ".webp";

  if (!imageName) {
    return res.status(400).send("Missing imageName!");
  }

  db.run(`DELETE FROM images WHERE name=(?)`, [imageName], (err) => {
    if (err) {
      return res.status(500).send(JSON.stringify(err));
    }
  });
  fs.unlinkSync(imagePath);
  fs.unlinkSync(thumbnailPath);
  
  res.status(200).send(`Deleted ${imageName}`);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

//App Static files

app.use(
  "/thumbnails",
  express.static(thumbnailFolder, {
    maxAge: 86400000, //1 day cache policy
  })
);
app.use(
  "/uploads",
  express.static(imageFolder, {
    maxAge: 86400000, //1 day cache policy
  })
);
app.use("/", express.static(path.join(__dirname + "/public")));

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const express = require("express");
const sqlite3 = require("sqlite3");

const db = new sqlite3.Database(__dirname+"/images.db",sqlite3.OPEN_READWRITE);

const port = 3000;
const imageFolder = "/uploads/";
const thumbnailFolder = "/thumbnails/";

const app = express();
//App Middlewares
app.use(express.json());

function paging(inputArr, currentPage, pageSize) {
  const trimStart = (currentPage - 1) * pageSize;
  const trimEnd = trimStart + pageSize;
  const itemsQty = inputArr.length;

  const pageCount = Math.ceil(itemsQty / pageSize);

  return {
    images: inputArr.slice(trimStart, trimEnd),
    paging: {
      currentPage: currentPage,
      pageSize: pageSize,
      pageCount: pageCount,
      total: itemsQty,
    },
  };
}

//App routes

app.post("/images/", (req, res) => {
  const { pageNumber, pageSize } = req.body;
  const images = []; // Array for the image names
  try {
    fs.readdirSync(path.join(__dirname + thumbnailFolder)).forEach((fileName) =>
      images.push(fileName)
    );
    res.status(200).send(paging(images, pageNumber, pageSize));
  } catch (err) {
    res.status(500).send(`There was problem with your request: ${err}`);
  }
});

app.post("/upload/", (req, res) => {
  const { fileName } = req.body;
  console.log(req.body)
  db.run(
    "INSERT INTO images(name, created) VALUES(?, ?)",
    [fileName, Date.now()],
    (err) => {
      if (err) {
        console.log(err)
        return res.status(500).send(err)
      }
      res.status(200).send("uraaa")
      console.log("Row was added to the table: ${this.lastID}");
    }
  );

});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

//App Static files

app.use(
  "/thumbnails",
  express.static(path.join(__dirname + thumbnailFolder), {
    maxAge: 86400000, //1 day cache policy
  })
);
app.use(
  "/uploads",
  express.static(path.join(__dirname + imageFolder), {
    maxAge: 86400000, //1 day cache policy
  })
);
app.use("/", express.static(path.join(__dirname + "/public")));

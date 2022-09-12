const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");

const port = 3000;
const imageFolder = "/../images/";
const thumbnailFolder = "/../images/thumbnails/";

const app = express();
//App Middlewares
app.use(bodyParser.json());

//App Static files
app.use(
  "/thumbnails",
  express.static(path.join(__dirname + thumbnailFolder), {
    maxAge: 3600000,
  })
);
app.use(
  "/uploads",
  express.static(path.join(__dirname + imageFolder), {
    maxAge: 3600000,
  })
);
app.use("/static", express.static(path.join(__dirname + "/client")));

function paging(inputArr, currentPage, pageSize) {
  const trimStart = (currentPage - 1) * pageSize;
  const trimEnd = trimStart + pageSize;
  const itemsQty = inputArr.length;

  const pageCount = Math.ceil(itemsQty / pageSize);

  return {
    data: inputArr.slice(trimStart, trimEnd),
    paging: {
      page: currentPage,
      pageSize: pageSize,
      pageCount: pageCount,
      total: itemsQty,
    },
  };
}

//App routes

app.post("/images/", (req, res) => {
  const { pageNumber, pageSize } = req.body;
  const images = [];
  fs.readdirSync(path.join(__dirname + thumbnailFolder)).forEach((fileName) =>
    images.push(fileName)
  );
  res.send(paging(images, pageNumber, pageSize));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

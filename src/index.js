const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const gm = require('gm');

const app = express();

const fs = require("fs");

const port = 3000;
const imageFolder = "/../images/";

app.use(bodyParser.json());
// TODO Трябва да сменя express.static с res.sendFile(path.join(public, 'index.html'));
app.use("/uploads", express.static(path.join(__dirname + "/../images"),{maxAge:3600000}));
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

app.post("/images/", async (req, res) => {
  const images = [];
  fs.readdirSync(path.join(__dirname + imageFolder)).forEach((file) =>
    images.push(file)
  );
  res.send(paging(images, req.body.pageNumber, 25));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

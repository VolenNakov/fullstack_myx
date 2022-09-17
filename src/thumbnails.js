const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const images = fs.readdirSync(path.join(__dirname + "/uploads/"));
const index = images.indexOf("thumbnails");
images.splice(index, 1);
images.forEach((image) => {
  const imageLocation = path.join(__dirname + "/uploads/" + image);
  sharp(imageLocation)
    .metadata()
    .then((info) => {
      const width = 255;
      //  Math.round(info.width * 0.15);
      const height = 255;
      // Math.round(info.height * 0.15);
      sharp(imageLocation)
        .resize(width, height)
        .toFormat("webp")
        .toFile(
          path.join(__dirname + "/thumbnails/" + image + ".webp"),
          (err, info) => {
            // console.log(info);
          }
        );
    });
});

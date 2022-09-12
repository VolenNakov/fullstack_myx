function getImages(pageNumber) {
  const fetchData = {
    method: "POST",
    body: JSON.stringify({ pageNumber: pageNumber }),
    headers: new Headers({
      "Content-Type": "application/json; charset=UTF-8",
    }),
  };

  fetch("http://localhost:3000/images", fetchData)
    .then((res) => res.json())
    .then((data) =>
      data.data.forEach((element) => {
        let img = new Image();
        img.src = `http://localhost:3000/uploads/${element}`;
        document.body.appendChild(img);
      })
    )
}
getImages(1);
let currentPage = 1;
const handleInfiniteScroll = () => {
  const endOfPage =
    window.innerHeight + window.pageYOffset >= document.body.offsetHeight;

  if (endOfPage) {
    getImages(currentPage + 1);
    currentPage++;
  }
};
window.addEventListener("scroll", handleInfiniteScroll);

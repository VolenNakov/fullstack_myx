const container = document.querySelector("#container");
const modal = document.querySelector("#modal");
const modalImg = document.querySelector("#modalImg");
const cardTemplate = document.querySelector("#card-template");

const closeBtn = document.querySelector(".close");
closeBtn.onclick = () => {
  modal.style.display = "none";
};

let currentPage = 1;
let pageCount;
let pageSize;

const getImages = async (pageNumber, pageSize) => {
  const fetchData = {
    method: "POST",
    body: JSON.stringify({ pageNumber: pageNumber, pageSize: pageSize }),
    headers: new Headers({
      "Content-Type": "application/json; charset=UTF-8",
    }),
  };

  const response = await fetch("http://localhost:3000/images", fetchData);
  const data = await response.json();

  pageCount = data.paging.pageCount;
  currentPage = data.paging.currentPage;

  data.images.forEach((imageName) => {
    const card = cardTemplate.content.cloneNode(true);
    const img = card.querySelector("img");

    img.src = `http://localhost:3000/thumbnails/${imageName}`;
    img.classList.add("skeleton");
    img.onclick = () => {
      modal.style.display = "block";
      modalImg.src = `http://localhost:3000/uploads/${
        imageName.split(".webp")[0]
      }`;
    };
    img.onload = () => {
      img.classList.remove("skeleton");
    };

    container.appendChild(card);
  });
};

let throttleTimer;
const throttle = (callback, time) => {
  if (throttleTimer) return;

  throttleTimer = true;

  setTimeout(() => {
    callback();
    throttleTimer = false;
  }, time);
};

const removeInfiniteScroll = () => {
  window.removeEventListener("scroll", handleInfiniteScroll);
};

const handleInfiniteScroll = () => {
  throttle(async () => {
    const endOfPage =
      window.innerHeight + window.pageYOffset >= document.body.offsetHeight;

    if (endOfPage) {
      cardsPerRow = Math.floor(container.offsetWidth / 255);
      rowsPerWindow = Math.floor(window.innerHeight / 255) + 1;

      pageSize = cardsPerRow * rowsPerWindow;

      await getImages(currentPage + 1, pageSize);
    }

    if (currentPage === pageCount) {
      removeInfiniteScroll();
    }
  }, 500);
};

window.addEventListener("scroll", handleInfiniteScroll);

window.onload = async () => {
  cardsPerRow = Math.floor(container.offsetWidth / 255);
  rowsPerWindow = Math.floor(window.innerHeight / 255) + 1; //The + 1 is to make sure that the window has scroll bar

  pageSize = cardsPerRow * rowsPerWindow;
  await getImages(currentPage, pageSize * 5);
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

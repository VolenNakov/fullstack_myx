let currentPage = 1;
const skeletCount = 5;
let pageSize = 30;
let container, loader, modal, modalImg, closeBtn;

function getImages(pageNumber, pageSize) {
  const fetchData = {
    method: "POST",
    body: JSON.stringify({ pageNumber: pageNumber, pageSize: pageSize }),
    headers: new Headers({
      "Content-Type": "application/json; charset=UTF-8",
    }),
  };

  fetch("http://localhost:3000/images", fetchData)
    .then((res) => res.json())
    .then((resData) =>
      resData.data.forEach((element) => {
        const card = document.createElement("div");
        card.className = "card";

        const img = new Image();
        img.src = `http://localhost:3000/thumbnails/${element}`;
        img.onclick = () => {
          modal.style.display = "block";
          modalImg.src = `http://localhost:3000/uploads/${
            element.split(".webp")[0]
          }`;
        };

        const zoomIcon = document.createElement("span");
        zoomIcon.className = "material-symbols-outlined";
        zoomIcon.innerHTML = "zoom_out_map";

        card.appendChild(zoomIcon);
        card.appendChild(img);
        container.appendChild(card);
      })
    );
}

let throttleTimer;
const throttle = (callback, time) => {
  if (throttleTimer) return;

  throttleTimer = true;

  setTimeout(() => {
    callback();
    throttleTimer = false;
  }, time);
};

const handleInfiniteScroll = () => {
  throttle(() => {
    const endOfPage =
      window.innerHeight + window.pageYOffset >= document.body.offsetHeight;

    if (endOfPage) {
      getImages(currentPage + 1, pageSize);
    }

    // if (currentPage === pageCount) {
    //   removeInfiniteScroll();
    // }
  }, 1000);
};

window.addEventListener("scroll", handleInfiniteScroll);

document.addEventListener("DOMContentLoaded", () => {
  loader = document.querySelector("#loader");
  container = document.querySelector("#container");
  modal = document.querySelector("#modal");
  modalImg = document.querySelector("#modalImg");
  closeBtn = document.querySelector(".close");

  closeBtn.onclick = () => {
    modal.style.display = "none";
  };

  const cardSkeleton = document.createElement("div");
  cardSkeleton.className = "card-skeleton";
  for (let i = 0; i < skeletCount; i++) {
    loader.appendChild(cardSkeleton.cloneNode(true));
  }
});

window.onload = () => {
  getImages(currentPage, pageSize);
};

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
} 

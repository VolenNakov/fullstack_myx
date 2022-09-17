let currentPage = 1,
  pageCount,
  pageSize;

const container = document.querySelector("#container");
const modal = document.querySelector("#modal");
const modalImg = document.querySelector("#modalImg");
const cardTemplate = document.querySelector("#card-template");

const closeBtn = document.querySelector(".close");
closeBtn.onclick = () => {
  modal.style.display = "none";
};

const favorite = document.querySelector(".star");
favorite.onclick = () => {
  const _favorites = parseLocalStorage("favorites");
  const imageName = modalImg.src.split("uploads/")[1];
  _favorites.includes(imageName)
    ? (_favorites.splice(_favorites.indexOf(imageName), 1),
      document.getElementById(imageName).classList.remove("favorite"))
    : (_favorites.push(imageName),
      document.getElementById(imageName).classList.add("favorite"));

  localStorage.setItem("favorites", JSON.stringify(_favorites));
};

const favorites = document.querySelector("#favorites");
let favoritesToggle = true;
favorites.onclick = () => {
  if (favoritesToggle) {
    container.innerHTML = "";
    const _favorites = parseLocalStorage("favorites");
    _favorites.forEach((image) => {
      createCard(image);
    });
  } else {
    container.innerHTML = "";
    currentPage = 0;
    getImages(1, 100);
  }
  favoritesToggle = !favoritesToggle;
};

const parseLocalStorage = (key) => {
  const data = localStorage.getItem(key);
  return JSON.parse(data);
};

const createCard = (imageName, first) => {
  const card = cardTemplate.content.cloneNode(true);
  const img = card.querySelector("img");
  img.id = imageName;
  const favorites = parseLocalStorage("favorites");

  if (favorites.includes(imageName)) {
    img.classList.add("favorite");
  }

  img.src = `http://localhost:3000/thumbnails/${imageName}.webp`;
  img.classList.add("skeleton");
  img.onclick = () => {
    modal.style.display = "block";
    modalImg.style.display = "none";
    modalImg.onload = () => {
      modalImg.style.display = "block";
    };
    modalImg.src = `http://localhost:3000/uploads/${imageName}`;
  };
  img.onload = () => {
    img.classList.remove("skeleton");
  };

  first ? container.append(card) : container.prepend(card);
};

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

  if (data.paging.total != 0) {
    pageCount = data.paging.pageCount;
    currentPage = data.paging.currentPage;

    data.images.forEach((imageName) => {
      createCard(imageName, true);
    });
  }
};

const uploadImage = (file) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("image", file, file.name);

    const fetchData = {
      method: "POST",
      body: formData,
    };
    setTimeout(() => {
      fetch("http://localhost:3000/upload", fetchData)
        .then((res) => res.json())
        .then((data) => createCard(data.imageName), resolve());
    }, 3000);
  });
};

const uploadImages = async () => {
  const files = [...document.querySelector("#upload").files];
  files.sort((a, b) => b.lastModified - a.lastModified);
  const batches = [];
  const batchesSize = 25;

  for (let i = 0; i < files.length; i += batchesSize) {
    batches.push(files.slice(i, i + batchesSize));
  }

  for (let i = 0; i < batches.length; i++) {
    const promises = [];

    for (let j = 0; j < batches[i].length; j++) {
      promises.push(uploadImage(batches[i][j]));
    }
    await Promise.all(promises);
  }
  currentPage += files.length / pageSize;
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
      window.removeEventListener("scroll", handleInfiniteScroll);
    }
  }, 500);
};

window.addEventListener("scroll", handleInfiniteScroll);

window.onload = async () => {
  if (!parseLocalStorage("favorites")) {
    localStorage.setItem("favorites", "[]");
  }
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

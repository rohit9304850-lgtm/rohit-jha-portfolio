const openPhotoButton = document.getElementById("openPhoto");
const photoModal = document.getElementById("photoModal");
const closePhotoButton = document.getElementById("closePhoto");

function openPhoto() {
  photoModal.classList.add("is-open");
  photoModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  closePhotoButton.focus();
}

function closePhoto() {
  photoModal.classList.remove("is-open");
  photoModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  openPhotoButton.focus();
}

openPhotoButton.addEventListener("click", openPhoto);
closePhotoButton.addEventListener("click", closePhoto);

photoModal.addEventListener("click", (event) => {
  if (event.target === photoModal) closePhoto();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && photoModal.classList.contains("is-open")) {
    closePhoto();
  }
});

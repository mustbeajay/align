import { backend } from "./services/mockBackend.js";

document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const navLinks = document.querySelector(".nav-links");
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      mobileMenuBtn.classList.toggle("active");
    });
  }

  const currentUser = backend.getCurrentUser();

  if (currentUser) {
    const navBtn = document.getElementById("authBtn");
    if (navBtn) {
      navBtn.textContent = "Dashboard";
      navBtn.href = "dashboard.html";
    }

    const heroBtn = document.querySelector(".hero .btn-large");
    if (heroBtn) {
      heroBtn.innerHTML = 'Launch App <span class="arrow">→</span>';
      heroBtn.href = "dashboard.html";
    }

    const subText = document.querySelector(".sub-text");
    if (subText)
      subText.textContent = `Welcome back, ${currentUser.name.split(" ")[0]}`;
  }
});

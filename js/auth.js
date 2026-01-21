import { backend } from "./services/mockBackend.js";

if (backend.getCurrentUser()) {
  window.location.replace("dashboard.html");
}

const tabs = document.querySelectorAll(".tab-btn");
const forms = document.querySelectorAll(".auth-form");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    forms.forEach((f) => f.classList.remove("active"));
    tab.classList.add("active");
    const targetId = tab.dataset.target;
    document.getElementById(targetId).classList.add("active");
    document
      .querySelectorAll(".error-msg")
      .forEach((el) => (el.textContent = ""));
  });
});

const avatars = document.querySelectorAll(".avatar-option");
let selectedAvatar = "av-1";
avatars.forEach((av) => {
  av.addEventListener("click", () => {
    avatars.forEach((a) => a.classList.remove("selected"));
    av.classList.add("selected");
    selectedAvatar = av.dataset.id;
  });
});

const patterns = {
  email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  name: /^[a-zA-Z\s]{2,}$/,
};

function showError(input, message) {
  const parent = input.parentElement;
  let error = parent.querySelector(".validation-msg");
  if (!error) {
    error = document.createElement("span");
    error.className = "validation-msg";
    parent.appendChild(error);
  }
  error.textContent = message;
  void error.offsetWidth;
  error.classList.add("visible");
  input.classList.add("input-error");
  input.classList.add("shake");
  setTimeout(() => input.classList.remove("shake"), 500);
}

function clearError(input) {
  const parent = input.parentElement;
  const error = parent.querySelector(".validation-msg");
  if (error) {
    error.classList.remove("visible");
    setTimeout(() => error.remove(), 300);
  }
  input.classList.remove("input-error");
}

function validateField(input, type) {
  const value = input.value.trim();
  if (!value) {
    showError(input, "This field is required");
    return false;
  }
  if (type === "email" && !patterns.email.test(value)) {
    showError(input, "Invalid email address");
    return false;
  }
  if (type === "password" && !patterns.password.test(value)) {
    showError(input, "Password must be 8+ chars, incl. UPPER, lower & number");
    return false;
  }
  if (type === "name" && !patterns.name.test(value)) {
    showError(input, "Valid name required");
    return false;
  }
  clearError(input);
  return true;
}

document
  .querySelectorAll("input")
  .forEach((input) => input.addEventListener("input", () => clearError(input)));

const loginForm = document.getElementById("login-form");
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email");
  const pass = document.getElementById("login-pass");
  if (!validateField(email, "email") || !validateField(pass, "password"))
    return;

  setLoading(loginForm.querySelector("button"), true);
  const result = await backend.login(email.value, pass.value);
  setLoading(loginForm.querySelector("button"), false);

  if (result.success) window.location.href = "dashboard.html";
  else {
    document.getElementById("login-error").textContent = result.error;
    loginForm.querySelector("button").classList.add("shake");
    setTimeout(
      () => loginForm.querySelector("button").classList.remove("shake"),
      500,
    );
  }
});


const regForm = document.getElementById("signup-form");
regForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("reg-name");
  const email = document.getElementById("reg-email");
  const pass = document.getElementById("reg-pass");
  if (
    !validateField(name, "name") ||
    !validateField(email, "email") ||
    !validateField(pass, "password")
  )
    return;

  setLoading(regForm.querySelector("button"), true);
  const result = await backend.register(
    name.value,
    email.value,
    pass.value,
    selectedAvatar,
  );
  setLoading(regForm.querySelector("button"), false);

  if (result.success) window.location.href = "dashboard.html";
  else {
    document.getElementById("reg-error").textContent = result.error;
    regForm.querySelector("button").classList.add("shake");
    setTimeout(
      () => regForm.querySelector("button").classList.remove("shake"),
      500,
    );
  }
});

function setLoading(btn, isLoading) {
  if (isLoading) {
    btn.dataset.original = btn.innerText;
    btn.innerText = "Processing...";
    btn.disabled = true;
    btn.style.opacity = "0.7";
  } else {
    btn.innerText = btn.dataset.original;
    btn.disabled = false;
    btn.style.opacity = "1";
  }
}

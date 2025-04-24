import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Firebase yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyCq6n-YI2zyisjbH_z3hSGK9AcqpYepIo0",
  authDomain: "belboo-s-domain.firebaseapp.com",
  projectId: "belboo-s-domain",
  storageBucket: "belboo-s-domain.firebasestorage.app",
  messagingSenderId: "376250568269",
  appId: "1:376250568269:web:94b394f67f19b0ce3d1604",
  measurementId: "G-ZVTL36WRYP",
};

// Firebase'i başlat
initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// Expose auth and db globally for non-module scripts
window.auth = auth;
window.db = db;

// Kullanıcı giriş kontrolü
function checkUserLogin() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User is logged in:", user.email);
      sessionStorage.setItem("isLoggedIn", "true");
    } else {
      sessionStorage.setItem("isLoggedIn", "false");
      const page = window.location.pathname.split("/").pop().toLowerCase();
      if (page === "login.html") return; // don't redirect if on login page
      console.log("No user is logged in. Redirecting to login page...");
      window.location.href = "login.html";
    }
  });
}

// Sayfa yüklendiğinde kontrol et
window.addEventListener("DOMContentLoaded", () => {
  checkUserLogin();
});

export { auth, db };

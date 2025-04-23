import { auth, db } from "./Shared.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

onAuthStateChanged(auth, (user) => {
  if (!user) return;
  const form = document.getElementById("calorie-form");
  const list = document.getElementById("calorie-list");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const food = document.getElementById("food-name").value.trim();
    const calories = parseInt(document.getElementById("calories").value, 10);
    if (!food || isNaN(calories)) return;
    try {
      await addDoc(collection(db, "calories"), {
        uid: user.uid,
        food,
        calories,
        createdAt: serverTimestamp(),
      });
      form.reset();
    } catch (err) {
      console.error("Error adding document:", err);
    }
  });

  const q = query(
    collection(db, "calories"),
    where("uid", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {
    list.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      const li = document.createElement("li");
      li.className =
        "list-group-item d-flex justify-content-between align-items-center";
      li.textContent = data.food;
      const span = document.createElement("span");
      span.textContent = data.calories + " kcal";
      li.appendChild(span);
      list.appendChild(li);
    });
  });
});

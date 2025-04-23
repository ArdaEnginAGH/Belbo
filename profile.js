import { auth, db } from "./Shared.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registrationForm");
  if (!form) return; // Güvenlik kontrolü

  const inputs = form.querySelectorAll("input");
  const saveButton = document.getElementById("saveButton");
  const editButton = document.getElementById("editButton");

  // Kullanıcı girişi kontrolü ve verileri yükleme
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const uid = user.uid;
      const docRef = doc(db, "users", uid);

      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          inputs[0].value = data.firstName || "";
          inputs[1].value = data.lastName || "";
          inputs[2].value = data.phone || "";
          inputs[3].value = data.age || "";
          inputs[4].value = data.email || "";
          inputs[5].value = data.weight || "";
          inputs[6].value = data.height || "";
          inputs[7].value = data.caloriGoal || "";
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    } else {
      window.location.href = "Login.html"; // Giriş yoksa yönlendir
    }
  });

  // Edit butonu
  editButton.addEventListener("click", () => {
    inputs.forEach((input, index) => {
      if (index !== 4) input.disabled = false;
    });
    saveButton.disabled = false;
    editButton.disabled = true;
  });

  // Save işlemi
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("User not authenticated.");

    const uid = user.uid;
    const userData = {
      firstName: inputs[0].value,
      lastName: inputs[1].value,
      phone: inputs[2].value,
      age: inputs[3].value,
      email: inputs[4].value,
      weight: inputs[5].value,
      height: inputs[6].value,
      caloriGoal: inputs[7].value,
    };

    try {
      await setDoc(doc(db, "users", uid), userData);
      alert("Profile updated successfully!");
      inputs.forEach((input) => (input.disabled = true));
      saveButton.disabled = true;
      editButton.disabled = false;
    } catch (error) {
      console.error("Save error", error);
      alert("Error saving data. Please try again.");
    }
  });
});

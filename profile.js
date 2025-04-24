import { auth, db } from "./Shared.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  Timestamp,
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
        const data = docSnap.exists() ? docSnap.data() : {};
        inputs[0].value = data.firstName || "";
        inputs[1].value = data.lastName || "";
        inputs[2].value = data.phone || "";
        inputs[3].value = data.age || "";
        inputs[4].value = data.email || "";
        inputs[5].value = data.weight || "";
        inputs[6].value = data.height || "";
        inputs[7].value = data.caloriGoal || "";

        // Calculate and display current BMI
        const weight = parseFloat(data.weight);
        const height = parseFloat(data.height);
        if (!isNaN(weight) && !isNaN(height) && height > 0) {
          const bmi = weight / ((height / 100) * (height / 100));
          document.getElementById("current-bmi").innerText = bmi.toFixed(1);
        }
        // Calculate today's total calories
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        const calRef = collection(db, "calories");
        const q = query(
          calRef,
          where("uid", "==", uid),
          where("dateTime", ">=", start),
          where("dateTime", "<=", end)
        );
        const snapshot = await getDocs(q);
        let sum = 0;
        snapshot.forEach((doc) => {
          sum += doc.data().calories || 0;
        });
        document.getElementById("today-calories").innerText = sum;

        // Set avatar if saved
        if (data.photoData) {
          document.getElementById("profileAvatar").src = data.photoData;
        }
        // Listen to today's calories in real time
        const today = new Date();
        const startDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        const endDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59,
          999
        );
        const startTS = Timestamp.fromDate(startDate);
        const endTS = Timestamp.fromDate(endDate);
        const calQuery = query(
          collection(db, "calories"),
          where("uid", "==", uid),
          where("dateTime", ">=", startTS),
          where("dateTime", "<=", endTS)
        );
        onSnapshot(calQuery, (snap) => {
          let total = 0;
          snap.forEach((doc) => (total += doc.data().calories || 0));
          document.getElementById("today-calories").innerText = total;
        });
        // Handle profile picture upload
        const fileInput = document.getElementById("profilePicInput");
        fileInput.addEventListener("change", async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = async (evt) => {
            const dataUrl = evt.target.result;
            document.getElementById("profileAvatar").src = dataUrl;
            await updateDoc(docRef, { photoData: dataUrl });
          };
          reader.readAsDataURL(file);
        });
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
      // merge profile data to preserve photoData
      await setDoc(doc(db, "users", uid), userData, { merge: true });
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

<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBG6-3GFkFX10m6nbpUXWWlN4doDhzX2zQ",
    authDomain: "project-25058042795908309.firebaseapp.com",
    databaseURL: "https://project-25058042795908309-default-rtdb.firebaseio.com",
    projectId: "project-25058042795908309",
    storageBucket: "project-25058042795908309.firebasestorage.app",
    messagingSenderId: "458596677207",
    appId: "1:458596677207:web:db69c0148ec25ca3e31512",
    measurementId: "G-J57TMYXRBT"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>

// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyFEEoPZh7DcbFPIy9yXcM_DhoCmRnfFs",
  authDomain: "fiveten-5c5b6.firebaseapp.com",
  databaseURL: "https://fiveten-5c5b6-default-rtdb.firebaseio.com",
  projectId: "fiveten-5c5b6",
  storageBucket: "fiveten-5c5b6.appspot.com",
  messagingSenderId: "144708772155",
  appId: "1:144708772155:web:df5f00b87112c54985d71e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 🏆 Function to add player to Firebase with 0 points
function addPlayer(playerName) {
    if (!playerName) {
        alert("Enter a valid name!");
        return;
    }

    const playerRef = ref(db, "scoreboard/" + playerName);

    // Add player to Firebase and wait for the operation to complete
    get(playerRef).then((snapshot) => {
        if (!snapshot.exists()) {
            return set(playerRef, { score: 0 }); // Start new players at 0 points
        }
    }).then(() => {
        // Navigate to the scoreboard page after the player has been added
        window.location.href = 'scoreboard.html';
    }).catch(error => {
        console.error("Error adding player:", error);
        alert("There was an error adding the player. Please try again.");
    });
}

// 🎯 Event Listener for "Join Game" Button
document.getElementById('playerForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const playerName = document.getElementById('playerName').value.trim();
    if (playerName) {
        addPlayer(playerName);
    }
});

// 📊 Function to update scoreboard live
function updateScoreboard() {
    const scoreboardRef = ref(db, "scoreboard");

    onValue(scoreboardRef, (snapshot) => {
        let scores = snapshot.val() || {};
        let scoreList = document.getElementById("scoreList");

        if (!scoreList) return;  // Prevent errors if element is missing

        scoreList.innerHTML = ""; // Clear existing list

        for (let player in scores) {
            let li = document.createElement("li");
            li.className = "list-group-item";
            li.textContent = `${player}: ${scores[player].score} points`;
            scoreList.appendChild(li);
        }
    });
}

// 🔥 Initialize scoreboard if on scoreboard.html
if (window.location.pathname.endsWith("scoreboard.html")) {
    updateScoreboard();
}

// 🔄 Function to reset scoreboard (Remove all players)
function resetScoreboard() {
    console.log("✅ Reset Scoreboard function called."); // Debugging log

    if (confirm("Are you sure you want to remove all players? This cannot be undone.")) {
        const scoreboardRef = ref(db, "scoreboard"); // Correct database reference

        // Use `remove()` instead of `set(null)`
        remove(scoreboardRef)
            .then(() => {
                console.log("✅ All players removed from scoreboard.");
                alert("Scoreboard has been cleared! All players removed.");

                // Clear the displayed scoreboard in the HTML
                const scoreList = document.getElementById("scoreList");
                if (scoreList) scoreList.innerHTML = "";
            })
            .catch(error => {
                console.error("❌ Error resetting scoreboard:", error);
                alert("Failed to clear scoreboard. Please try again.");
            });
    }
}

// 📋 Function to mark player as ready
function markPlayerReady(playerName) {
    if (!playerName) return;

    const playerReadyRef = ref(db, `readyPlayers/${playerName}`);
    set(playerReadyRef, true) // Set player's ready status
        .then(() => {
            console.log(`${playerName} is now ready.`);
            checkAllPlayersReady(); // Check if all players are ready
        })
        .catch(error => {
            console.error("Error marking player as ready:", error);
        });
}

// 📊 Function to check if all players are ready
function checkAllPlayersReady() {
    const readyPlayersRef = ref(db, "readyPlayers");

    onValue(readyPlayersRef, (snapshot) => {
        const readyPlayers = snapshot.val();
        if (readyPlayers && Object.keys(readyPlayers).length === Object.keys(scores).length) {
            // If the number of ready players equals the number of players in scoreboard
            window.location.href = 'game.html'; // Redirect to game.html
        }
    });
}

// 🟢 Event Listener for "Ready" Button
document.getElementById('readyButton')?.addEventListener('click', function () {
    const playerName = prompt("Enter your name to mark as ready:"); // Get player's name
    if (playerName) {
        markPlayerReady(playerName);
    } else {
        alert("Please enter a valid name.");
    }
});

// Ensure DOM is fully loaded before adding event listeners
document.addEventListener("DOMContentLoaded", function () {
    const resetButton = document.getElementById("resetButton");
    if (resetButton) {
        resetButton.addEventListener("click", resetScoreboard);
        console.log("✅ Reset button event listener added.");
    } else {
        console.error("❌ Reset button not found in the DOM!");
    }
});

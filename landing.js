var firebaseConfig = {
    apiKey: "AIzaSyAWEDaKAL7qPG8V-pP8ApEUyHJ10OMjL30",
    authDomain: "login-e039f.firebaseapp.com",
    databaseURL: "https://login-e039f-default-rtdb.firebaseio.com",
    projectId: "login-e039f",
    storageBucket: "login-e039f.appspot.com",
    messagingSenderId: "106813391540",
    appId: "1:106813391540:web:9e8d333d9a5b201c180de1"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
// Function to update the user's display name on the landing page
function updateUserDisplayName() {
    var user = firebase.auth().currentUser;
    if (user) {
        var userNameDisplay = document.getElementById('userNameDisplay');
        var displayName = user.displayName;
        if (displayName) {
            userNameDisplay.textContent = "Welcome, " + displayName + "!";
        } else {
            userNameDisplay.textContent = "Welcome!";
        }
    }
}

// Call updateUserDisplayName() after handleAuthenticationSuccess()
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        updateUserDisplayName();
    }
});

// Add event listeners for buttons
document.getElementById("goBackBtn").addEventListener("click", function() {
    window.location.href = "login.html";
});

document.getElementById("toDoBtn").addEventListener("click", function() {
    window.location.href = "todo.html";
});
document.getElementById("flashcardBtn").addEventListener("click", function() {
    window.location.href = "flashcard.html";
});
document.getElementById("studyTimerButton").addEventListener("click", function() {
    // Pass the userId to studytimer.html
    window.location.href = "studytimer.html?userId=" + firebase.auth().currentUser.uid;
});


function fetchMotivationalQuote() {
    var quoteDisplay = document.getElementById('quoteDisplay'); // Get the element to display the quote
    fetch('https://type.fit/api/quotes')
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            // Get a random quote from the API response
            var randomIndex = Math.floor(Math.random() * data.length);
            var quote = data[randomIndex].text;
            quoteDisplay.textContent = '"' + quote + '"';
        })
        .catch(function(error) {
            console.error('Error fetching motivational quote:', error);
        });
}
fetchMotivationalQuote();
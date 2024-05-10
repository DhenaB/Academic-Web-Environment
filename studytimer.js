// Initialize Firebase
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

var timer;
var isTimerRunning = false;
var seconds = 0;
var minutes = 0;
var hours = 0;
var userId; // Variable to store current user's ID

// Function to start listening for user's timer data
// Function to start listening for user's timer data
function startStudyTimerListener(userId) {
    db.collection("users").doc(userId).onSnapshot(function (doc) {
        if (doc.exists) {
            var timerData = doc.data().timer;
            if (timerData) {
                hours = timerData.hours || 0;
                minutes = timerData.minutes || 0;
                seconds = timerData.seconds || 0;
                isTimerRunning = timerData.isRunning || false;
                updateTimerDisplay();
                if (isTimerRunning) {
                    startStudyTimer();
                }
            } else {
                console.error("Timer data not found for user:", userId);
            }
        } else {
            console.warn("Document does not exist for user:", userId);
            // Create a new document for the user
            db.collection("users").doc(userId).set({
                timer: {
                    seconds: 0,
                    minutes: 0,
                    hours: 0,
                    isRunning: false
                }
            })
            .then(function () {
                console.log("New document created for user:", userId);
                // Now that the document is created, start listening again
                startStudyTimerListener(userId);
            })
            .catch(function (error) {
                console.error("Error creating document for user:", userId, error);
            });
        }
    }, function (error) {
        console.error("Error retrieving timer data:", error);
    });
}



// Function to update the timer data in the database
function updateTimerData(userId, timerData) {
    db.collection("users").doc(userId).update({
        timer: timerData // Assuming "timer" is the field in the user document storing timer data
    })
    .then(function () {
        console.log("Timer data updated successfully");
    })
    .catch(function (error) {
        console.error("Error updating timer data: ", error);
    });
}

// Function to handle starting the study timer
function startStudyTimer() {
    if (!isTimerRunning) {
        timer = setInterval(function () {
            seconds++;
            if (seconds === 60) {
                seconds = 0;
                minutes++;
                if (minutes === 60) {
                    minutes = 0;
                    hours++;
                }
            }
            updateTimerData(userId, { hours: hours, minutes: minutes, seconds: seconds, isRunning: true });
            updateTimerDisplay();
        }, 1000);
        isTimerRunning = true;
    }
}

// Function to handle stopping the study timer
function stopStudyTimer() {
    clearInterval(timer);
    isTimerRunning = false;
    updateTimerData(userId, { hours: hours, minutes: minutes, seconds: seconds, isRunning: false });
}

// Function to handle resetting the study timer
function resetStudyTimer() {
    clearInterval(timer);
    isTimerRunning = false;
    seconds = 0;
    minutes = 0;
    hours = 0;
    updateTimerData(userId, { hours: 0, minutes: 0, seconds: 0, isRunning: false });
    updateTimerDisplay();
}

// Function to update the timer display
function updateTimerDisplay() {
    const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
    document.getElementById('timer').textContent = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

// Function to scroll to the landing page
function scrollToLandingPage() {
    window.location.href='landing.html';
}

// Event listeners for study timer buttons
document.getElementById('startButton').addEventListener('click', startStudyTimer);
document.getElementById('stopButton').addEventListener('click', stopStudyTimer);
document.getElementById('resetButton').addEventListener('click', resetStudyTimer);
document.getElementById('goBackBtn').addEventListener('click', scrollToLandingPage);

// Get the current user
var urlParams = new URLSearchParams(window.location.search);
userId = urlParams.get('userId');

// Start study timer listener
startStudyTimerListener(userId);

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
var currentUserId = null; // Global variable to store the current user's ID

function setupListeners() {
    var modal = document.getElementById("addFlashcardModal");
    var btn = document.getElementById("addFlashcardBtn");
    var span = document.getElementsByClassName("close")[0];
    var studyTimerLink = document.getElementById('studyTimerLink'); // Assuming you have this ID set on your link

    btn.onclick = function() {
        modal.style.display = "block";
    };

    span.onclick = function() {
        modal.style.display = "none";
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    document.getElementById('saveFlashcardBtn').addEventListener('click', function() {
        var question = document.getElementById('questionInput').value;
        var answer = document.getElementById('answerInput').value;
        if (!question.trim() || !answer.trim()) {
            alert('Please enter both a question and an answer.');
            // Do not clear inputs or hide modal
        } else {
            addFlashcard(currentUserId, question, answer);
            document.getElementById('questionInput').value = "";
            document.getElementById('answerInput').value = "";
            modal.style.display = "none"; // Only hide the modal if everything is valid
        }
    });

    document.getElementById('cancelFlashcardBtn').addEventListener('click', function() {
        document.getElementById('questionInput').value = "";
        document.getElementById('answerInput').value = "";
        modal.style.display = "none"; // Hide the modal
    });

    document.getElementById("goBackBtn").addEventListener("click", function() {
        window.location.href = "landing.html";
    });

    // Set up the Study Timer link dynamically based on user authentication
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            currentUserId = user.uid;
            loadFlashcards(currentUserId);
            studyTimerLink.href = `studytimer.html?userId=${user.uid}`;
        } else {
            // Handle the case where there is no user signed in
            studyTimerLink.href = "login.html"; // Redirects to login if no user is logged in
        }
    });
}


// Function to toggle the visibility of the answer when the flashcard is clicked
function toggleAnswer(flashcardElement, event) {
    var answerElement = flashcardElement.querySelector('.answer');
    if (!answerElement.isContentEditable && !event.target.classList.contains('editBtn') && !event.target.classList.contains('saveBtn') && !event.target.classList.contains('cancelBtn') && !event.target.classList.contains('deleteBtn')) {
        answerElement.classList.toggle('show');
    }
}

// Function to load flashcards from the database
function loadFlashcards(userId) {
    var flashcardContainer = document.getElementById('flashcardContainer');
    flashcardContainer.innerHTML = ''; // Ensure container is clear before adding new elements

    db.collection("users").doc(userId).collection("flashcards").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // Avoid duplicates by checking if the element already exists
            if (!document.querySelector(`[data-id="${doc.id}"]`)) {
                var flashcardData = doc.data();
                var flashcardElement = document.createElement('div');
                flashcardElement.setAttribute('data-id', doc.id); // Set a data attribute for the flashcard ID
                flashcardElement.classList.add('flashcard', 'tooltip');
                flashcardElement.innerHTML = `
                    <div class="question">${flashcardData.question}</div>
                    <div class="answer">${flashcardData.answer}</div>
                    <span class="tooltiptext">Click to show/hide answer</span>
                    <button class="deleteBtn" data-id="${doc.id}">Delete</button>
                    <button class="editBtn" data-id="${doc.id}">Edit</button>
                    <button class="saveBtn" data-id="${doc.id}" style="display:none;">Save</button>
                    <button class="cancelBtn" data-id="${doc.id}" style="display:none;">Cancel</button>
                `;
                flashcardContainer.appendChild(flashcardElement);

                bindFlashcardEvents(flashcardElement, doc.id, userId);
            }
        });
    }).catch(function(error) {
        console.error("Error getting flashcards:", error);
    });
}

// Function to add a new flashcard to the database
function addFlashcard(userId, question, answer) {
    if (!question.trim() || !answer.trim()) {
        alert('Please enter both question and answer.');
        return;
    }

    db.collection("users").doc(userId).collection("flashcards").add({
        question: question,
        answer: answer
    }).then(function(docRef) {
        console.log("Flashcard added with ID: ", docRef.id);
        loadFlashcards(userId); // Reload flashcards to display the new one
    }).catch(function(error) {
        console.error("Error adding flashcard: ", error);
    });
}

function bindFlashcardEvents(flashcardElement, flashcardId, userId) {
    // Toggle answer visibility
    flashcardElement.addEventListener('click', function(event) {
        toggleAnswer(flashcardElement, event);
    });

    // Bind delete functionality
    flashcardElement.querySelector('.deleteBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        db.collection("users").doc(userId).collection("flashcards").doc(flashcardId).delete().then(function() {
            console.log("Flashcard successfully deleted!");
            loadFlashcards(userId); // Reload flashcards after deletion
        }).catch(function(error) {
            console.error("Error deleting flashcard: ", error);
        });
    });

    // Bind edit functionality
    flashcardElement.querySelector('.editBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        var questionElement = flashcardElement.querySelector('.question');
        var answerElement = flashcardElement.querySelector('.answer');
        questionElement.contentEditable = answerElement.contentEditable = "true";
        flashcardElement.querySelector('.editBtn').style.display = 'none';
        flashcardElement.querySelector('.saveBtn').style.display = 'inline';
        flashcardElement.querySelector('.cancelBtn').style.display = 'inline';
    });

    // Bind save functionality
    flashcardElement.querySelector('.saveBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        var questionElement = flashcardElement.querySelector('.question');
        var answerElement = flashcardElement.querySelector('.answer');
        updateFlashcard(flashcardId, questionElement.innerText, answerElement.innerText, userId, flashcardElement);
    });

    // Bind cancel functionality
    flashcardElement.querySelector('.cancelBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        loadFlashcards(userId); // Reload to revert any changes made during edit
    });
}

// Function to update flashcard in the database
function updateFlashcard(flashcardId, question, answer, userId, flashcardElement) {
    db.collection("users").doc(userId).collection("flashcards").doc(flashcardId).update({
        question: question,
        answer: answer
    }).then(() => {
        console.log("Flashcard successfully updated!");
        var questionElement = flashcardElement.querySelector('.question');
        var answerElement = flashcardElement.querySelector('.answer');
        questionElement.contentEditable = "false";
        answerElement.contentEditable = "false";
        flashcardElement.querySelector('.editBtn').style.display = 'inline-block';
        flashcardElement.querySelector('.saveBtn').style.display = 'none';
        flashcardElement.querySelector('.cancelBtn').style.display = 'none';
        loadFlashcards(userId); // Reload flashcards to update the view
    }).catch(function(error) {
        console.error("Error updating flashcard: ", error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    setupListeners(); // Set up modal and other static event listeners
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            currentUserId = user.uid;
            loadFlashcards(currentUserId);
        } else {
            // Handle the case where there is no user signed in
        }
    });
});

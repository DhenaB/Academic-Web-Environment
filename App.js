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

var authForm = document.getElementById('authForm');
var errorMessageElement = document.getElementById('errorMessage');

authForm.addEventListener('submit', function (e) {
    e.preventDefault();
});

document.getElementById('loginBtn').addEventListener('click', login);
document.getElementById('createAccountBtn').addEventListener('click', createAccount);
document.getElementById('createAccountLink').addEventListener('click', showCreateAccountForm);

function login() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function (userCredential) {
            userId = userCredential.user.uid; // Set userId here
            handleAuthenticationSuccess();
             
        })
        .catch(function (error) {
            handleAuthenticationError(error);
        });
}


function createAccount() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var username = document.getElementById('username').value;

    // Check if the username field is empty
    if (!username) {
        handleAuthenticationError({ message: 'Please provide a username.' });
        return;
    }

    // Proceed with creating the account if the username is provided
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function (userCredential) {
            // Set the username in the user's display name
            userCredential.user.updateProfile({
                displayName: username
            }).then(function () {
                handleAuthenticationSuccess();
                fetchMotivationalQuote(); // Fetch and display motivational quote
            }).catch(function (error) {
                console.error('Error setting display name: ', error);
            });
        })
        .catch(function (error) {
            handleAuthenticationError(error);
        });
}

document.getElementById('forgotPasswordLink').addEventListener('click', forgotPassword);

function forgotPassword() {
    var email = document.getElementById('email').value;

    // Check if the email field is empty
    if (!email) {
        errorMessageElement.innerHTML = 'You need to enter an email first.';
        return;
    }

    // Proceed with sending the password reset email if the email is provided
    firebase.auth().sendPasswordResetEmail(email)
        .then(function () {
            alert('Password reset email sent. Check your email inbox.');
        })
        .catch(function (error) {
            console.error('Error sending password reset email: ', error);
        });
}


function showCreateAccountForm() {
    var createAccountFields = document.getElementById('createAccountFields');
    createAccountFields.style.display = 'block';
    
    var createAccountBtn = document.getElementById('createAccountBtn');
    createAccountBtn.style.display = 'block';
    
    var loginBtn = document.getElementById('loginBtn');
    loginBtn.style.display = 'none';
    
    var createAccountLink = document.getElementById('createAccountLink');
    createAccountLink.style.display = 'none';

    // Hide the "Don't have an account? Create one" link
    var createAccountLinkText = document.getElementById('createAccountLinkText');
    createAccountLinkText.style.display = 'none';

    // Show the "Already have an account? Login" link
    var loginLinkContainer = document.getElementById('loginLinkContainer');
    loginLinkContainer.style.display = 'block';
}

function handleAuthenticationError(error) {
    var errorMessage = error.message;
    var customErrorMessage = "Incorrect Email or Password. Try Again.";

    if (errorMessage.includes("INVALID_LOGIN_CREDENTIALS")) {
        errorMessageElement.innerHTML = customErrorMessage;
    } else {
        errorMessageElement.innerHTML = 'Error: ' + errorMessage;
    }
}

// Inside handleAuthenticationSuccess function

function handleAuthenticationSuccess() {
    var user = firebase.auth().currentUser;

    if (user) {
        // Check if the user document exists in the users collection
        db.collection("users").doc(user.uid).get().then(function(doc) {
            if (doc.exists) {
                // User document exists
                console.log("User document exists");
            } else {
                // User document doesn't exist, create it
                db.collection("users").doc(user.uid).set({
                    // Initialize timer data for new user
                    timer: {
                        seconds: 0,
                        minutes: 0,
                        hours: 0,
                        isRunning: false
                    }
                }).then(function() {
                    console.log("User document created successfully");
                }).catch(function(error) {
                    console.error("Error creating user document: ", error);
                });
            }

            // Redirect to landing page
            window.location.href = 'landing.html?userId=' + user.uid;
        }).catch(function(error) {
            console.error("Error getting user document: ", error);
        });
    }
}



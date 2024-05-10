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

function updateTaskCompletion(collectionRef, taskId, isCompleted) {
    collectionRef.doc(taskId).update({
        completed: isCompleted
    }).then(() => {
        console.log("Task completion status updated.");
        // Consider whether you need to fetch tasks again here; it might not be necessary.
    }).catch((error) => {
        console.error("Error updating task completion status: ", error);
    });
}

// Function to fetch tasks from Firestore
function fetchTasks() {
    firebase.auth().onAuthStateChanged(function(user) {
        var studyTimerLink = document.getElementById('studyTimerLink');

        if (user) {
            if (studyTimerLink) {
                studyTimerLink.href = `studytimer.html?userId=${user.uid}`;
            }

            var userTasksCollection = db.collection("users").doc(user.uid).collection("tasks");
            userTasksCollection.orderBy("datetime", "desc").get()
                .then(function(querySnapshot) {
                    var todoList = document.getElementById("todoList");
                    todoList.innerHTML = "";

                    querySnapshot.forEach(function(doc) {
                        var task = doc.data().task;
                        var datetime = doc.data().datetime;
                        var completed = doc.data().completed; // Assumes a 'completed' field in your Firestore
                        var taskId = doc.id;

                        var row = document.createElement("tr");

                        var taskCell = document.createElement("td");
                        taskCell.textContent = task;
                        row.appendChild(taskCell);

                        var dateCell = document.createElement("td");
                        dateCell.textContent = new Date(datetime).toLocaleDateString();
                        row.appendChild(dateCell);

                        var timeCell = document.createElement("td");
                        timeCell.textContent = new Date(datetime).toLocaleTimeString();
                        row.appendChild(timeCell);

                        // Completed checkbox cell
                        var completedCell = document.createElement("td");
                        var completedCheckbox = document.createElement("input");
                        completedCheckbox.type = "checkbox";
                        completedCheckbox.checked = completed;
                        completedCheckbox.onchange = function() {
                            updateTaskCompletion(userTasksCollection, taskId, this.checked);
                        };
                        completedCell.appendChild(completedCheckbox);
                        row.appendChild(completedCell);

                        var actionCell = document.createElement("td");
                        var actionSelect = document.createElement("select");
                        var defaultOption = document.createElement("option");
                        defaultOption.textContent = "Select Action";
                        actionSelect.appendChild(defaultOption);
                        var editOption = document.createElement("option");
                        editOption.textContent = "Edit";
                        editOption.value = "edit";
                        actionSelect.appendChild(editOption);
                        var deleteOption = document.createElement("option");
                        deleteOption.textContent = "Delete";
                        deleteOption.value = "delete";
                        actionSelect.appendChild(deleteOption);
                        actionSelect.onchange = function() {
                            if (this.value === 'delete') {
                                deleteTask(userTasksCollection, taskId);
                            } else if (this.value === 'edit') {
                                makeRowEditable(row, taskId, userTasksCollection, datetime);
                            }
                        };
                        actionCell.appendChild(actionSelect);
                        row.appendChild(actionCell);

                        todoList.appendChild(row);
                    });
                })
                .catch(function(error) {
                    console.error("Error fetching tasks: ", error);
                });
        } else {
            if (studyTimerLink) {
                studyTimerLink.href = "login.html";
            }
            console.error("User is not authenticated.");
        }
    });
}

function makeRowEditable(row, taskId, collectionRef, datetime) {
    var taskCell = row.cells[0];
    var dateCell = row.cells[1];
    var timeCell = row.cells[2];

    // Switch to textarea for task name to better handle long text
    var taskInput = document.createElement('textarea');
    taskInput.value = taskCell.textContent;
    taskInput.classList.add('edit-input'); // Reuse the same class for styling
    taskInput.rows = 3; // Adjust the number of rows as needed
    taskCell.innerHTML = '';
    taskCell.appendChild(taskInput);

    var dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.value = new Date(datetime).toISOString().split('T')[0];
    dateInput.classList.add('edit-input');
    dateCell.innerHTML = '';
    dateCell.appendChild(dateInput);

    var timeInput = document.createElement('input');
    timeInput.type = 'time';
    timeInput.value = new Date(datetime).toTimeString().substring(0,5);
    timeInput.classList.add('edit-input');
    timeCell.innerHTML = '';
    timeCell.appendChild(timeInput);

    var selectCell = row.cells[3];
    selectCell.innerHTML = '';
    var saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.onclick = function() { saveTaskEdits(row, taskId, collectionRef); };
    selectCell.appendChild(saveButton);

    var cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = fetchTasks;
    selectCell.appendChild(cancelButton);
}



function saveTaskEdits(row, taskId, collectionRef) {
    // Update selector for taskInput to handle textarea
    var taskInputValue = row.cells[0].querySelector('textarea').value; // Changed from 'input' to 'textarea'
    var dateInputValue = row.cells[1].querySelector('input').value;
    var timeInputValue = row.cells[2].querySelector('input').value;

    var datetime = `${dateInputValue}T${timeInputValue}`;

    collectionRef.doc(taskId).update({
        task: taskInputValue, // Use the updated variable name for clarity
        datetime: datetime
    }).then(() => {
        console.log("Task updated successfully.");
        fetchTasks(); // Refresh tasks
    }).catch((error) => {
        console.error("Error updating task: ", error);
    });
}


function deleteTask(collectionRef, taskId) {
    collectionRef.doc(taskId).delete()
        .then(() => {
            console.log("Task successfully deleted");
            fetchTasks(); // Refresh tasks
        }).catch((error) => {
            console.error("Error deleting task: ", error);
        });
}


// Function to add a new task
// Function to add a new task
function addTask() {
    var taskInput = document.getElementById("taskInput");
    var task = taskInput.value.trim();
    var dateInput = document.getElementById("dateInput");
    var timeInput = document.getElementById("timeInput");
    var date = dateInput.value;
    var time = timeInput.value;
    var todoContainer = document.getElementById('todo-container');
    var inputFields = document.getElementById('inputFields');

    if (task === "" || date === "" || time === "") {
        alert("Please enter task, date, and time.");
        return;
    }

    var datetime = date + "T" + time;

    var user = firebase.auth().currentUser;
    if (user) {
        var userTasksCollection = db.collection("users").doc(user.uid).collection("tasks");
        userTasksCollection.add({
            task: task,
            datetime: datetime
        })
        .then(function(docRef) {
            console.log("Task added with ID: ", docRef.id);
            fetchTasks(); // Fetch tasks again to update the list
            taskInput.value = ""; // Clear the input fields
            dateInput.value = "";
            timeInput.value = "";
            inputFields.style.display = 'none'; // Hide input fields
            todoContainer.style.display = 'block'; // Show the todo container
            showInputsBtn.style.display = 'block';
        })
        .catch(function(error) {
            console.error("Error adding task: ", error);
        });
    } else {
        console.error("User is not authenticated.");
    }
}


// Fetch tasks when the page loads
fetchTasks();

// Add event listener for the "Add Task" button
document.getElementById("addTaskBtn").addEventListener("click", addTask);
function goBack() {
    window.location.href = "landing.html";
}
document.getElementById("goBackBtn").addEventListener("click", goBack);
document.getElementById('showInputsBtn').addEventListener('click', function() {
    var inputFields = document.getElementById('inputFields');
    var todoContainer = document.getElementById('todo-container');
    var showInputsBtn = document.getElementById('showInputsBtn'); // Get the reference to the button

    // Toggle visibility
    if (inputFields.style.display === 'none') {
        inputFields.style.display = 'block';   // Show input fields
        todoContainer.style.display = 'none';  // Hide the todo container
        showInputsBtn.style.display = 'none';  // Hide the button
    } else {
        inputFields.style.display = 'none';    // Hide input fields
        todoContainer.style.display = 'block'; // Show the todo container
        showInputsBtn.style.display = 'block'; // Show the button
    }
});

document.getElementById('cancelTaskBtn').addEventListener('click', function() {
    var todoContainer = document.getElementById('todo-container');
    var inputFields = document.getElementById('inputFields');
    var showInputsBtn = document.getElementById('showInputsBtn');

    // Reset and hide input fields
    document.getElementById("taskInput").value = '';
    document.getElementById("dateInput").value = '';
    document.getElementById("timeInput").value = '';

    // Hide input fields and show the task table and the Add New Task button
    inputFields.style.display = 'none';
    todoContainer.style.display = 'block';
    showInputsBtn.style.display = 'block'; // Show the button again
});

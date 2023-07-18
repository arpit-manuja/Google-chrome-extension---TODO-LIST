document.addEventListener("DOMContentLoaded", function () {
  var taskList = document.getElementById("task-list");
  var taskInput = document.getElementById("task-input");
  var addButton = document.getElementById("add-button");
  var prioritySelect = document.getElementById("priority-select");
  var dueDateInput = document.getElementById("due-date-input");

  // Load tasks from storage
  chrome.storage.sync.get("tasks", function (data) {
    if (data.tasks) {
      var tasks = JSON.parse(data.tasks);
      tasks.forEach(function (task) {
        createTaskElement(task.text, task.priority, task.dueDate, task.completed);
      });
    }
  });

  addButton.addEventListener("click", function () {
    var taskText = taskInput.value;
    if (taskText) {
      var taskPriority = prioritySelect.value;
      var taskDueDate = dueDateInput.value;

      // Set today's date as default if no date is selected
      if (!taskDueDate) {
        var today = new Date();
        var year = today.getFullYear();
        var month = String(today.getMonth() + 1).padStart(2, "0");
        var day = String(today.getDate()).padStart(2, "0");
        taskDueDate = `${year}-${month}-${day}`;
      }

      createTaskElement(taskText, taskPriority, taskDueDate, false);
      taskInput.value = "";

      // Save tasks to storage
      chrome.storage.sync.get("tasks", function (data) {
        var tasks = [];
        if (data.tasks) {
          tasks = JSON.parse(data.tasks);
        }
        tasks.push({
          text: taskText,
          priority: taskPriority,
          dueDate: taskDueDate,
          completed: false
        });
        tasks.sort(function (a, b) {
          return new Date(a.dueDate) - new Date(b.dueDate);
        });
        chrome.storage.sync.set({ tasks: JSON.stringify(tasks) });
      });
    }
  });

  function createTaskElement(taskText, taskPriority, taskDueDate, completed) {
    var task = document.createElement("div");
    task.className = "task";

     // Add class based on priority
              if (taskPriority === "low") {
                task.classList.add("low-priority");
              } else if (taskPriority === "medium") {
                task.classList.add("medium-priority");
              } else if (taskPriority === "high") {
                task.classList.add("high-priority");
              }







    task.innerHTML = `
      <div class="task-info">
        <div class="task-text">${taskText}</div>
        <div class="task-priority">${taskPriority}</div>
        <div class="task-due-date">${formatDate(taskDueDate)}</div>
      </div>
      <button class="delete-button">Delete</button>
    `;

    var deleteButton = task.querySelector(".delete-button");
    deleteButton.addEventListener("click", function (event) {
      event.stopPropagation();
      task.remove();

      // Remove task from storage
      chrome.storage.sync.get("tasks", function (data) {
        var tasks = [];
        if (data.tasks) {
          tasks = JSON.parse(data.tasks);
          tasks = tasks.filter(function (item) {
            return (
              item.text !== taskText ||
              item.priority !== taskPriority ||
              item.dueDate !== taskDueDate ||
              item.completed !== completed
            );
          });
          chrome.storage.sync.set({ tasks: JSON.stringify(tasks) });
        }
      });
    });

    task.addEventListener("click", function () {
      task.classList.toggle("completed");
      completed = !completed;

      // Update task completion in storage
      chrome.storage.sync.get("tasks", function (data) {
        var tasks = [];
        if (data.tasks) {
          tasks = JSON.parse(data.tasks);
          tasks.forEach(function (item) {
            if (
              item.text === taskText &&
              item.priority === taskPriority &&
              item.dueDate === taskDueDate
            ) {
              item.completed = completed;
            }
          });
          chrome.storage.sync.set({ tasks: JSON.stringify(tasks) });
        }
      });
    });

    taskList.appendChild(task);
  }

  function formatDate(date) {
    var options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(date).toLocaleDateString(undefined, options);
  }
});

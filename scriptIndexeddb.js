const indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;


const request = indexedDB.open("toDoDB2", 2);

request.onupgradeneeded = function () {
    const db = request.result;
    const store = db.createObjectStore('tasks', {keyPath: 'id', autoIncrement: true});
    store.createIndex('check', 'checked', { unique: false });
    store.createIndex('innerText', 'text', { unique: false });
    store.createIndex('existance', 'exist', { unique: false });
    
}

request.onsuccess = function () {
    const db = request.result;
    const transaction = db.transaction("tasks", "readwrite");
    
    const store = transaction.objectStore("tasks");
    const checkIndex = store.index('check');
    const innerTextIndex = store.index('innerText');
    const existanceIndex = store.index('existance');
    
    const mainBlock = document.getElementById('block');
    const mainSearch = document.getElementById('mainSearch');
    
    displayTasks(db, 'existance', 1);

    mainSearch.addEventListener('input', function () {
        if (mainSearch.value != '') {
            displayTasks(db, 'innerText', mainSearch.value);
        } else {;
            displayTasks(db, 'existance', 1);
        }
    });

    transaction.oncomplete = function () {
        document.getElementById('add').addEventListener('click', function () {
            addTask(db);
        });
    };
};


function displayTasks(db, index, get) {
    const transaction = db.transaction("tasks", "readonly");
    const store = transaction.objectStore("tasks");
    const existanceIndex = store.index(index);
    const queryAll = existanceIndex.getAll();

    console.log('db', store)
    
    queryAll.onsuccess = function () {
        let tasks = null;
        if (typeof get == 'string') {
            const allTasks = queryAll.result;
            tasks = allTasks.filter(task => task.text.includes(get))
        } else {
            tasks = queryAll.result;
        }
        const mainBlock = document.getElementById('block');
        mainBlock.innerHTML = '';
        tasks.forEach(task => {
            DOMElement(db, task, mainBlock);
        });

    }

}

function DOMElement(db, task, mainBlock) {
    const taskDiv = document.createElement('div');
    taskDiv.classList.add('main__todo');

    const label = document.createElement('label');
    const inputCheckbox = document.createElement('input');
    inputCheckbox.classList.add('check-area');
    inputCheckbox.id = 'checkArea';
    inputCheckbox.type = 'checkbox';
    inputCheckbox.name = 'check';
    inputCheckbox.checked = task.checked;

    const checkDiv = document.createElement('div');
    checkDiv.classList.add('main__check');

    label.appendChild(inputCheckbox);
    label.appendChild(checkDiv);
    taskDiv.appendChild(label);

    const descriptionDiv = document.createElement('div');
    descriptionDiv.classList.add('main__description');

    const inputTextLabel = document.createElement('label');
    const inputText = document.createElement('textarea');
    inputText.classList.add('main__input');
    inputText.type = 'text';
    inputText.maxLength = 90;
    inputText.value = task.text;
    inputText.placeholder = 'Вашa задачa';
    inputText.rows = 'auto';
    inputText.minrows = 3;

    inputTextLabel.appendChild(inputText);
    descriptionDiv.appendChild(inputTextLabel);
    taskDiv.appendChild(descriptionDiv);

    const archiveButton = document.createElement('button');
    archiveButton.classList.add('main__arch');
    archiveButton.id = 'archiveButtonLarge';
    archiveButton.textContent = 'Архивировать';
    
    taskDiv.appendChild(archiveButton);

    const archiveButtonHidden = document.createElement('button');
    archiveButtonHidden.classList.add('main__arch--hidden');
    archiveButtonHidden.display = 'none';
    archiveButtonHidden.id = 'archiveButtonSmall';
    archiveButtonHidden.innerHTML = '<img id="archive" src="./media/archive.svg"  >';

    taskDiv.appendChild(archiveButtonHidden);

    mainBlock.appendChild(taskDiv);
    
    inputCheckbox.addEventListener('click', function () {
        checkTask(db, task, inputText);
    });

    inputText.addEventListener('change', function () {
        updateText(db, task, inputText);
    })

    archiveButton.addEventListener('click', function() {
        archiveTask(db, task);
    })

    archiveButtonHidden.addEventListener('click', function() {
        archiveTask(db, task);
    })
}

function archiveTask(db, task) {
    const transaction = db.transaction("tasks", "readwrite");
    const store = transaction.objectStore("tasks");

    store.delete(task.id);

    window.location.reload();
}

function addTask(db) {
    const transaction = db.transaction("tasks", "readwrite");
    const store = transaction.objectStore("tasks");
    const newTask = { checked: false, text: '', exist: 1 };

    store.add(newTask);
    
    window.location.reload();
}

function checkTask(db, task, inputText) {
    const transaction = db.transaction("tasks", "readwrite");
    const store = transaction.objectStore("tasks");

    const isChecked = task.checked ? false : true;
    if (isChecked) {
        inputText.style.textDecoration = "line-through";
    } else {
        inputText.style.textDecoration = "none";
    }
    store.put({id: task.id, checked: isChecked, text: task.text, exist: task.exist});
}

function updateText(db, task, inputText) {
    const transaction = db.transaction("tasks", "readwrite");
    const store = transaction.objectStore("tasks");


    store.put({id: task.id, checked: task.checked, text: inputText.value, exist: task.exist});
}

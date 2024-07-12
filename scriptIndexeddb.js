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
    store.createIndex('creationDate', 'date', {unique: false });
    store.createIndex('dueTo', 'due', {unique: false});
    store.createIndex('taskTitle', 'title', {unique: false});
    store.createIndex('open', 'opened', {unique: false});
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
    
    
    transaction.oncomplete = function () {
        
        displayTasks(db, 'existance', 1);
        displayArchiveTasks(db);
    

        mainSearch?.addEventListener('input', function () {
            if (mainSearch.value != '') {
                displayTasks(db, 'existance', mainSearch.value);
            } else {
                displayTasks(db, 'existance', 1);
            }
        });

        document.getElementById('add')?.addEventListener('click', function () {
            addTask(db);
        });

        document.querySelector('.main__delete')?.addEventListener('click', function() {
            deleteAllTasks(db);
        })
    };
};


function displayTasks(db, index, get) {
    const transaction = db.transaction("tasks", "readonly");
    const store = transaction.objectStore("tasks");
    const existanceIndex = store.index(index);
    const queryAll = existanceIndex.getAll(1);
    
    queryAll.onsuccess = function () {
        let tasks = null;
        if (typeof get == 'string') {
            const allTasks = queryAll.result;
            tasks = allTasks.filter(task => task.text.includes(get) || task.title.includes(get))
        } else {
            tasks = queryAll.result;
        }
        const mainBlock = document.getElementById('block');
        if (mainBlock) {
            mainBlock.innerHTML = '';
        }
        tasks.forEach(task => {
            DOMElement(db, task, mainBlock);
        });

    }

}

function displayArchiveTasks(db) {
    const transaction = db.transaction("tasks", "readonly");
    const store = transaction.objectStore("tasks");
    const existanceIndex = store.index('existance');
    const queryAll = existanceIndex.getAll(0);

    queryAll.onsuccess = function () {
        let tasks = queryAll.result;
        const mainBlock = document.querySelector('.main__arcive');
        if (mainBlock) {
            mainBlock.innerHTML = '';
        }
        tasks.forEach(task => {
            ArchiveDOMElement(db, task, mainBlock);
        });

    }
}

function DOMElement(db, task, mainBlock) {
    const taskDiv = document.createElement('div');
    taskDiv.classList.add('main__todo');
    taskDiv.draggable = true;

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

    const descriptionTop = document.createElement('div');
    descriptionTop.classList.add('main__description-top');
    
    descriptionDiv.appendChild(descriptionTop);

    const titleLabel = document.createElement('label');
    titleLabel.classList.add('main__title-lable');
    const title = document.createElement('input');
    title.classList.add('main__title');
    title.placeholder = 'Заголовок задачи';
    title.value = task.title;

    titleLabel.appendChild(title);
    descriptionTop.appendChild(titleLabel);

    const showLabel = document.createElement('label');
    const show = document.createElement('input');
    show.classList.add('main__show');
    show.type = 'checkbox'
    const arrow = document.createElement('img');
    arrow.classList.add('main__arrow');
    if (task.opened) {
        arrow.style.transform = 'rotate(180deg)';
    } else {
        arrow.style.transform = 'rotate(0deg)';
    }
    arrow.src = './media/arrow.svg';

    showLabel.appendChild(show);
    showLabel.appendChild(arrow);
    descriptionTop.appendChild(showLabel);

    const inputTextLabel = document.createElement('label');
    inputTextLabel.classList.add('main__input-text-lable')
    if (task.opened) {
        inputTextLabel.hidden = false;
    } else {
        inputTextLabel.hidden = true;
    }
    const inputText = document.createElement('textarea');
    inputText.classList.add('main__input');
    inputText.type = 'text';
    inputText.maxLength = 200;
    inputText.value = task.text;
    inputText.placeholder = 'Описание Вашей задачи';
    inputText.rows = 'auto';
    inputText.minrows = 3;
    inputText.style.padding = '10px';

    inputTextLabel.appendChild(inputText);
    descriptionDiv.appendChild(inputTextLabel);
    taskDiv.appendChild(descriptionDiv);

    const time = document.createElement('div');
    time.classList.add('main__time');

    descriptionDiv.appendChild(time);

    const timeLeft = document.createElement('div');
    timeLeft.classList.add('time__left');
    timeLeft.innerText = 'Создана: ' + task.date;

    const timeRight = document.createElement('div');
    timeRight.classList.add('time__right');

    const timeRightText = document.createElement('span');
    timeRightText.classList.add('time__right-text');
    timeRightText.innerText = 'Сделать до: ';

    timeRight.appendChild(timeRightText);

    const timeRightInput = document.createElement('input');
    timeRightInput.classList.add('time__right-input');
    timeRightInput.type = 'datetime-local'
    timeRightInput.value = task.due

    timeRight.appendChild(timeRightInput);

    time.appendChild(timeLeft);
    time.appendChild(timeRight);

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

    mainBlock?.appendChild(taskDiv);

    if (timeRightInput.value != "" && +(new Date()) > new Date(task.due)) {
        timeRight.style.backgroundColor = '#F7E0E0';
        timeRightInput.style.backgroundColor = '#F7E0E0';
    };
    
    inputCheckbox.addEventListener('click', function () {
        checkTask(db, task, inputText);
    });

    inputText.addEventListener('input', function () {
        updateText(db, task, inputText);
    })

    title.addEventListener('input', function () {
        updateTitle(db, task, title);
    })

    Array.from([archiveButton, archiveButtonHidden]).forEach((item) => {
        item.addEventListener('click', function() {
            archiveTask(db, task);
        });
    });

    timeRightInput.addEventListener('input', function() {
        updateDueTo(db, task, timeRightInput.value);
    })

    show.addEventListener('click', function() {
        updateShow(db, task, inputTextLabel, arrow);
    })
    
}

function ArchiveDOMElement(db, task, mainBlock) {
    const taskDiv = document.createElement('div');
    taskDiv.classList.add('main__todo');
    
    const descriptionDiv = document.createElement('div');
    descriptionDiv.classList.add('main__description');
    descriptionDiv.style.height = 'auto';
    descriptionDiv.style.padding = '10px';

    const description = document.createElement('span');
    description.innerText = task.text;
    description.style.whiteSpace = 'pre-line';
    description.style.wordBreak = "break-word";

    descriptionDiv.appendChild(description);
    taskDiv.appendChild(descriptionDiv);

    const unArchiveButton = document.createElement('button');
    unArchiveButton.classList.add('main__arch');
    unArchiveButton.id = 'unArchiveButtonLarge';
    unArchiveButton.textContent = 'Разархивировать';
    
    taskDiv.appendChild(unArchiveButton);

    const unArchiveButtonHidden = document.createElement('button');
    unArchiveButtonHidden.classList.add('main__arch--hidden');
    unArchiveButtonHidden.display = 'none';
    unArchiveButtonHidden.id = 'archiveButtonSmall';
    unArchiveButtonHidden.innerHTML = '<img id="unarchive" src="./media/unarchive.svg"  >';

    taskDiv.appendChild(unArchiveButtonHidden);

    mainBlock?.appendChild(taskDiv);

    Array.from([unArchiveButton, unArchiveButtonHidden]).forEach((item) => {
        item.addEventListener('click', function() {
            unArchiveTask(db, task);
        });
    });
    
}

function deleteAllTasks(db) {
    const transaction = db.transaction("tasks", "readwrite");
    const store = transaction.objectStore("tasks");
    const existanceIndex = store.index('existance');
    const queryAll = existanceIndex.getAll(0);

    queryAll.onsuccess = function () {
        let tasks = queryAll.result;
        tasks.forEach(task => {
            store.delete(task.id);
        });
    }

    window.location.reload();

}

function unArchiveTask(db, task) {
    const transaction = db.transaction("tasks", "readwrite");
    const store = transaction.objectStore("tasks");

    store.put({id: task.id, 
               checked: task.checked, 
               text: task.text, 
               exist: 1, 
               date: task.date, 
               due: task.due,
               title: task.title,
                opened: task.opened});

    window.location.reload();
}

function archiveTask(db, task) {
    const transaction = db.transaction("tasks", "readwrite");
    const store = transaction.objectStore("tasks");

    store.put({id: task.id, 
               checked: task.checked, 
               text: task.text, 
               exist: 0, 
               date: task.date, 
               due: task.due,
               title: task.title,
               opened: task.opened});

    window.location.reload();
}

function addTask(db) {
    const transaction = db.transaction("tasks", "readwrite");
    const store = transaction.objectStore("tasks");
    const newTask = { checked: false, 
                        text: '', 
                        exist: 1, 
                        date: new Intl.DateTimeFormat('ru-RU', {year: 'numeric', month: 'numeric', day: 'numeric',
                            hour: 'numeric', minute: 'numeric',}).format(new Date()),
                        title: '',
                        opened: false, };

    store.add(newTask);
    
    window.location.reload();
}

function checkTask(db, task, inputText) {
    const transaction = db.transaction("tasks", "readwrite");
    const store = transaction.objectStore("tasks");

    const isChecked = task.checked ? false : true;
    store.put({id: task.id, 
               checked: isChecked, 
               text: task.text, 
               exist: task.exist, 
               date: task.date,
               due: task.due,
               title: task.title,
               opened: task.opened});
}

function updateText(db, task, inputText) {
    const transaction = db.transaction("tasks", "readwrite");
    const store = transaction.objectStore("tasks");

    store.put({id: task.id, 
               checked: task.checked, 
               text: inputText.value, 
               exist: task.exist, 
               date: task.date,
               due: task.due,
               title: task.title,
               opened: task.opened});
}

function updateDueTo(db, task, dueToDate) {
    const transaction = db.transaction("tasks", "readwrite");
    const store = transaction.objectStore("tasks");

    store.put({id: task.id, 
                checked: task.checked, 
                text: task.text, 
                exist: task.exist, 
                date: task.date,
                due: dueToDate,
                title: task.title,
                opened: task.opened});

    window.location.reload();
}

function updateTitle(db, task, inputTitle) {
    const transaction = db.transaction("tasks", "readwrite");
    const store = transaction.objectStore("tasks");

    store.put({id: task.id, 
               checked: task.checked, 
               text: task.text, 
               exist: task.exist, 
               date: task.date,
               due: task.due,
               title: inputTitle.value,
               opened: task.opened});
}

function updateShow(db, task, inputTextLabel, arrow) {
    const transaction = db.transaction("tasks", "readwrite");
    const store = transaction.objectStore("tasks");
    

    console.log('1', task.opened);
    if (task.opened == false) {
        console.log('2', task.opened);
        arrow.style.transform = 'rotate(0deg)';
        store.put({id: task.id, 
            checked: task.checked, 
            text: task.text, 
            exist: task.exist, 
            date: task.date,
            due: task.due,
            title: task.title,
            opened: true});
        inputTextLabel.hidden = false;
    } else {
        console.log('3', task.opened);
        arrow.style.transform = 'rotate(180deg)';
        store.put({id: task.id, 
            checked: task.checked, 
            text: task.text, 
            exist: task.exist, 
            date: task.date,
            due: task.due,
            title: task.title,
            opened: false});
        inputTextLabel.hidden = true;
    }

    window.location.reload();
   

}
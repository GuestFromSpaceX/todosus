'use strict'

let addToDo = document.querySelector('.main__add');
let mainBlock = document.getElementById('block');
let mainBlockContainer = [];
let tasks = document.getElementsByClassName('main__input');
let checkArea = document.getElementsByClassName('check-area');
let arch = document.getElementsByClassName('main__arch');


if (checkArea.length > 0) {
    checkArea[0].checked = true;
}

mainBlock.innerHTML = JSON.parse(window.localStorage.getItem('mainBlockContainer'));

addToDo.addEventListener('click', function(event) {
    mainBlockContainer.push(`<div class="main__todo">
                <label>
                    <input class="check-area" type="checkbox" name="check">
                    <div class="main__check"></div>
                </label>
                <div class="main__description">
                    <lable>
                        <input class='main__input' type="text" maxlength="90">
                    </lable>
                </div>
                <button class="main__arch">Архивировать</button>
            </div>`);

    // window.localStorage.setItem('mainBlockContainer', JSON.stringify(mainBlockContainer));

    // Array.from(mainBlockContainer).forEach((item, index, arr) => {
    //     item.innerHTML = JSON.parse(window.localStorage.getItem('mainBlockContainer'));
    // })
    
    console.log(mainBlockContainer);
    console.log(window.localStorage.getItem('mainBlockContainer'));
})




Array.from(tasks).forEach((item, index, arr) => {
    item.addEventListener("change", function(event) {
        window.localStorage.setItem(index, item.value);
    })
    item.value = window.localStorage.getItem(index)
})

Array.from(arch).forEach((item, index, arr) => {
    item.addEventListener('click', function(event) {
        console.log(window.localStorage.getItem('mainBlockContainer'));
    })
});
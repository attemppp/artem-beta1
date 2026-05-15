// =============================================
// 1. НАВИГАЦИЯ МЕЖДУ СТРАНИЦАМИ
// =============================================

// Находим все кнопки меню и все страницы
const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');

// Для каждой кнопки вешаем обработчик клика
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Убираем класс active со всех кнопок
        navButtons.forEach(b => b.classList.remove('active'));
        // Добавляем active на нажатую кнопку
        button.classList.add('active');

        // Убираем active со всех страниц
        pages.forEach(p => p.classList.remove('active'));
        // Показываем нужную страницу (page из data-page)
        const pageId = button.getAttribute('data-page');
        document.getElementById(pageId).classList.add('active');
    });
});

// =============================================
// 2. ФОТОАРХИВ (добавляем фото через JS)
// =============================================

// Массив объектов с фото. Добавляй сколько хочешь!
const photos = [
    { src: "https://i.ibb.co/0jqXqNc/placeholder.png", caption: "..." },
    { src: "https://i.ibb.co/0jqXqNc/placeholder.png", caption: "..." },
    { src: "https://i.ibb.co/0jqXqNc/placeholder.png", caption: "..." },
    { src: "https://i.ibb.co/0jqXqNc/placeholder.png", caption: "..." },
    { src: "https://i.ibb.co/0jqXqNc/placeholder.png", caption: "..." },
    { src: "https://i.ibb.co/0jqXqNc/placeholder.png", caption: "..." }
];

const galleryContainer = document.getElementById('galleryContainer');

// Перебираем массив photos и создаём HTML-карточки
photos.forEach(photo => {
    // Создаём новый div
    const card = document.createElement('div');
    card.classList.add('gallery-card');
    // Вставляем в него HTML (innerHTML)
    card.innerHTML = `
        <img src="${photo.src}" alt="${photo.caption}" loading="lazy">
        <p>${photo.caption}</p>
    `;
    // Добавляем карточку в контейнер
    galleryContainer.appendChild(card);
});

// =============================================
// 3. ВИКТОРИНА
// =============================================

// Массив вопросов (добавляй свои!)
const questions = [
    {
        question: "Какой любимый предмет Артёма?",
        answers: ["Химия", "Физкультура", "Алгебра", "История"],
        correct: 1 // индекс правильного ответа (считаем с 0)
    },
    {
        question: "Сколько казявок вытащил Артем?",
        answers: ["1", "2", "3", "5"],
        correct: 3
    },
    {
        question: "как еще называют Коровина?",
        answers: ["дудя", "очкун", "босс", "Сашка Сергеев"],
        correct: 1
    },
    {
        question: "Какая фамилия у Аретма?",
        answers: ["Коровин", "Филимонов", "Сергеев", "Совадухин"],
        correct: 1
    },
    {
        question: "сколько см хуй у Артема?",
        answers: ["нету у него хуя", "15см", "у Нафатой спроси", "не видел"],
        correct: 3
    }
];

let quizScore = 0;
let quizIndex = 0;
let quizNick = "";

// DOM-элементы викторины
const quizStartDiv = document.getElementById('quizStart');
const quizGameDiv = document.getElementById('quizGame');
const quizEndDiv = document.getElementById('quizEnd');
const qText = document.getElementById('qText');
const qAnswers = document.getElementById('qAnswers');
const qScore = document.getElementById('qScore');
const qCurrent = document.getElementById('qCurrent');
const qTotal = document.getElementById('qTotal');
const qFinalScore = document.getElementById('qFinalScore');

qTotal.textContent = questions.length;

// Кнопка "Начать викторину"
document.getElementById('quizStartBtn').addEventListener('click', () => {
    const nick = document.getElementById('quizNickname').value.trim();
    if (!nick) {
        document.getElementById('quizError').textContent = 'Введи ник!';
        return;
    }
    quizNick = nick;
    quizScore = 0;
    quizIndex = 0;
    document.getElementById('quizError').textContent = '';
    quizStartDiv.classList.add('hidden');
    quizGameDiv.classList.remove('hidden');
    quizEndDiv.classList.add('hidden');
    showQuestion();
});

// Функция показа вопроса
function showQuestion() {
    const q = questions[quizIndex];
    qText.textContent = q.question;
    qCurrent.textContent = quizIndex + 1;
    qScore.textContent = quizScore;
    qAnswers.innerHTML = '';

    q.answers.forEach((answer, i) => {
        const btn = document.createElement('button');
        btn.textContent = answer;
        btn.classList.add('answer-btn');
        btn.addEventListener('click', () => checkAnswer(i));
        qAnswers.appendChild(btn);
    });
}

// Проверка ответа
function checkAnswer(selected) {
    if (selected === questions[quizIndex].correct) {
        quizScore += 10;
    }
    quizIndex++;

    if (quizIndex < questions.length) {
        showQuestion();
    } else {
        endQuiz();
    }
}

// Завершение викторины и сохранение в Firebase
async function endQuiz() {
    quizGameDiv.classList.add('hidden');
    quizEndDiv.classList.remove('hidden');
    qFinalScore.textContent = quizScore;

    if (quizScore > 0) {
        try {
            const { addDoc, collection, serverTimestamp } = window.fb;
            await addDoc(collection(window.db, "quizScores"), {
                nickname: quizNick,
                score: quizScore,
                timestamp: serverTimestamp()
            });
        } catch (e) {
            console.error("Ошибка сохранения:", e);
        }
    }
}

// Кнопка "Играть ещё"
document.getElementById('quizAgainBtn').addEventListener('click', () => {
    quizEndDiv.classList.add('hidden');
    quizStartDiv.classList.remove('hidden');
    document.getElementById('quizNickname').value = '';
});

// Загрузка таблицы лидеров викторины
function loadQuizLeaderboard() {
    const { query, collection, orderBy, limit, onSnapshot } = window.fb;
    const q = query(collection(window.db, "quizScores"), orderBy("score", "desc"), limit(10));

    onSnapshot(q, (snapshot) => {
        const list = document.getElementById('quizLeaderboard');
        list.innerHTML = '';
        if (snapshot.empty) {
            list.innerHTML = '<li>Пока никто не играл</li>';
            return;
        }
        snapshot.forEach(doc => {
            const data = doc.data();
            const li = document.createElement('li');
            li.textContent = `${data.nickname} — ${data.score} очков`;
            list.appendChild(li);
        });
    });
}

// =============================================
// 4. КЛИКЕР «НАКОРМИ АРТЁМА»
// =============================================

let pieCount = 0;
const pieBtn = document.getElementById('pieBtn');
const pieCountSpan = document.getElementById('pieCount');
const pieMessage = document.getElementById('pieMessage');
const pieSaveBtn = document.getElementById('pieSaveBtn');
const pieNicknameInput = document.getElementById('pieNickname');

// Массив фраз, которые появляются при клике
const piePhrases = [
    "Коровин кто?", "я невозможно", "за хамство", "извенись", "наталья лаптева",
    "дисцеплин", "бембем", "пенис"
];

pieBtn.addEventListener('click', () => {
    pieCount++;
    pieCountSpan.textContent = pieCount;

    // Каждые 10 пирожков — показываем сообщение
    if (pieCount % 10 === 0) {
        const randomPhrase = piePhrases[Math.floor(Math.random() * piePhrases.length)];
        pieMessage.textContent = randomPhrase;
        // Через 2 секунды убираем сообщение
        setTimeout(() => { pieMessage.textContent = ''; }, 2000);
    }

    // После 20 пирожков показываем кнопку сохранения
    if (pieCount >= 20) {
        pieSaveBtn.classList.remove('hidden');
        pieNicknameInput.classList.remove('hidden');
    }
});

// Сохранение рекорда кликера
pieSaveBtn.addEventListener('click', async () => {
    const nick = pieNicknameInput.value.trim();
    if (!nick) {
        alert('Введи ник!');
        return;
    }
    try {
        const { addDoc, collection, serverTimestamp } = window.fb;
        await addDoc(collection(window.db, "clickerScores"), {
            nickname: nick,
            score: pieCount,
            timestamp: serverTimestamp()
        });
        alert('Рекорд сохранён!');
        pieSaveBtn.classList.add('hidden');
        pieNicknameInput.classList.add('hidden');
        pieCount = 0;
        pieCountSpan.textContent = '0';
    } catch (e) {
        console.error("Ошибка:", e);
    }
});

// Загрузка таблицы лидеров кликера
function loadClickerLeaderboard() {
    const { query, collection, orderBy, limit, onSnapshot } = window.fb;
    const q = query(collection(window.db, "clickerScores"), orderBy("score", "desc"), limit(10));

    onSnapshot(q, (snapshot) => {
        const list = document.getElementById('clickerLeaderboard');
        list.innerHTML = '';
        if (snapshot.empty) {
            list.innerHTML = '<li>Пока никто не кормил Артёма</li>';
            return;
        }
        snapshot.forEach(doc => {
            const data = doc.data();
            const li = document.createElement('li');
            li.textContent = `${data.nickname} — ${data.score} пирожков`;
            list.appendChild(li);
        });
    });
}

// =============================================
// 5. ЗАПУСК ВСЕГО ПРИ ЗАГРУЗКЕ
// =============================================

// Ждём, пока Firebase подключится (небольшая задержка)
setTimeout(() => {
    loadQuizLeaderboard();
    loadClickerLeaderboard();
}, 1000);   
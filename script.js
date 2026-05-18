

const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');


navButtons.forEach(button => {
    button.addEventListener('click', () => {
       
        navButtons.forEach(b => b.classList.remove('active'));
    
        button.classList.add('active');
        pages.forEach(p => p.classList.remove('active'));
        const pageId = button.getAttribute('data-page');
        document.getElementById(pageId).classList.add('active');
    });
});



const photos = [
    { src: "https://i.ibb.co/0jqXqNc/placeholder.png", caption: "..." },
    { src: "https://i.ibb.co/0jqXqNc/placeholder.png", caption: "..." },
    { src: "https://i.ibb.co/0jqXqNc/placeholder.png", caption: "..." },
    { src: "https://i.ibb.co/0jqXqNc/placeholder.png", caption: "..." },
    { src: "https://i.ibb.co/0jqXqNc/placeholder.png", caption: "..." },
    { src: "https://i.ibb.co/0jqXqNc/placeholder.png", caption: "..." }
];

const galleryContainer = document.getElementById('galleryContainer');


photos.forEach(photo => {
    const card = document.createElement('div');
    card.classList.add('gallery-card');
    card.innerHTML = `
        <img src="${photo.src}" alt="${photo.caption}" loading="lazy">
        <p>${photo.caption}</p>
    `;
    galleryContainer.appendChild(card);
});



const questions = [
    {
        question: "Какой любимый предмет Артёма?",
        answers: ["Химия", "Физкультура", "Алгебра", "История"],
        correct: 1 
    },
    {
        question: "скучат ли Артем по Лаптевой?",
        answers: ["Артем ее убил", "очень скучает, каждый раз приходит в ее кабинет после уроков", "нет, она бесила дудю", "да, он ей пилотку лизал"],
        correct: 1
    },
    {
        question: "как еще называют Коровина?",
        answers: ["очкошник", "очкун", "дудя", "Сашка Сергеев",],
        correct: 3
    },
    {
        question: "Какая фамилия у Аретма?",
        answers: ["Филимонов", "Коровин", "Сергеев", "Совадухин","Дудя"],
        correct: 2
    },
    {
        question: "делал ли Артем минет Сереге?",
        answers: ["нет, он не гей", "ты бля далбаеб?", "да", "не видел"],
        correct: 4
    }
];

let quizScore = 0;
let quizIndex = 0;
let quizNick = "";
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


document.getElementById('quizStartBtn').addEventListener('click', () => {
    const nick = document.getElementById('quizNickname').value.trim();
    if (!nick) {
        document.getElementById('quizError').textContent = 'Введи ник шалуха!';
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


document.getElementById('quizAgainBtn').addEventListener('click', () => {
    quizEndDiv.classList.add('hidden');
    quizStartDiv.classList.remove('hidden');
    document.getElementById('quizNickname').value = '';
});





function loadQuizLeaderboard() {
    const { query, collection, orderBy, limit, onSnapshot } = window.fb;
    const q = query(collection(window.db, "quizScores"), orderBy("score", "desc"), limit(10));

    onSnapshot(q, (snapshot) => {
        const list = document.getElementById('quizLeaderboard');
        list.innerHTML = '';
        if (snapshot.empty) {
            list.innerHTML = '<li>Пока никто не играл((((</li>';
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


let pieCount = 0;
const pieBtn = document.getElementById('pieBtn');
const pieCountSpan = document.getElementById('pieCount');
const pieMessage = document.getElementById('pieMessage');
const pieSaveBtn = document.getElementById('pieSaveBtn');
const pieNicknameInput = document.getElementById('pieNickname');

// Массив фраз, которые появляются при клике
const piePhrases = [
    "Коровин кто?", "я невозможно", "за хамство", "извенись", "наталья лаптева",
    "дисцеплин", "бабушка", "дудяяя"
];

pieBtn.addEventListener('click', () => {
    pieCount++;
    pieCountSpan.textContent = pieCount;

    
    if (pieCount % 10 === 0) {
        const randomPhrase = piePhrases[Math.floor(Math.random() * piePhrases.length)];
        pieMessage.textContent = randomPhrase;
        
        setTimeout(() => { pieMessage.textContent = ''; }, 10000);
    }

    
    if (pieCount >= 20) {
        pieSaveBtn.classList.remove('hidden');
        pieNicknameInput.classList.remove('hidden');
    }
});


pieSaveBtn.addEventListener('click', async () => {
    const nick = pieNicknameInput.value.trim();
    if (!nick) {
        alert('Введи ник шалупонь!');
        return;
    }
    try {
        const { addDoc, collection, serverTimestamp } = window.fb;
        await addDoc(collection(window.db, "clickerScores"), {
            nickname: nick,
            score: pieCount,
            timestamp: serverTimestamp()
        });
        alert('Рекорд сохранён! Я немогу дышать!');
        pieSaveBtn.classList.add('hidden');
        pieNicknameInput.classList.add('hidden');
        pieCount = 0;
        pieCountSpan.textContent = '0';
    } catch (e) {
        console.error("Ошибка:", e);
    }
});

function loadClickerLeaderboard() {
    const { query, collection, orderBy, limit, onSnapshot } = window.fb;
    const q = query(collection(window.db, "clickerScores"), orderBy("score", "desc"), limit(10));

    onSnapshot(q, (snapshot) => {
        const list = document.getElementById('clickerLeaderboard');
        list.innerHTML = '';
        if (snapshot.empty) {
            list.innerHTML = '<li>Пока никто не тапал дудю</li>';
            return;
        }
        snapshot.forEach(doc => {
            const data = doc.data();
            const li = document.createElement('li');
            li.textContent = `${data.nickname} — ${data.score} тапов по дудечке`;
            list.appendChild(li);
        });
    });
}

setTimeout(() => {
    loadQuizLeaderboard();
    loadClickerLeaderboard();
}, 1000);   


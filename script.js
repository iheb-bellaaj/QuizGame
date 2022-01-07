const categoriesSelectElement = document.querySelector('select[name="categories"]');
const difficultiesSelectElement = document.querySelector('select[name="difficulties"]');
const quizConfigCardElement = document.querySelector('#config-card');
const questionsCardElement = document.querySelector('#questions-card');
const resultCardElement = document.querySelector('#result-card');
const questionTitleElement = document.querySelector('#question-title');
const answersListElement = document.querySelector('#answers-list');
const scoreTextElement = document.querySelector('#score-text');
const countdownElement = document.querySelector('#countdown');
const nextButtonElement = document.querySelector('#next-btn');
const difficulties = [{ value: "", name: "Any Difficulty" }, { value: "easy", name: "Easy" }, { value: "medium", name: "Medium" }, { value: "hard", name: "Hard" }];
let currentQuestion = { index: 0, question: "", correctAnswer: "", incorrectAnswers: [], isAnswered: false };
let selectedConfig = { category: "", difficulty: "" };
let score = 0;
let questions = [];
let timer;

async function loadCategories() {
    const response = await fetch("https://opentdb.com/api_category.php");
    const data = await response.json();
    const options = ['<option value="">Any Category</option>'];
    if (response.ok && data.trivia_categories && data.trivia_categories.length > 0) {

        data.trivia_categories.forEach(category => {
            options.push(`<option value=${category.id}>${category.name}</option>`);
        });

        categoriesSelectElement.innerHTML = options.join();
    } else {
        console.error("Something went wrong when retrieving categories.")
    }
}

function onCategoryChanged() {
    selectedConfig.category = categoriesSelectElement.value;
}

function onDifficultyChanged() {
    selectedConfig.difficulty = difficultiesSelectElement.value;
}

async function loadQuestions(questionsNumber) {
    if (!questionsNumber || !Number.isInteger(questionsNumber) || questionsNumber < 1) return;

    const response = await fetch(`https://opentdb.com/api.php?amount=${questionsNumber}${selectedConfig.category ? "&category=" + selectedConfig.category : ""}${selectedConfig.difficulty ? "&difficulty=" + selectedConfig.difficulty : ""}&type=multiple`);
    const data = await response.json();
    if (response.ok && data.results && data.results.length > 0) {
        questions = data.results;

    } else {
        console.error("Something went wrong when retrieving questions.")
    }
}

async function showQuestion(index) {
    if (index === undefined || index === null || !Number.isInteger(index) || index < 0 || index > questions.length - 1) return;
    console.log(index);
    currentQuestion = { index: index, question: questions[index].question, correctAnswer: questions[index].correct_answer, incorrectAnswers: questions[index].incorrect_answers, isAnswered: false };
    const answers = shuffleArray([...currentQuestion.incorrectAnswers, currentQuestion.correctAnswer]);
    const options = [];
    answers.forEach(answer => {
        options.push(`<div class="option hover-enabled pointer" onclick="optionSelected(this)">${answer}</div>`);
    });
    answersListElement.innerHTML = options.join(" ");
    questionTitleElement.innerHTML = `Question ${index + 1}: ${currentQuestion.question}`;
}

function optionSelected(answer) {
    if (!currentQuestion.isAnswered) {
        clearInterval(timer);
        nextButtonElement.classList.remove("invisible");
        if (answer.innerHTML === currentQuestion.correctAnswer) {
            answer.classList.add("correct-answer");
            [...answersListElement.children].forEach(child => {
                child.classList.remove("hover-enabled");
                child.classList.remove("pointer");
            });
            score++;
        } else {
            answer.classList.add("wrong-answer");
            [...answersListElement.children].forEach(child => {
                child.classList.remove("hover-enabled");
                child.classList.remove("pointer");
                if (child.innerHTML === currentQuestion.correctAnswer) {
                    child.classList.add("correct-answer");
                }
            });
        }
        currentQuestion.isAnswered = true;
    }
}

function startCountdown(seconds) {
    if (!seconds || !Number.isInteger(seconds) || seconds < 0) return;
    countdownElement.innerHTML = seconds;
    timer = setInterval(tick, 1000);

    function tick() {
        seconds--;
        if (seconds < 0) {
            clearInterval(timer);
            currentQuestion.isAnswered = true;
            nextButtonElement.classList.remove("invisible");
            [...answersListElement.children].forEach(child => {
                child.classList.remove("hover-enabled");
                child.classList.remove("pointer");
                if (child.innerHTML === currentQuestion.correctAnswer) {
                    child.classList.add("correct-answer");
                }
            });
            countdownElement.innerHTML = "Time's Up!";
            return;
        }
        if (seconds === 5) {
            countdownElement.classList.remove("long-remaining-time");
            countdownElement.classList.add("short-remaining-time");
        }
        countdownElement.innerHTML = seconds;
    }
}

function nextQuestionClicked() {
    if (currentQuestion.index === questions.length - 1) {
        quizConfigCardElement.classList.add("invisible");
        questionsCardElement.classList.add("invisible");
        resultCardElement.classList.remove("invisible");
        scoreTextElement.innerHTML = `You got ${score} correct answers out of ${questions.length}!`;

    } else {
        nextButtonElement.classList.add("invisible");
        showQuestion(currentQuestion.index + 1);
        startCountdown(15);
    }
}

function loadDifficulties() {
    const options = []
    difficulties.forEach(difficulty => {
        options.push(`<option value=${difficulty.value}>${difficulty.name}</option>`);
    });
    difficultiesSelectElement.innerHTML = options.join();
}

async function startQuizClicked() {
    score = 0;
    await loadQuestions(5);
    console.log(questions);
    startCountdown(15);
    showQuestion(0);
    quizConfigCardElement.classList.add("invisible");
    resultCardElement.classList.add("invisible");
    questionsCardElement.classList.remove("invisible");
}

function homeClicked() {
    quizConfigCardElement.classList.remove("invisible");
    resultCardElement.classList.add("invisible");
    questionsCardElement.classList.add("invisible");
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

document.addEventListener("DOMContentLoaded", async function() {
    await loadCategories();
    loadDifficulties();
});

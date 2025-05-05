// Wait for the DOM to fully load

document.addEventListener('DOMContentLoaded', () => {
  // ===== Initialize EmailJS =====
  emailjs.init('dZbByvBzUOMPH2qzm');

  // ===== Element References =====
  const feedbackButton = document.getElementById('feedback-button');
  const feedbackModal = document.getElementById('feedback-modal');
  const feedbackCloseButton = feedbackModal.querySelector('.close-button');
  const feedbackForm = document.getElementById('feedback-form');
  const submitButton = document.getElementById('submit-button');
  const homeScreen = document.getElementById('home');
  const startButton = document.getElementById('start-button');
  const gameScreen = document.getElementById('game');
  const resultScreen = document.getElementById('result');
  const resultText = document.getElementById('final-score');
  const restartButton = document.getElementById('restart-button');
  const exitButton = document.getElementById('exit-button');
  const progressText = document.getElementById('progress');
  const correctText = document.getElementById('correct');
  const aboutButton = document.getElementById('about-button');
  const aboutScreen = document.getElementById('about');
  const backFromAboutButton = document.getElementById('back-home-from-about');

  // ===== Google Sheets API URL =====
  const sheetURL = 'https://docs.google.com/spreadsheets/d/1aHAqn_szAF3kwQ9DrDupuCYGLYxEB2gsBCWoThk5dtk/gviz/tq?tqx=out:json';

  // ===== Screen Navigation =====
  startButton.addEventListener('click', () => {
    homeScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    resultScreen.style.display = 'none';
    startGame();
  });

  restartButton.addEventListener('click', () => {
    resultScreen.style.display = 'none';
    homeScreen.style.display = 'block';
  });

  exitButton.addEventListener('click', () => {
    gameScreen.style.display = 'none';
    homeScreen.style.display = 'block';
  });

  aboutButton.addEventListener('click', () => {
    homeScreen.style.display = 'none';
    aboutScreen.style.display = 'block';
  });

  backFromAboutButton.addEventListener('click', () => {
    aboutScreen.style.display = 'none';
    homeScreen.style.display = 'block';
  });

  // ===== Feedback Modal Logic =====
  feedbackButton.addEventListener('click', () => {
    feedbackModal.style.display = 'block';
  });

  feedbackCloseButton.addEventListener('click', () => {
    feedbackModal.style.display = 'none';
  });

  feedbackForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('feedback-email').value;
    const message = document.getElementById('feedback-message').value;

    emailjs.send('service_slgxrr3', 'template_s075urm', {
      from_email: email,
      message: message
    }).then(() => {
      alert('Feedback submitted!');
      feedbackModal.style.display = 'none';
      feedbackForm.reset();
    }).catch((error) => {
      alert('Error sending. Please try again.');
      console.error('EmailJS error:', error);
    });
  });

  // ===== Game Logic =====
  let currentQuestionIndex = 0;
  let questions = [];
  let score = 0;
  let selectedOption = null;

  function startGame() {
    currentQuestionIndex = 0;
    score = 0;
    selectedOption = null;
    questions = [];
    submitButton.style.display = 'none';
    updateScoreDisplay();
    fetchQuestions();
  }

  async function fetchQuestions() {
    try {
      const response = await fetch(sheetURL);
      const text = await response.text();
      const json = JSON.parse(text.substr(47).slice(0, -2));
      const rows = json.table.rows.slice(1);

      questions = rows.map(row => ({
        question: row.c[0].v,
        answer: [row.c[1].v, row.c[2].v, row.c[3].v, row.c[4].v],
        correctAnswer: row.c[5].v
      })).sort(() => Math.random() - 0.5);

      displayQuestion();
    } catch (error) {
      console.error('Error fetching questions:', error);
      document.getElementById('question').textContent = 'Failed to load questions.';
    }
  }

  function displayQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    document.getElementById('question').textContent = currentQuestion.question;

    const answersContainer = document.getElementById('answers');
    answersContainer.innerHTML = '';

    currentQuestion.answer.forEach(answer => {
      const button = document.createElement('button');
      button.className = 'btn';
      button.textContent = answer;

      button.addEventListener('click', () => {
        if (selectedOption) {
          selectedOption.classList.remove('selected');
        }
        selectedOption = button;
        selectedOption.classList.add('selected');
        submitButton.style.display = 'block';
      });

      answersContainer.appendChild(button);
    });

    updateScoreDisplay();
  }

  function showAnswerModal(isCorrect, correctAnswer = null) {
    answerResult.className = isCorrect ? 'correct' : 'incorrect';
    answerResult.innerHTML = isCorrect
      ? 'Correct!'
      : `The correct answer is:<br>${correctAnswer}`;
    answerModal.style.display = 'block';

    const delay = isCorrect ? 1500 : 3500;
    setTimeout(() => {
      answerModal.style.display = 'none';
      nextQuestion();
    }, delay);
  }

  function checkAnswer() {
    if (!selectedOption) {
      alert('Please select an answer before submitting.');
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedOption.textContent === currentQuestion.correctAnswer;

    if (isCorrect) {
      score++;
    }

    showAnswerModal(isCorrect, currentQuestion.correctAnswer);
    updateScoreDisplay();
  }

  function updateScoreDisplay() {
    progressText.textContent = `Question ${currentQuestionIndex + 1} of 10`;
    correctText.textContent = `Correct: ${score}`;
  }

  function nextQuestion() {
    currentQuestionIndex++;
    selectedOption = null;

    if (currentQuestionIndex < 10 && currentQuestionIndex < questions.length) {
      displayQuestion();
    } else {
      endGame();
    }
  }

  function endGame() {
    gameScreen.style.display = 'none';
    resultScreen.style.display = 'block';
    resultText.textContent = `Final Score: ${score} / ${currentQuestionIndex}`;
  }

  // ===== Submit Button Event =====
  submitButton.addEventListener('click', () => {
    checkAnswer();
    submitButton.style.display = 'none';
  });

  // ===== Answer Modal Close Button =====
  const answerModal = document.getElementById('answer-modal');
  const answerResult = document.getElementById('answer-result');
  const answerCloseButton = answerModal.querySelector('.close-button');

  answerCloseButton.addEventListener('click', () => {
    answerModal.style.display = 'none';
    nextQuestion();
  });

  // ===== Initial Screen Setup =====
  homeScreen.style.display = 'block';
  gameScreen.style.display = 'none';
  resultScreen.style.display = 'none';
});
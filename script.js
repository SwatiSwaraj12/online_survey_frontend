const BASE_URL = "https://onlinesurveybackend-production.up.railway.app";

const API_SURVEY = `${BASE_URL}/survey`;
const API_RESPONSE = `${BASE_URL}/responses`;


const questionInput = document.getElementById("questionInput");
const addBtn = document.getElementById("addBtn");
const questionList = document.getElementById("questionList");

// ✅ Load all questions
async function loadQuestions() {
  questionList.innerHTML = "";

  try {
    const res = await fetch(API_SURVEY);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      questionList.innerHTML = "<li>No questions found</li>";
      return;
    }

    data.forEach((item) => {
      const li = document.createElement("li");
      li.className = "question-box";

      li.innerHTML = `
        <h3>${item.question}</h3>

        <div class="response-row">
          <input type="text" placeholder="Enter your answer..." id="ans-${item.id}" />
          <button class="submit-btn" onclick="submitResponse(${item.id})">Submit</button>
          <button class="result-btn" onclick="viewResults(${item.id})">View Results</button>
        </div>

        <div class="results" id="result-${item.id}"></div>
      `;

      questionList.appendChild(li);
    });

  } catch (error) {
    console.log("Error while loading questions:", error);
    questionList.innerHTML = "<li>❌ Error loading questions</li>";
  }
}

// ✅ Add new question
addBtn.addEventListener("click", async () => {
  const question = questionInput.value.trim();

  if (!question) {
    alert("Please enter a question");
    return;
  }

  try {
    await fetch(API_SURVEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    questionInput.value = "";
    loadQuestions();

  } catch (error) {
    console.log("Error while adding question:", error);
    alert("❌ Question add nahi hua, backend check karo");
  }
});

// ✅ Submit response
async function submitResponse(surveyId) {
  const ansInput = document.getElementById(`ans-${surveyId}`);
  const answer = ansInput.value.trim();

  if (!answer) {
    alert("Please enter answer!");
    return;
  }

  try {
    const res = await fetch(API_RESPONSE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        surveyId: surveyId,
        answer: answer,
      }),
    });

    if (!res.ok) {
      const msg = await res.text();
      alert("❌ Error: " + msg);
      return;
    }

    ansInput.value = "";
    alert("✅ Response saved!");

  } catch (err) {
    console.log("Submit error:", err);
    alert("❌ Backend error while saving response");
  }
}

// ✅ View results (COUNT WISE)
async function viewResults(surveyId) {
  const resultDiv = document.getElementById(`result-${surveyId}`);
  resultDiv.innerHTML = "Loading results...";

  try {
    const res = await fetch(`${API_RESPONSE}/survey/${surveyId}`);

    if (!res.ok) {
      resultDiv.innerHTML = "❌ Error loading results";
      return;
    }

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      resultDiv.innerHTML = "<p>No responses yet</p>";
      return;
    }

    // ✅ Count answers
    const counts = {};
    data.forEach((r) => {
      const ans = (r.answer || "").trim().toLowerCase();
      if (ans) {
        counts[ans] = (counts[ans] || 0) + 1;
      }
    });

    // ✅ Show count list
    let html = `<h4>📊 Results Count</h4><ul>`;
    for (let key in counts) {
      html += `<li><b>${key}</b> : ${counts[key]}</li>`;
    }
    html += `</ul>`;

    resultDiv.innerHTML = html;

  } catch (err) {
    console.log("Result error:", err);
    resultDiv.innerHTML = "❌ Error loading results";
  }
}

// ✅ Initial load
loadQuestions();

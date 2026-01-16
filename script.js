const API_URL = "http://localhost:8081/survey";
const RESPONSE_API = "http://localhost:8081/responses";

const questionInput = document.getElementById("questionInput");
const addBtn = document.getElementById("addBtn");
const questionList = document.getElementById("questionList");

// ✅ Load all questions
async function loadQuestions() {
  questionList.innerHTML = "";

  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      questionList.innerHTML = "<li>No questions found</li>";
      return;
    }

    data.forEach((item) => {
      const li = document.createElement("li");

      const qText = item.question || "";

      li.innerHTML = `
        <b>${qText}</b>
        <br/><br/>

        <input type="text" placeholder="Enter your answer..." id="ans-${item.id}"
          style="padding:8px; width:250px;" />

        <button style="margin-left:10px; padding:8px;" onclick="submitResponse(${item.id})">
          Submit
        </button>

        <button style="margin-left:10px; padding:8px;" onclick="viewResponses(${item.id})">
          View Results
        </button>

        <div id="result-${item.id}" style="margin-top:10px;"></div>
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
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: question }),
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
    alert("Please enter your answer");
    return;
  }

  try {
    await fetch(RESPONSE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        surveyId: surveyId,
        answer: answer
      }),
    });

    ansInput.value = "";
    alert("✅ Response Submitted!");

  } catch (error) {
    console.log("Error while submitting response:", error);
    alert("❌ Response submit nahi hua");
  }
}

// ✅ View responses (Results)
async function viewResponses(surveyId) {
  const resultDiv = document.getElementById(`result-${surveyId}`);
  resultDiv.innerHTML = "Loading...";

  try {
    const res = await fetch(`${RESPONSE_API}/survey/${surveyId}`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      resultDiv.innerHTML = "<p>No responses yet</p>";
      return;
    }

    let html = "<ul>";
    data.forEach((r) => {
      html += `<li>${r.answer}</li>`;
    });
    html += "</ul>";

    resultDiv.innerHTML = html;

  } catch (error) {
    console.log("Error while loading results:", error);
    resultDiv.innerHTML = "❌ Error loading results";
  }
}

// ✅ Initial load
loadQuestions();

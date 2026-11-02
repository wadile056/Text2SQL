const questionBox = document.getElementById("question");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const resultBox = document.getElementById("result");
const errorText = document.getElementById("error");

// Generate SQL from the user's English instruction
async function generateSQL() {
  const question = questionBox.value.trim();

  if (!question) {
    errorText.textContent = "Please type an instruction first.";
    return;
  }

  errorText.textContent = "";
  resultBox.textContent = "Generating SQL...";
  generateBtn.disabled = true;

  const startTime = performance.now();

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to generate SQL.");
    }

    resultBox.textContent = data.sql;

    console.log("Generated SQL:", data.sql);
  } catch (error) {
    resultBox.textContent = "Your SQL will appear here.";
    errorText.textContent = error.message || "Something went wrong.";

    console.error("SQL generation error:", error);
  } finally {
    generateBtn.disabled = false;
  }
}

// Copy the generated SQL
async function copySQL() {
  try {
    await navigator.clipboard.writeText(resultBox.textContent);

    copyBtn.textContent = "Copied";

    setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 1200);
  } catch (error) {
    errorText.textContent = "Unable to copy. Please copy the SQL manually.";
  }
}

generateBtn.addEventListener("click", generateSQL);
copyBtn.addEventListener("click", copySQL);

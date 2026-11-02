# Text2SQL Project

Convert natural language questions into SQL queries using AI and execute them against a MySQL database.

## Features
- Convert English questions into SQL queries.
- Generate SQL using Google Gemini AI.
- Connect to a MySQL database.
- Display query results through a web interface.

## Technologies Used
- HTML, CSS, JavaScript
- Node.js and Express.js
- MySQL
- Google Gemini API

## Prerequisites
- Node.js and npm
- MySQL Server
- Google Gemini API Key

## Installation

1. Clone the repository:

   ```bash
   git clone YOUR_GITHUB_REPOSITORY_URL
   ```

2. Open the project folder:

   ```bash
   cd Text2SQL
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the project root:

   ```env
   PORT=3000
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=your_supported_gemini_model
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=your_database_name
   ```

   Replace the example values with your actual configuration. Use the environment variable names expected by your server code.

5. Start the application:

   ```bash
   npm start
   ```

6. Open your browser and visit:

   `http://localhost:3000`

## Security
- Never upload your `.env` file.
- Never expose your API keys or database passwords.
- Add `.env` to `.gitignore`.

## Future Improvements
- Improve SQL generation accuracy.
- Add database schema visualization.
- Enhance the user interface.

## Author
Your Name

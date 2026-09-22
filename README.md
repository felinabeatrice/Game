# 🔍 Google Drive Investigation Game

## 📌 About the Project

**Google Drive Investigation** is an interactive web-based puzzle game designed around the theme of investigating digital documents and recovering hidden pieces of evidence.

The player takes the role of an investigator who examines a series of documents and solves different puzzles. Each successfully completed puzzle reveals a **puzzle piece or fragment**. By solving all the documents, the player progresses through the investigation and works toward completing the final objective.

The project combines an investigation-style storyline with multiple types of interactive puzzles to create an engaging and challenging gameplay experience.

---

## 🎯 Objectives

The main objectives of this project are:

* To develop an interactive browser-based puzzle game.
* To provide multiple types of puzzles within a single application.
* To improve logical thinking and problem-solving skills.
* To create an engaging investigation-themed user experience.
* To demonstrate the use of **HTML, CSS, and JavaScript** in web development.
* To practice collaborative software development using **Git and GitHub**.

---

## 🎮 Game Features

The project contains multiple investigation documents, with each document containing a different puzzle.

### 1. 🔤 Scrambled Words

The player is presented with scrambled letters and must rearrange them to form the correct words.

For example:

```text
VELRAT → TRAVEL
HTAP   → PATH
ELUB   → BLUE
```

The player enters the answers into the provided fields and submits them for verification.

Correct answers are highlighted, while incorrect answers are indicated to help the player identify mistakes.

After all the words are correctly restored, the first puzzle piece is unlocked.

---

### 2. 🪦 Hangman

The second document contains a Hangman-style word puzzle.

The player selects letters from an on-screen keyboard to discover the hidden keyword.

The game keeps track of:

* Correct guesses
* Incorrect guesses
* Remaining attempts
* Letters already selected
* The progress of the hidden word

If the player successfully discovers the word, the second puzzle piece is recovered.

---

### 3. 🔎 Word Search

The third document contains a **10 × 10 word-search puzzle**.

The player must locate hidden investigation-related words inside the grid.

Some of the words may appear:

* Horizontally
* Vertically
* Diagonally
* Forward
* Backward

The puzzle provides hints for the words that need to be discovered.

Example words include:

* EVIDENCE
* SEARCH
* HIDDEN
* TRACE
* CLUE

When all the required words are found, the third puzzle piece is unlocked.

---

### 4. 🧩 Mini Sudoku

The fourth document contains a **4 × 4 Mini Sudoku puzzle**.

The player must fill the empty cells using numbers from **1 to 4**.

The completed grid must satisfy the Sudoku rules:

* Every row must contain the numbers 1–4 without repetition.
* Every column must contain the numbers 1–4 without repetition.
* Every 2 × 2 block must contain the numbers 1–4 without repetition.

When the puzzle is correctly completed, the final puzzle piece is recovered.

---

## 🧩 Puzzle Progression

The game is designed so that each completed document provides a puzzle piece.

The overall progression is:

```text
Document 1
   ↓
Scrambled Words
   ↓
Puzzle Piece 1
   ↓
Document 2
   ↓
Hangman
   ↓
Puzzle Piece 2
   ↓
Document 3
   ↓
Word Search
   ↓
Puzzle Piece 3
   ↓
Document 4
   ↓
Mini Sudoku
   ↓
Puzzle Piece 4
```

The player therefore needs to solve the different challenges to progress through the investigation.

---

## 💻 Technologies Used

### HTML

HTML is used to create the structure of the web application, including:

* Game screens
* Buttons
* Input fields
* Puzzle sections
* Document layouts
* Navigation elements

### CSS

CSS is used to design and style the application.

It controls:

* Layout
* Colors
* Fonts
* Buttons
* Puzzle grids
* Animations
* Feedback messages
* Responsive visual elements

### JavaScript

JavaScript provides the interactive functionality of the game.

It is responsible for:

* Generating puzzle elements
* Checking answers
* Handling user interactions
* Managing puzzle states
* Displaying feedback
* Tracking completed puzzles
* Unlocking puzzle pieces
* Controlling game logic

---

## 📁 Project Structure

The main files in the project are:

```text
Game/
│
├── Index.html
├── style.css
├── game.js
├── puzzles.js
└── README.md
```

### `Index.html`

Contains the main structure and interface of the game.

It provides the HTML elements required to display the investigation and puzzle sections.

### `style.css`

Contains the styling and visual design of the game.

It controls the appearance of the interface, buttons, puzzle areas, grids, messages, and other visual components.

### `game.js`

Contains the main game functionality and controls the overall interaction between different parts of the game.

### `puzzles.js`

Contains the individual puzzle modules and their logic.

The file includes the implementation of:

* Scrambled Words
* Hangman
* Word Search
* Mini Sudoku

### `README.md`

Contains documentation about the project, its purpose, features, technologies, structure, and usage.

---

## 🛠️ How to Run the Project

The project is a web-based application and can be run using a modern web browser.

### Method 1 — Open Directly

1. Download or clone the project.
2. Open the project folder.
3. Open `Index.html` in a web browser.
4. Start playing the game.

### Method 2 — Using VS Code

1. Open the project folder in **Visual Studio Code**.
2. Open `Index.html`.
3. Run the file using a browser or a suitable VS Code extension such as Live Server.
4. Interact with the game through the browser.

---

## 🌐 Git and GitHub

Git and GitHub are used for collaborative development of this project.

Git allows team members to:

* Track changes
* Create branches
* Commit changes
* Work on separate features
* Merge completed work
* Maintain different versions of the project

The project uses separate branches so that team members can work on their assigned files without directly modifying the main branch.

The general workflow is:

```text
Clone Repository
      ↓
Create Personal Branch
      ↓
Work on Assigned File
      ↓
Git Add
      ↓
Git Commit
      ↓
Git Push
      ↓
Review / Merge
```

---

## 👥 Team Collaboration

This project is developed as a collaborative group project.

Different team members are responsible for different parts of the application.

The project uses GitHub to coordinate development and maintain the source code.

Each member works on their assigned branch and pushes their completed work to GitHub for review and integration.

---

## ✨ Key Learning Outcomes

Through this project, the team gains practical experience in:

* HTML web development
* CSS styling
* JavaScript programming
* DOM manipulation
* Event handling
* Interactive game development
* Puzzle logic implementation
* Git version control
* GitHub collaboration
* Branch creation and management
* Committing and pushing code
* Team-based software development

---

## 🚀 Future Improvements

The project can be extended with additional features in the future, such as:

* More investigation documents
* Additional puzzle types
* Multiple difficulty levels
* Timer and scoring system
* Sound effects
* Background music
* More visual animations
* Additional clues and hints
* A final investigation conclusion
* Mobile-friendly improvements
* More levels and story chapters

---

## 📄 Conclusion

The **Google Drive Investigation Game** combines an investigation-themed story with interactive puzzles to create an engaging web-based gaming experience.

By solving different challenges such as scrambled words, Hangman, word search, and Mini Sudoku, players progress through the investigation and recover hidden puzzle pieces.

The project also demonstrates how **HTML, CSS, JavaScript, Git, and GitHub** can be combined to create and collaboratively develop an interactive web application.

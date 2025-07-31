# Scholar's AI Companion

Scholar's AI Companion is a modern web application designed to transform any academic document (`.pdf` or `.txt`) into a powerful, interactive study experience. By leveraging Generative AI, this tool automates the creation of summaries, study notes, flashcards, and quizzes, helping students and researchers learn more effectively.

This project is built with Next.js, Genkit (for AI integration), and ShadCN UI components.

## ✨ Core Features

-   **📝 AI Summarizer**: Condenses lengthy documents into well-structured summaries. It intelligently identifies sections like Abstract, Introduction, Methodology, and Conclusion, and provides a concise overview of each.
-   **📖 Interactive Note Generator**: Transforms document content into organized, editable study notes in Markdown format. It uses formatting like bolded key terms, blockquotes for definitions (📘), and callouts for key insights (🧠) to enhance readability.
-   **🃏 Interactive Flashcards**: Creates two-sided, flippable flashcards for active recall practice. Each card presents a question and multiple-choice options on the front, revealing the correct answer and a detailed explanation on the back.
-   **🧠 AI Quiz Builder**: Generates a multiple-choice quiz from the document content, complete with plausible distractors and explanations for each correct answer to test your knowledge.
-   **📂 Persistent Sessions & Document Management**: Your uploaded documents and generated study materials are automatically saved in your browser's local storage. You can manage multiple documents, switch between them, or delete them from the main dashboard.
-   **📤 Seamless File Uploads**: A user-friendly interface allows you to upload `.pdf` and `.txt` files via a file picker or by dragging and dropping them into the upload zone.
-   **📱 Fully Responsive Design**: The entire application is built to be accessible and functional across desktops, tablets, and mobile devices.

---

## 🛠️ Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit) (with Google Gemini Pro)
-   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Client-Side PDF Parsing**: [PDF.js](https://mozilla.github.io/pdf.js/)
-   **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)

---

## 🚀 Getting Started

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

-   [Node.js](https://nodejs.org/en) (v18 or newer recommended)
-   [npm](https://www.npmjs.com/get-npm) or [yarn](https://classic.yarnpkg.com/en/docs/install)
-   A **Google AI API Key**. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ayushsaun24024/ScholarAI.git
    cd ScholarAI
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a new file named `.env` in the root of your project directory and add your Google AI API key:
    ```
    GEMINI_API_KEY=your_google_ai_api_key_here
    ```

### Running the Application

This project uses two concurrent processes: one for the Next.js frontend and another for the Genkit AI development server.

1.  **Start the Genkit Dev Server:**
    Open a terminal and run the following command. This server watches your AI flow files for changes.
    ```bash
    npm run genkit:watch
    ```
    You should see an output indicating that the Genkit server is running, typically on `localhost:3400`.

2.  **Start the Next.js Frontend:**
    In a **separate terminal**, run the development server for the user interface:
    ```bash
    npm run dev
    ```
    This will start the Next.js application, usually on `http://localhost:9002`.

3.  **Open the app:**
    Navigate to `http://localhost:9002` in your browser to start using the Scholar's AI Companion.

---

## 📂 Project Structure

Here's a brief overview of the key directories and files:

```
.
├── src
│   ├── app/                # Next.js App Router pages and layout
│   ├── ai/                 # Genkit AI configuration and flows
│   │   ├── flows/          # Individual AI agent definitions (summary, notes, etc.)
│   │   ├── genkit.ts       # Main Genkit plugin configuration
│   │   └── dev.ts          # Entry point for the Genkit dev server
│   ├── components/         # Reusable React components
│   │   └── ui/             # ShadCN UI components
│   ├── hooks/              # Custom React hooks (e.g., useToast)
│   └── lib/                # Utility functions
├── public/                 # Static assets
├── package.json            # Project dependencies and scripts
└── tailwind.config.ts      # Tailwind CSS configuration
```


# Email Analytics Pro Dashboard

This is a React-based dashboard application for visualizing email analytics, built with Vite and TypeScript.

## Prerequisites

Before running this project, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

## Getting Started

Follow these steps to get the project up and running on your local machine.

### 1. Install Dependencies

Open your terminal or command prompt in the project root directory and run:

```bash
npm install
```

This will download and install all the necessary libraries and dependencies defined in `package.json`.

### 2. Environment Configuration

This project requires a Gemini API key.
1.  Check if you have a `.env.local` file in the root directory.
2.  If not, create one.


### 3. Running the Development Server

To start the local development server:

```bash
npm run dev
```

After running this command, you should see output indicating that the server is running, typically at `http://localhost:5173`. Open this URL in your browser to view the dashboard.

## Available Scripts

In the project directory, you can run:

-   `npm run dev`: Runs the app in development mode.
-   `npm run build`: Builds the app for production to the `dist` folder.
-   `npm run preview`: Locally previews the production build.

## Project Structure

-   `src/` (or root `.tsx` files): specific source code for the application.
-   `App.tsx`: The main application component.
-   `components/`: Reusable UI components.
-   `services/`: API services and data fetching logic.
-   `types.ts`: TypeScript type definitions.

## Troubleshooting

-   **Port in use**: If port 5173 is already in use, Vite will automatically try the next available port (e.g., 5174). Check the terminal output for the correct URL.
-   **Missing API Key**: If the dashboard doesn't load data, verify that your `GEMINI_API_KEY` is correctly set in `.env.local`.

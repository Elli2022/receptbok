# Recipe Application Backend

## Description

This backend application is designed to manage recipes. It utilizes MongoDB for data storage and Express.js for handling HTTP requests. The application allows users to create, read, update, and delete (CRUD) recipes. Each recipe includes information such as name, description, portions, ingredients, category, instructions, image URL, source image URL, and creation date.

## Installation

To set up the application locally, follow these steps:

1. Clone the repository to your local machine.
2. Ensure that Node.js is installed on your system.
3. Install MongoDB and make sure it's running.
4. Navigate to the application directory and run `npm install` to install the required dependencies.
5. Create a `.env` file in the root of your backend directory with the following content, replacing the placeholder values with your actual MongoDB connection string:
    ```
    DATABASE_URL=your_mongodb_connection_string
    ```
6. Start the application by running `npm start`. The server should now be running and listening for requests.

## Usage

The application provides the following endpoints:

- `GET /`: Fetches all recipes.
- `POST /`: Creates a new recipe with the provided data.
- `PUT /:id`: Updates the recipe with the specified ID.
- `DELETE /:id`: Deletes the recipe with the specified ID.
- `GET /:id`: Fetches the details of the recipe with the specified ID.

## Contributing

Contributions to the application are welcome. To contribute:

1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Commit your changes.
4. Push your branch and open a pull request.

Before submitting your pull request, please ensure your code follows the existing style of the project and all tests pass.

### Application Structure

The backend is structured around the MVC (Model-View-Controller) pattern, though primarily focused on models and controllers as it serves as an API. The main entry point is `server.ts`, which initializes the express application, connects to MongoDB using Mongoose, and sets up basic routing.

### Running the Application

- **Development Mode**: Run `npm run dev` to start the application in development mode with hot reloading enabled.
- **Production Mode**: Run `npm start` to start the application using `ts-node`. Ensure you've built the application if you're using TypeScript.

### Frontend Integration

The frontend interacts with this backend through HTTP requests to fetch or manipulate recipes. The provided frontend example in `frontend/pages/recept/[id].tsx` demonstrates how to fetch and display a recipe's details from the backend.

### Environment Variables

- `DATABASE_URL`: Specifies the MongoDB connection string.
- `PORT`: Optional. Specifies the port on which the server will listen. Defaults to `3001` if not specified.

### Dependencies

- `cors`: Used to enable CORS (Cross-Origin Resource Sharing) with various options.
- `dotenv`: Loads environment variables from a `.env` file into `process.env`.
- `express`: Framework for handling HTTP requests.
- `mongoose`: ODM (Object Data Modeling) library for MongoDB and Node.js.
- `multer`: Middleware for handling `multipart/form-data`, primarily used for uploading files.

### Dev Dependencies

- `@types/express`: TypeScript definitions for Express.js.
- `@types/multer`: TypeScript definitions for Multer.
- `@types/node`: TypeScript definitions for Node.js.
- `nodemon`: Utility that monitors for any changes in your source and automatically restarts your server.
- `ts-node`: TypeScript execution environment and REPL for Node.js.
- `typescript`: JavaScript compiler/type checker that boosts JavaScript productivity.

### Scripts

- `"test"`: Placeholder script for running tests. Needs to be configured.
- `"dev"`: Starts the application in development mode with `nodemon` for hot reloading.
- `"start"`: Starts the application using `ts-node`.

### About Page

The frontend also includes an "About" page that provides information about the purpose and creation of the recipe blog. This page uses common components like `Navbar` and `Footer` for consistent navigation and layout.

## Code Explanation and Additional Components

### `frontend/pages/recept.tsx`

This file is a React component page in a Next.js application that renders a list of recipes. The component fetches recipe data from a backend server using `getServerSideProps`, which is executed on each request. This ensures that the recipe data is up-to-date whenever the page is rendered. The page includes search and filter functionality, allowing users to find recipes based on their name, category, or ingredients. The recipes are displayed in a responsive grid layout, with each recipe linking to its detailed page.

### `frontend/src/app/components/Footer.tsx`

The `Footer` component is a simple footer that includes contact information and a copyright notice. It is designed to be reused across different pages of the application, providing a consistent look and feel.

### `src/components/Navbar.tsx`

The `Navbar` component provides navigation links to the main sections of the application. It uses the `Link` component from Next.js for client-side navigation, improving the performance by avoiding full page reloads. The navigation bar is styled to be simple and user-friendly.

### `src/components/RecipeList.tsx`

Although not explicitly called in the provided snippets, `RecipeList` is a component designed to render a list of recipes. Each recipe is displayed with its name and description. This component could be used in various parts of the application where a list of recipes needs to be shown, such as search results or category listings.

### `src/components/SearchForm.tsx`

The `SearchForm` component provides a form for searching recipes. It calls a callback function passed as a prop (`onSearch`) when the form is submitted, allowing the parent component to handle the search logic. This component demonstrates a common pattern in React for lifting state up to the parent component, enabling the parent to control the behavior based on the search term.

### Key Features and Best Practices

- **Server-side Rendering (SSR)**: By using `getServerSideProps`, the recipe page leverages Next.js's SSR capabilities to pre-render the page on each request with fresh data from the backend.
- **State Management and Effects**: The recipe page uses React's `useState` and `useEffect` hooks for managing component state and side effects, such as fetching data and filtering recipes based on user input.
- **Component Reusability**: Components like `Navbar` and `Footer` are designed to be reusable across the application, promoting consistency and reducing duplication.
- **Responsive Design**: The application uses Tailwind CSS (implied by class names) for styling, which facilitates the creation of responsive layouts that work across various device sizes.

### Improvements and Considerations

- **Environment Variables**: Ensure that environment variables (like `NEXT_PUBLIC_BACKEND_URL`) are properly configured in both development and production environments.
- **Error Handling**: Implement error handling for API requests and user input validation to improve the application's robustness and user experience.
- **Accessibility**: Consider accessibility best practices, such as semantic HTML, keyboard navigability, and ARIA attributes, to make the application inclusive.
- **Performance Optimization**: Utilize Next.js's image optimization features (`next/image`) for loading and displaying images efficiently.

This overview covers the purpose and functionality of the provided code snippets, highlighting the structure, key features, and potential areas for enhancement in a React and Next.js application.

# Project Readme

## Overview

This project is a full-stack web application designed for managing and sharing recipes. It utilizes a modern technology stack with Next.js for the frontend, Express with Node.js for the backend, MongoDB as the database, and TypeScript for type safety. The application features a responsive design, ensuring a seamless experience across various devices and screen sizes.

## Features

- **Recipe Management**: Users can view, create, update, and delete recipes.
- **Search and Filter**: Recipes can be searched by name and filtered by categories or ingredients.
- **Responsive Design**: The application adapts to different screen sizes, providing an optimal viewing experience on mobiles, tablets, and desktops.
- **Custom Fonts**: Utilizes Google's Inter font for a clean and modern look.
- **Environment-specific Configuration**: Leverages `.env.local` for environment variables to easily switch between development and production settings.

## Technology Stack

- **Frontend**: Next.js, React, TypeScript
- **Backend**: Express, Node.js, TypeScript
- **Database**: MongoDB
- **Styling**: Tailwind CSS for utility-first CSS
- **Version Control**: Git for source code management

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- MongoDB
- Git

### Installation

1. **Clone the repository**

```bash
git clone https://your-repository-link.git
cd your-project-directory
```

2. **Install dependencies**

For the backend:

```bash
cd backend
npm install
```

For the frontend:

```bash
cd frontend
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the frontend directory with the following content:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

Ensure the backend `.env` file is configured with your MongoDB connection string and other necessary environment variables.

4. **Start the backend server**

```bash
cd backend
npm run start
```

5. **Start the frontend application**

```bash
cd frontend
npm run dev
```

The frontend application will be available at `http://localhost:3000`.

## Project Structure

### Backend

- `server.ts`: Entry point for the Express server.
- `/routes`: Contains Express route definitions.
- `/models`: Mongoose models for MongoDB documents.

### Frontend

- `pages`: Contains Next.js pages including API routes.
- `components`: Reusable React components like Navbar and Footer.
- `public`: Static assets like images.
- `styles`: Global styles and CSS modules.

### API Endpoints

- GET `/recipes`: Fetch all recipes.
- POST `/recipes`: Create a new recipe.
- GET `/recipes/:id`: Fetch a single recipe by ID.
- PUT `/recipes/:id`: Update a recipe by ID.
- DELETE `/recipes/:id`: Delete a recipe by ID.

## Development Practices

- **Component Reusability**: Aim for DRY (Don't Repeat Yourself) by reusing components.
- **Environment Variables**: Use environment variables to manage configuration without hardcoding sensitive information.
- **Responsive Design**: Utilize Tailwind CSS for responsive design to ensure the application is mobile-friendly.
- **Type Safety**: Leverage TypeScript for type safety and to catch errors early during development.

## Contributing

Contributions are welcome! Please follow the standard fork-and-pull request workflow. Ensure your code adheres to the project's coding standards and include tests if applicable.

## License

This project is licensed under the ISC License. See the LICENSE file for details.

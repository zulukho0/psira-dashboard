# PSIRA Dashboard

A comprehensive web application for managing students, instructors, courses, and classes for PSIRA (Private Security Industry Regulatory Authority).

## Table of Contents

- [About](#about)
- [Features](#features)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Project Structure](#project-structure)
- [API Integration](#api-integration)
- [Authentication](#authentication)
- [Contributing](#contributing)
- [License](#license)

## About

The PSIRA Dashboard is a React-based web application designed to streamline the management of private security training institutions. It provides administrators with tools to manage students, instructors, courses, subjects, and classes in one centralized platform.

## Features

- **User Authentication**: Secure login system with token-based authentication
- **Dashboard**: Overview of key metrics including student count, course count, instructor count, etc.
- **Student Management**: Create, read, update, and delete student records
- **Instructor Management**: Manage instructor profiles with signature upload capability
- **Course Management**: Create courses with associated subjects and pricing
- **Subject Management**: Define subjects with theory and practical mark allocations
- **Class Management**: Create classes with start/end dates, assign instructors and students
- **Student-Class Assignment**: Assign students to specific classes
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Technologies

- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [React Router](https://reactrouter.com/) - Declarative routing for React
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Axios](https://axios-http.com/) - Promise based HTTP client
- [React Query](https://react-query.tanstack.com/) - Data fetching and state management
- [ESLint](https://eslint.org/) - JavaScript linting utility

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (version 16 or higher)
- npm or yarn package manager
- A running instance of the PSIRA backend API

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/zulukho0/psira-dashboard.git
   ```

2. Navigate to the project directory:
   ```bash
   cd psira-dashboard
   ```

3. Install dependencies:
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_API_BASE=http://localhost:8000
```

- `VITE_API_BASE`: The base URL for the backend API

## Development

To start the development server:

```bash
npm run dev
```
or
```bash
yarn dev
```

The application will be available at `http://localhost:5173` (default Vite port).

## Building for Production

To create a production build:

```bash
npm run build
```
or
```bash
yarn build
```

To preview the production build locally:

```bash
npm run preview
```
or
```bash
yarn preview
```

## Project Structure

```
src/
├── api/                 # API client configuration
├── components/          # Reusable components
├── context/             # React context providers
├── features/            # Feature-specific modules
│   ├── classes/         # Class management
│   ├── courses/         # Course and subject management
│   ├── instructors/     # Instructor management
│   └── students/        # Student management
├── pages/               # Page components
└── App.jsx              # Main application component
```

Each feature directory typically contains:
- `pages/`: Page components for that feature
- `components/`: Feature-specific components
- `*.api.js`: API integration functions

## API Integration

The application integrates with a backend API using Axios. The API client is configured in `src/api/client.js` with:

- Base URL configuration from environment variables
- Automatic token attachment to requests
- Token refresh functionality for expired access tokens
- Error handling for authentication failures

## Authentication

The application uses JWT (JSON Web Token) based authentication:

1. Users log in with username and password
2. The backend returns access and refresh tokens
3. Access token is used for API requests
4. Refresh token is used to obtain new access tokens when they expire
5. Tokens are stored in localStorage

## Contributing

Contributions to the PSIRA Dashboard are welcome. Please follow these steps:

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes and commit them with descriptive messages
4. Push your changes to your fork
5. Submit a pull request to the main repository

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# EduLearn LMS System

EduLearn is a comprehensive Learning Management System (LMS) built to provide an intuitive educational platform for students and educators.

## Project Structure

- **FRONTEND**: React-based user interface built with Vite
- **BACKEND**: Spring Boot REST API service
- **DB**: Database resources and scripts

## Environment Setup

This project uses environment variables to manage sensitive information. Before running the application, you need to set up the environment files:

1. **Backend Setup**
   - Copy `BACKEND/.env.example` to `BACKEND/.env`
   - Update the values in `.env` with your actual credentials

2. **Frontend Setup**
   - Copy `FRONTEND/.env.example` to `FRONTEND/.env`
   - Update the values in `.env` with your actual API endpoints and keys

## Getting Started

### Frontend

```bash
cd FRONTEND
npm install
npm run dev
```

### Backend

```bash
cd BACKEND
./mvnw spring-boot:run
```

## Features

- Course management
- Student enrollment and progress tracking
- Assignment submission and grading
- Interactive learning resources
- User authentication and authorization

## Deployment & Security

- Never commit `.env` files to the repository
- Make sure to use proper environment configurations for different deployment environments (development, staging, production)
- Keep your AWS and Razorpay credentials secure 
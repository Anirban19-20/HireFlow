# HireFlow - Recruitment Management System

HireFlow is a full stack recruitment website made using Spring Boot and React.

The main purpose of this project is to provide one platform where candidates can search and apply for jobs, recruiters can manage jobs and applications, and admins can manage the overall system.

## Live Project

Frontend:

https://hireflow07.netlify.app

Backend:

https://hireflow-backend-fvwp.onrender.com

## Technologies Used

### Frontend

* React
* JavaScript
* HTML
* CSS
* Bootstrap
* Axios
* React Router

### Backend

* Java
* Spring Boot
* Spring Security
* JWT
* Spring Data JPA
* Hibernate
* Maven

### Database and Other Services

* PostgreSQL
* Supabase Database
* Supabase Storage
* Gmail SMTP

### Deployment

* Netlify - Frontend
* Render - Backend
* Supabase - Database and Resume Storage

## Main Features

The application has three types of users:

* Candidate
* Recruiter
* Admin

### Candidate Features

A candidate can:

* Register and login
* Create and update profile
* Upload resume
* View available jobs
* Search jobs
* View job details
* Save jobs
* Apply for jobs
* View applied jobs
* Track application status
* View interview details
* View job offers
* View onboarding status
* Receive notifications
* Reset password using email

### Recruiter Features

A recruiter can:

* Register and login
* Create company profile
* Update company details
* Create jobs
* Edit jobs
* Open or close jobs
* View candidates who applied
* Update application status
* Schedule interviews
* Reschedule interviews
* Evaluate candidates
* Create job offers
* Manage onboarding
* View notifications

### Admin Features

Admin can:

* Login to admin dashboard
* View users
* View candidates
* View recruiters
* View jobs
* View applications
* Delete jobs
* Monitor the platform

## Authentication

JWT authentication is used in this project.

After login, the backend generates a JWT token.

The token is stored on the frontend and sent with protected API requests.

Spring Security is used to restrict endpoints according to roles.

For example:

```text
/api/candidate/**  -> Candidate
/api/recruiter/**  -> Recruiter
/api/admin/**      -> Admin
```

Public endpoints such as login, registration and jobs can be accessed without authentication.

## Resume Upload

Candidates can upload their resumes in PDF format.

The resumes are stored in Supabase Storage.

Resume URL is saved with the candidate profile so recruiters can access the latest resume.

## Job Application Process

The basic application flow is:

```text
Candidate applies for job
        |
        v
APPLIED
        |
        v
UNDER REVIEW
        |
        v
SHORTLISTED
        |
        v
INTERVIEW
        |
        v
HIRED / REJECTED
```

Application status history is also stored so previous status changes can be viewed.

## Interview Management

Recruiters can schedule interviews for shortlisted candidates.

Interview details include:

* Date and time
* Interview mode
* Meeting link
* Location
* Notes

Recruiters can also reschedule interviews.

## Candidate Evaluation

Recruiters can evaluate candidates based on different points such as:

* Technical skills
* Communication
* Relevant experience
* Culture fit
* Interview performance

Private recruiter notes can also be added.

## Job Offers

Recruiters can create offers for selected candidates.

Offer statuses include:

```text
DRAFT
SENT
ACCEPTED
REJECTED
EXPIRED
WITHDRAWN
```

Candidates can accept or reject their offers.

## Onboarding

After a candidate accepts an offer, recruiter can manage the onboarding process.

Onboarding statuses are:

```text
JOINING_PENDING
DOCUMENTS_PENDING
READY_TO_JOIN
JOINED
NO_SHOW
```

## Notifications

The application also has a notification system.

Notifications are used for updates like:

* Application status change
* Interview scheduled
* Interview updated
* Job offer
* Onboarding updates

## Forgot Password

Forgot password functionality is also implemented.

User enters the registered email and receives a reset password link.

The reset token is valid for a limited time and can only be used once.

Password is stored using BCrypt encryption.

## Project Structure

```text
HireFlow
|
|-- hireflow-backend
|   |
|   |-- controller
|   |-- dto
|   |-- entity
|   |-- repository
|   |-- security
|   |-- service
|   |-- application.properties
|   |-- Dockerfile
|   |-- pom.xml
|
|-- hireflow-frontend
|   |
|   |-- public
|   |-- src
|       |
|       |-- api
|       |-- components
|       |-- context
|       |-- pages
|       |-- utils
|
|-- README.md
```

## Run Project Locally

### Backend

Go to backend folder:

```bash
cd hireflow-backend
```

Run:

```bash
mvn spring-boot:run
```

Backend will run on:

```text
http://localhost:8080
```

### Frontend

Go to frontend folder:

```bash
cd hireflow-frontend
```

Install dependencies:

```bash
npm install
```

Run frontend:

```bash
npm start
```

Frontend will run on:

```text
http://localhost:3000
```

## Environment Variables

For frontend:

```env
REACT_APP_API_URL=http://localhost:8080
```

For production:

```env
REACT_APP_API_URL=https://hireflow-backend-fvwp.onrender.com
```

Backend uses environment variables for:

* Database
* JWT secret
* Supabase
* Email
* Frontend URL

Production passwords and secret keys are not stored in GitHub.

## Deployment

Frontend is deployed on Netlify:

https://hireflow07.netlify.app

Backend is deployed on Render using Docker:

https://hireflow-backend-fvwp.onrender.com

Database and resume storage are handled using Supabase.

## Problems I Faced During Development

Some of the issues I faced while making this project were:

* JWT authentication issues
* 403 authorization errors
* CORS issues
* Connecting frontend with backend
* Supabase resume upload
* Database connection limit
* Expired JWT handling
* React Router deployment issue
* Production environment variables
* Forgot password email configuration
* Deploying Spring Boot using Docker
* Connecting Netlify frontend with Render backend

Working on these issues helped me understand how a full stack application works in both local and production environments.

## Future Improvements

Some features I can add in future:

* AI resume screening
* Job recommendation system
* Resume parsing
* Better recruiter analytics
* Real time notifications
* Calendar integration
* Interview reminders
* More advanced admin dashboard

## Developer

Anirban Maji

Java Full Stack Developer

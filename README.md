# University-Workspace-Reservation-System

## Workspace Reservation Web Application

This web application is designed for reserving workspaces, enabling communication between users and admins, and providing management functionalities for workspace booking. It is built using the MERN stack (MongoDB, Express, React, Node.js) and deployed via Render, with MongoDB Atlas used as the database. The application features real-time communication between the admin and user sides using Socket.io.

## Accessing the Application on Render

You can access the live version of the Workspace Reservation web application hosted on Render by following this link:

[Workspace Reservation Frontend](https://workspacereservation-front.onrender.com/)

## Credentials

**Admin Login**

* Email: 24100183@lums.edu.pk
* Password: admin123

**User Login**

* Email: meesum70110@gmail.com
* Password: User123!

Once logged in, you will have access to the respective admin or user functionalities depending on the credentials you use. Explore the platform to manage or reserve workspaces, communicate in real time, and more!

## Tech Stack

* **Frontend:** React.js for user interface development.
* **Backend:** Node.js with Express.js to manage API routes.
* **Database:** MongoDB Atlas for managing all user, workspace, and booking data.
* **Real-time communication:** Socket.io for admin-user communication.
* **Deployment:** Render for both frontend and backend hosting.

## How to Use

### User

* Login with your user credentials.
* View available workspaces, reserve, or cancel reservations.
* Access FAQs for help regarding the application.

### Admin

* Login with admin credentials.
* Manage workspaces (add, edit, delete).
* View user records and manage them.
* Communicate with users in real time using Socket.io.

## Deployment

This application is deployed on Render.

* **Frontend:** [Workspace Reservation Frontend](https://workspacereservation-front.onrender.com/)
* **Backend:** (link to backend if publicly available)

## Features

1. **User Authentication:**
    * Users and admins can log in with their respective credentials.
    * Admin and user roles are separated, each having access to different functionalities.
    * Passwords are securely stored in the database.
    * Prompts for Incorrect email, Incorrect password.
    * Logout Functionality within Web App. You can log out at any time.
 
2. **Admin Dashboard:**
    * Admins can add, modify, or delete workspaces.
    * Admins can view My Account, a list of all users (user records) and search by department or email.
    * Admins can manage user records, including updating details or deleting accounts.
3. **User Dashboard:**
    * User can Login with your user credentials.
    * View available workspaces, reserve, or cancel reservations.
    * Access FAQs for help regarding the application.
 
4. **Workspace Reservation:**
    * Admins can add, modify, or delete workspaces.
    * Users can view available workspaces and reserve them.
    * Users can filter workspaces by location and availability status.
    * Workspaces can be booked for specific time slots (for future use).
    * Users can modify or cancel reservations as per the defined policy (for future).
 
5. **FAQ Management:**
    * Admins can add, modify, or delete frequently asked questions (FAQs) visible to users.
    * Users can access FAQs to get quick answers regarding reservations, modifications, and cancellations.
  
 6. **Collapsible Sidebar menu dropdown & Sliding bar (in bottom):**
    * For options visibility

## File Structure


P12-UniversityWorkspaceReservationSystem/
│
├── Architecture/
├── Management/
├── Requirements/
├── Reviews/
│
├── client/
│   ├── build/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Images/
│   │   │   ├── SharedComponents/
│   │   │   └── (component files like admin.js, login.js, etc.)
│   │   ├── context/
│   │   │   ├── hook/
│   │   │   │   └── useAuthorization.js
│   │   │   └── (context files like authorization.js, socket.js)
│   │   ├── styles/
│   │   │   └── (CSS files like faqs.css, login.css, etc.)
│   │   └── (root files like App.js, index.js)
│
├── server/
│   ├── controllers/
│   │   ├── mailer/
│   │   │   └── sendCredentials.js
│   │   └── (controller files like accountController.js, loginController.js, etc.)
│   ├── middleware/
│   │   └── authorize.js
│   ├── models/
│   │   └── (model files like userData.js, workspaceData.js)
│   ├── routes/
│   │   └── (route files like account.js, login.js, workspace.js)
│   └── (root files like server.js, .env)
│
├── .gitignore
├── LICENSE
├── README.md
├── package.json
├── package-lock.json


________________________________________


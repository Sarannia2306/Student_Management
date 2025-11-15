# Student Management System

A simple Student Management System for **Admins** and **Students**, built with HTML, Bootstrap 5 and vanilla JavaScript. Data and authentication are handled by **Firebase Authentication** and **Firebase Realtime Database**, with `localStorage` used as a fallback/cache.

## Main Features

- **Authentication & Roles**  
  Email/password login with Firebase, email verification, and role-based access (Student / Admin).

- **Student Profiles**  
  Store student details, program, semester and contact information. Students can view and update their own profile.

- **Programs & Subjects**  
  Admins manage programs and their subjects/courses.

- **Subject Enrolment**  
  Students select subjects under their program. Admins can review and adjust enrolments per student.

- **Attendance**  
  Admins mark attendance by date, program, semester and subject with status **Present / Absent / Late**.  
  Students see their own attendance summary and history.

- **Announcements**  
  Admins post announcements; students see them on their dashboard and Announcements page. Announcements are stored under `/announcements` in Firebase.

- **Activity Logs**  
  Key actions (logins, updates, program changes, announcements, attendance marking) are recorded in a local Activity Log for transparency.

- **Privacy & Security Information**  
  Terms / privacy text and security tips (strong passwords, logging out, etc.) are shown in the UI to guide users.

## Tech Stack

- **Frontend**: HTML, Bootstrap 5, JavaScript (no framework)  
- **Backend-as-a-Service**: Firebase Authentication, Firebase Realtime Database  
- **Storage/Fallback**: Browser `localStorage` for demo / offline use

## Setup

1. Create a Firebase project and enable **Email/Password** auth and **Realtime Database**.  
2. Copy your Firebase config into `js/firebase-init.js` (apiKey, authDomain, databaseURL, etc.).  
3. Set appropriate Realtime Database rules (users, students, attendance, announcements, etc.).  
4. Open `index.html` in a modern browser (or serve with any static server).

## Basic Usage

- Use the **Register** modal to create Student or Admin accounts.  
- Verify your email, then log in.  
- **Admins**: manage students, programs, attendance, announcements and view activity logs from the top navigation.  
- **Students**: view dashboard, attendance, announcements and subject enrolment from their tabs.

## Notes

- This project is intended for learning / coursework.  
- Customize wording, rules and data structures to match your institution’s policies and PDPA/GDPR requirements.

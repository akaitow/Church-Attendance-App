# Church Assistance & Attendance App

A modern, multi-tenant web application designed to help churches manage their staff, congregation, and Sunday attendance tracking securely and efficiently.

## Features

- **Multi-Tenant Architecture**: Each church/organization signs up and operates in complete isolation. Data from one church is never visible to another.
- **Role-Based Access Control**:
  - **Admin**: Can manage the church's profile, view reports, and create/manage up to 10 staff or elder accounts.
  - **Elder**: Can view high-level attendance reports, view the staff directory, and review/approve "Change Requests" submitted by staff members.
  - **Staff**: Can view their assigned list of congregation members and visitors, take weekly attendance, and submit requests to add or edit people.
- **Attendance Tracking**: Staff members can draft and submit weekly attendance. They can mark individuals as "Present", "Absent", or "Unknown".
- **Dynamic Reporting**: Elders and Admins have access to historical trends and absence rankings to better care for their congregation.
- **Workflow & Notifications**: When staff members submit requests (like adding a new visitor), Elders receive an in-app notification to review and approve the request.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database**: SQLite (Development) via [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Credentials Provider with `bcrypt` password hashing)
- **Styling**: Vanilla CSS utilizing customized CSS Variables for a dynamic, modern aesthetic.

## Getting Started

First, ensure you have Node.js installed, then install the project dependencies:

```bash
npm install
```

Since this app uses Prisma, you need to push the schema to your local SQLite database before running the app for the first time:

```bash
npx prisma db push
```

Finally, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Using the App

1. **Sign Up**: Navigate to `/signup` to register a new Church organization and create your first Admin account.
2. **Setup Staff**: Log in as the Admin and navigate to **Manage Staff** to create accounts for your team.
3. **Manage Congregation**: Staff members can begin submitting requests to add Members and Visitors, which Elders will then approve.
4. **Take Attendance**: Every Sunday, staff members can log attendance for their assigned people!

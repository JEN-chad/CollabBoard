# CollabBoard — Real-Time Collaborative Task Board with Conflict Resolution

## Role

You are a Senior Full Stack Engineer from Atlassian (Jira) and Figma with expertise in:

* React
* Node.js
* Express.js
* MongoDB
* Socket.io
* Real-time collaboration systems
* State synchronization
* Distributed systems
* Conflict resolution algorithms
* Authentication & Authorization

Your task is to build a production-grade MVP called **CollabBoard**.

---

# Objective

Build a real-time collaborative Kanban board where multiple users can:

* Create boards
* Invite members
* Create task cards
* Move cards between columns
* Edit card details
* Collaborate in real time

The application must demonstrate:

1. Real-time communication
2. Multi-user synchronization
3. Optimistic UI updates
4. Conflict resolution
5. Role-based access control
6. Scalable architecture

The project should be interview-ready and showcase advanced full-stack engineering skills.

---

# Core Features

## Authentication

### User Registration

Fields:

* Name
* Email
* Password

Requirements:

* JWT Authentication
* Password hashing using bcrypt
* Login
* Logout

---

## Boards

Users can:

* Create board
* Delete board
* Update board
* View board

Board Schema:

```js
{
  _id,
  title,
  description,
  ownerId,
  members: [],
  createdAt,
  updatedAt
}
```

---

## Roles & Permissions

### Owner

Can:

* Edit board
* Delete board
* Invite members
* Change roles

### Editor

Can:

* Create cards
* Move cards
* Update cards

### Viewer

Can:

* View board only

````

---

## Kanban Columns

Default Columns:

```txt
Todo
In Progress
Review
Done
````

---

## Cards

Card Schema

```js
{
  _id,
  title,
  description,
  priority,
  assignee,
  boardId,
  columnId,
  position,
  version,
  updatedBy,
  updatedAt
}
```

Fields:

* title
* description
* assignee
* due date
* priority

---

# Real-Time Collaboration

Use Socket.io.

Events:

```txt
board:join
card:create
card:update
card:move
card:delete
user:typing
board:update
```

When a user joins:

```txt
Socket joins board room
```

Example:

```js
socket.join(boardId)
```

---

# Optimistic UI

Requirement:

When a card is dragged:

1. Update UI instantly
2. Don't wait for server response
3. Send move event to server
4. Reconcile if server response differs

Example Flow:

```txt
User drags card

↓

UI updates instantly

↓

Socket emits card:move

↓

Server validates

↓

Server broadcasts official state

↓

Client syncs
```

---

# Conflict Resolution (MOST IMPORTANT FEATURE)

Scenario:

User A and User B drag the same card simultaneously.

Naive solution:

```txt
Last write wins ❌
```

Required solution:

```txt
Version-based conflict resolution ✅
```

Every card contains:

```js
version: Number
```

Flow:

```txt
Client sends:

cardId
newColumn
newPosition
version
```

Server:

```txt
1. Fetch latest card
2. Compare versions

If versions match:
    Apply update
    Increment version

Else:
    Reject update
    Send latest state
```

Example:

```txt
Card Version = 10

User A updates -> accepted
Version becomes 11

User B updates using version 10

Rejected

Server returns latest version 11
```

This demonstrates understanding of:

* Race Conditions
* Concurrency Control
* Distributed Systems
* Real-Time Sync

---

# Drag and Drop

Use:

```txt
@hello-pangea/dnd
```

Requirements:

* Reorder cards
* Move between columns
* Smooth animations
* Optimistic updates

---

# Dashboard

Display:

* Total Boards
* Total Tasks
* Tasks Completed
* Active Collaborators

---

# Activity Feed

Track:

```txt
Card Created
Card Moved
Card Updated
User Joined
User Left
```

Schema:

```js
{
  action,
  user,
  card,
  timestamp
}
```

---

# Backend Architecture

Structure:

```txt
server/
│
├── controllers
├── routes
├── middleware
├── services
├── sockets
├── models
├── config
└── server.js
```

---

# Frontend Architecture

Structure:

```txt
client/
│
├── pages
├── components
├── hooks
├── services
├── context
├── sockets
├── utils
└── App.jsx
```

---

# API Endpoints

Auth:

```txt
POST /api/auth/register
POST /api/auth/login
```

Boards:

```txt
GET /api/boards
POST /api/boards
GET /api/boards/:id
PUT /api/boards/:id
DELETE /api/boards/:id
```

Cards:

```txt
POST /api/cards
PUT /api/cards/:id
DELETE /api/cards/:id
```

---

# UI Requirements

Theme:

Professional SaaS

Inspired By:

* Jira
* Linear
* Trello

Requirements:

* Clean layout
* Sidebar
* Board list
* Drag and drop board
* Responsive
* Loading states
* Empty states
* Toast notifications

---

# Tech Stack

Frontend

```txt
React
Vite
Tailwind CSS
Socket.io Client
React Router
Axios
@hello-pangea/dnd
```

Backend

```txt
Node.js
Express.js
MongoDB
Mongoose
Socket.io
JWT
bcryptjs
```

---

# Deliverables

Build a working MVP containing:

✅ Authentication

✅ Board CRUD

✅ Role-Based Access

✅ Kanban Board

✅ Real-Time Collaboration

✅ Optimistic UI

✅ Conflict Resolution

✅ Socket.io Rooms

✅ Activity Feed

✅ Responsive UI

---

# Notes

For the 1-hour MVP, prioritize in this order:

1. Authentication
2. Single Board
3. Card CRUD
4. Drag & Drop
5. Socket.io Sync
6. Optimistic UI
7. Version-Based Conflict Resolution

Skip:

* Email invitations
* Notifications
* File uploads
* Comments
* Advanced analytics

The key interview differentiator is demonstrating how simultaneous card updates are handled using optimistic UI and version-based conflict resolution instead of last-write-wins.

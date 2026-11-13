
# TeaTime Vending API

## Project Description
TeaTime Vending is a backend application developed using Node.js, Express.js and SQLite. It manages vending machines, operators and their assignments.

## Technologies Used
- Node.js
- Express.js
- SQLite3
- JavaScript
- VS Code

## Project Structure
- server.js - Main Express server
- database/db.js - Database connection and table creation
- routes/machineRoutes.js - Machine CRUD and search operations
- routes/operatorRoutes.js - Operator routes
- routes/assignmentRoutes.js - Assignment JOIN endpoint
- routes/auditRoutes.js - Audit trail endpoint

## Installation and Execution

1. Clone the repository.
2. Open the project folder in VS Code.
3. Install dependencies:

   npm install

4. Start the server:

   npm start

The server runs at http://localhost:3000

## API Endpoints

### Machines
| Method | Endpoint | Description |
|---|---|---|
| GET | /machines | Get all machines |
| GET | /machines/:id | Get a machine by ID |
| POST | /machines | Add a machine |
| PUT | /machines/:id | Update a machine |
| DELETE | /machines/:id | Delete a machine |
| GET | /machines?product=Tea | Search machines by product |

### Operators
| Method | Endpoint | Description |
|---|---|---|
| GET | /operators | Get all operators |
| GET | /operators/:id | Get an operator by ID |

### Assignments
| Method | Endpoint | Description |
|---|---|---|
| GET | /assignments | Get assignments with operator and machine names |

### Audit
| Method | Endpoint | Description |
|---|---|---|
| GET | /audit | Get the latest 10 audit records |

## Validation and Error Handling
- Machine name and product are required.
- Invalid machine details return a 400 status.
- Requests for unavailable records return a 404 status.
- Server or database errors return a 500 status.

## Special Feature: Audit Trail
Every machine addition, update and deletion is recorded in the audit table with its action, machine ID and timestamp.

The audit endpoint returns the latest 10 records in descending order.

## Testing
API requests are included in `TeaTime-Vending.postman_collection.json`.

The API was tested using the VS Code terminal.

### Expected Status Codes
- 200 OK - Successful GET and PUT requests
- 201 Created - Machine successfully added
- 400 Bad Request - Invalid input
- 404 Not Found - Requested record does not exist
- 500 Internal Server Error - Server or database error

## Team Members
- Hasya
- Susvitha
- Chandu
- Vinay Vardhan
- Madhukar

## Submission Details

- Assignment: LG-14 – TeaTime Vending
- Group: 14
- Backend: Node.js and Express.js
- Database: SQLite
- API Testing: Postman Collection

## Team Contributions

| Member | Responsibility |
|---|---|
| Hasya | Server setup and routes |
| Susvitha | Database setup |
| Chandu | REST API endpoints |
| Vinay Vardhan | Validation and search |
| Madhukar | Audit trail, Postman testing and README |

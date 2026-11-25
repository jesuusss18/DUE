
# DUE — Testing and Quality Assurance

[Back to README](../README.md)

## 1. Testing Overview

DUE uses automated testing to verify application functionality, business logic, feature interactions, security, and error handling.

Testing was implemented throughout development and expanded during Sprint 3 to meet the comprehensive testing requirements of the final project.

## 2. Testing Tools

| Tool | Purpose |
| --- | --- |
| Jest | Unit testing, assertions, mocks, and coverage |
| Supertest | HTTP API integration testing |
| pg-mem | In-memory PostgreSQL-compatible database |
| GitHub Actions | Automated test execution |

## 3. Final Testing Results

Results recorded on November 25, 2026.

| Metric | Result |
| --- | ---: |
| Total tests | 224 |
| Passed tests | 224 |
| Failed tests | 0 |
| Test suites | 17 |
| Passed test suites | 17 |
| Execution time | 4.062 seconds |
| Execution time with coverage | 4.425 seconds |

All automated tests passed in both final local test runs.

## 4. Code Coverage

| Metric | Coverage |
| --- | ---: |
| Statements | 97.90% |
| Branches | 93.39% |
| Functions | 100% |
| Lines | 97.84% |

### Coverage by Component

| Component | Statements | Branches | Functions | Lines |
| --- | ---: | ---: | ---: | ---: |
| Controllers | 100% | 100% | 100% | 100% |
| Factories | 100% | 100% | 100% | 100% |
| Middleware | 100% | 100% | 100% | 100% |
| Models | 100% | 70.37% | 100% | 100% |
| Routes | 93.87% | 50% | 100% | 93.87% |
| Services | 100% | 100% | 100% | 100% |
| Templates | 100% | 76.92% | 100% | 100% |
| Utilities | 100% | 100% | 100% | 100% |
| Assignment search | 100% | 92.85% | 100% | 100% |
| Reminder script | 95% | 75% | 100% | 95% |
| Database configuration | 0% | 0% | 100% | 0% |

Coverage applies to the selected backend files, assignment search utility, and reminder execution script. It does not represent every file or frontend interaction in the application.

## 5. Test Suite Inventory

| Test File | Purpose |
| --- | --- |
| assignmentController.test.js | Assignment operations and validation |
| examController.test.js | Exam operations and validation |
| authController.test.js | Registration and login |
| settingsController.test.js | Notification preferences |
| authMiddleware.test.js | JWT authentication |
| assignmentSearch.test.js | Search, filters, and overdue tracking |
| taskStats.test.js | Assignment statistics |
| reminderLogic.test.js | Reminder decisions |
| reminderValidation.test.js | Notification input validation |
| integration.test.js | API and database interactions |
| factories.test.js | Factory pattern verification |
| reminderService.test.js | Reminder processing |
| reminderEmail.test.js | Email content generation |
| emailService.test.js | Gmail API interaction |
| reminderModel.test.js | Reminder database operations |
| runReminders.test.js | Scheduled reminder execution |
| errorHandler.test.js | Centralized error handling |

## 6. Unit Testing

Unit tests verify individual application components independently.

The tests cover critical business logic, including:

- Assignment and exam validation.
- Authentication and registration.
- Assignment search and filtering.
- Overdue assignment detection.
- Academic progress statistics.
- Reminder decisions.
- Timezone handling.
- Notification preferences.
- Email generation.
- Factory object creation.
- Error handling.

External dependencies are mocked where necessary to isolate individual components.

## 7. Integration Testing

Integration tests verify how application components work together.

Supertest sends HTTP requests to the Express application, allowing tests to exercise routes, middleware, controllers, models, and database operations.

The integration tests verify:

- Account registration and login.
- Protected API endpoints.
- Assignment creation, retrieval, update, and deletion.
- Exam creation, retrieval, update, and deletion.
- User data isolation.
- Notification preference persistence.
- Health endpoint responses.
- Invalid request handling.
- Session logout.

The tests use pg-mem instead of the production PostgreSQL database.

## 8. Design Pattern Verification

MVC is exercised through integration tests that verify communication between routes, controllers, and models.

Factory tests verify consistent object creation, default values, unique identifiers, and input normalization.

## 9. Email Reminder Testing

The email reminder tests verify:

- Daily reminders.
- Gap reminders.
- All-caught-up notifications.
- Timezone-based scheduling.
- Completed assignment exclusion.
- Reminder history.
- Duplicate history prevention.
- Email content generation.
- Gmail API error handling.
- Continued processing when an individual reminder fails.

Gmail API calls are mocked during automated testing. Real emails are not sent.

## 10. Error Handling Tests

Error handling tests verify that the application responds appropriately to invalid requests and unexpected failures.

| Scenario | Expected Result |
| --- | --- |
| Missing authentication | 401 Unauthorized |
| Incorrect login credentials | 401 Unauthorized |
| Duplicate registration | 409 Conflict |
| Invalid assignment information | 400 Bad Request |
| Invalid exam information | 400 Bad Request |
| Invalid reminder preferences | 400 Bad Request |
| Invalid resource UUID | 400 Bad Request |
| Malformed JSON | 400 Bad Request |
| Unknown API endpoint | 404 Not Found |
| Resource belonging to another user | 404 Not Found |
| Unexpected server failure | 500 Internal Server Error |

## 11. Running Tests

Install dependencies:

```bash
npm ci
```

Run the complete test suite:

```bash
npm test
```

Run a specific test file:

```bash
npm test -- integration.test.js
```

Generate the coverage report:

```bash
npm test -- --coverage --collectCoverageFrom="src/**/*.js" --collectCoverageFrom="public/assignmentSearch.js" --collectCoverageFrom="scripts/runReminders.js"
```

The generated HTML coverage report can be opened from:

`coverage/lcov-report/index.html`

## 12. Continuous Integration

GitHub Actions automatically installs dependencies and runs the test suite on pushes and pull requests.

The CI workflow is located at:

`.github/workflows/ci.yml`

Failed tests provide feedback through the workflow logs and must be resolved before merging when the required status check is enforced.

## 13. Project Requirements Verification

| Requirement | Implementation |
| --- | --- |
| Unit tests for critical business logic | Completed |
| Integration tests for feature interactions | Completed |
| Error handling tests | Completed |
| Debugging documentation | See DEBUGGING.md |
| Consistent test execution | 224 tests passed in both final local runs |

## 14. Testing Limitations

- Integration tests use an in-memory database rather than a live PostgreSQL instance.
- Gmail API interactions are simulated.
- Database connection configuration is mocked.
- Some integration tests share authenticated sessions and depend on execution order.
- Automated coverage does not include every frontend interaction.
- Manual production verification is still necessary after deployment.

These limitations identify areas for future testing improvements without affecting the recorded test results.

---

DUE — Testing and Quality Assurance Documentation

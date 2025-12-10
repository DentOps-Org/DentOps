# Tests

Test files for the DentOps frontend app.

📋 **See [TEST_SUMMARY.md](./TEST_SUMMARY.md) for detailed test coverage and functionality analysis.**

## Test Structure

```
tests/
├── components/          # Component tests
│   ├── LoginForm.test.jsx
│   ├── RegisterForm.test.jsx
│   ├── ProtectedRoute.test.jsx
│   ├── PatientDashboard.test.jsx
│   ├── DentistDashboard.test.jsx
│   └── ManagerDashboard.test.jsx
├── utils/              # Utility tests (empty for now)
└── setup.js            # Test config
```

## Running Tests

Run all tests (exits after completion):
```bash
npm test
```

Watch mode (runs continuously):
```bash
npm run test:watch
```

With UI:
```bash
npm run test:ui
```

Coverage report:
```bash
npm run test:coverage
```

## What's Tested

**ProtectedRoute** - Tests if content shows/hides based on user auth and roles

**LoginForm** - Tests form rendering, input handling, and basic validation

**RegisterForm** - Tests form fields, role selection, and specialization field visibility

**PatientDashboard** - Tests dashboard rendering, cards, and navigation links

**DentistDashboard** - Tests dashboard title, quick actions, and tabs

**ManagerDashboard** - Tests dashboard cards and sections

## Writing Tests

Keep it simple:
- One test = one thing to check
- Use clear test names
- Group related tests with `describe`
- Keep comments minimal

## Setup

Uses Vitest, React Testing Library, and jsdom. Config is in `vite.config.js` and `tests/setup.js`.

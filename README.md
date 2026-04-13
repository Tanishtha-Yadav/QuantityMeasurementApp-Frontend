# Quantity Measurement App - Angular Frontend

A modern Angular 17+ frontend for the Quantity Measurement application with TypeScript, Tailwind CSS, RxJS, and complete API integration.

## Features

- **Authentication**: Login, Register, and JWT Token Management
- **Measurement Operations**: 
  - Comparison: Compare two quantities in different units
  - Conversion: Convert quantity from one unit to another
  - Arithmetic: Perform arithmetic operations on quantities
- **Real-time Calculation**: Form-driven reactive calculations
- **History Tracking**: View calculation history
- **Error Handling**: Global error interceptor with user-friendly messages
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **Type-safe**: Full TypeScript implementation

## Technology Stack

- Angular 17+
- TypeScript 5.2+
- Tailwind CSS 3.4+
- RxJS 7.8+
- HttpClient with Interceptors
- Reactive Forms

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Backend API running on `http://localhost:8080`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Navigate to http://localhost:4200/
```

### Build

```bash
# Build for production
npm run build
```

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── auth/          # Login & Register components
│   │   ├── measurement/   # Main measurement component
│   │   └── shared/        # Error banner, loading spinner
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── measurement.service.ts
│   ├── interceptors/
│   │   ├── auth.interceptor.ts
│   │   └── error.interceptor.ts
│   ├── pipes/
│   │   ├── unit-format.pipe.ts
│   │   └── comparison-symbol.pipe.ts
│   ├── models/
│   │   └── index.ts       # All TypeScript interfaces
│   ├── app.component.ts
│   └── app.config.ts
├── environments/          # API configuration
├── styles.css            # Global styles
├── index.html
└── main.ts
```

## API Integration

### Base URL
- Development: `http://localhost:8080/api/v1`
- Auth: `http://localhost:8080/auth`

### Endpoints Used

**Authentication:**
- `POST /auth/login` - Login
- `POST /auth/register` - Register
- `POST /auth/refresh` - Refresh token

**Measurements:**
- `POST /api/v1/quantities/compare` - Compare quantities
- `POST /api/v1/quantities/convert/{targetUnit}` - Convert units
- `POST /api/v1/quantities/add` - Add quantities
- `POST /api/v1/quantities/subtract` - Subtract quantities
- `POST /api/v1/quantities/divide` - Divide quantities
- `GET /api/v1/quantities/history` - Get history

## Forms & Validation

All forms use **Reactive Forms** with custom validators:
- Required fields
- Numeric validation
- Email validation
- Password confirmation matching

## State Management

- **BehaviorSubjects** for shared state
- **RxJS Operators**: switchMap, debounceTime, tap, catchError
- **Services**: AuthService, MeasurementService provide state streams

## Error Handling

Global HTTP Interceptor catches errors and displays user-friendly messages:
- Network errors
- 400/401/500 server errors
- Automatic error dismissal after 5 seconds

## Pipes

- **UnitFormatPipe**: Formats numbers to 6 significant figures with unit suffix
- **ComparisonSymbolPipe**: Transforms comparison results to readable format

## Development

### Add New Component
```bash
ng generate component components/measurement/my-component
```

### Add New Service
```bash
ng generate service services/my-service
```

### Run Tests
```bash
npm test
```

## Production Deployment

1. Update `environment.prod.ts` with production API URL
2. Build: `npm run build`
3. Deploy `dist/` folder to web server
4. Ensure CORS is configured on backend



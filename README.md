# Golf Charity Subscription Platform

A full-stack web application that combines golf performance tracking with charity fundraising and monthly prize draws.

## Features

- **User Authentication & Subscription Management**
  - User registration and login
  - Monthly/yearly subscription plans with Razorpay integration
  - Subscription management and cancellation

- **Golf Score Tracking**
  - Enter and manage golf scores (Stableford format)
  - Automatic rolling 5-score system
  - Score validation and date tracking

- **Monthly Prize Draws**
  - Automated monthly draw system
  - Prize pool calculation based on subscriptions
  - Winner verification and payout management
  - 3, 4, and 5 number matching system

- **Charity Integration**
  - Browse and select charities
  - Automatic charity contributions from subscriptions
  - Direct donation functionality
  - Featured charity system

- **Admin Dashboard**
  - User management
  - Charity management
  - Draw simulation and execution
  - Winner verification and payout tracking
  - Analytics and reporting

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Razorpay for payments
- Cloudinary for image uploads
- Nodemailer for emails
- Node-cron for scheduled tasks

### Frontend
- React 19 with Vite
- Tailwind CSS for styling
- Zustand for state management
- React Router for navigation
- Razorpay Checkout for payments
- Axios for API calls

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Razorpay account
- Cloudinary account (for image uploads)
- Email service (Gmail recommended)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/golf-charity-platform
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=rzp_test_your_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=5000
```

4. Seed the database with sample data:
```bash
node db/seed.js
```

5. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
```

4. Start the development server:
```bash
npm run dev
```

### Razorpay Configuration

1. Create a Razorpay account at https://razorpay.com and get your API keys from the dashboard.

2. Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `backend/.env` and `VITE_RAZORPAY_KEY_ID` in `frontend/.env`.

3. Payment verification is handled directly in the app — no webhooks required.

### Test Accounts

After running the seed script, you can use these test accounts:

- **Admin**: admin@golfcharity.com / admin123
- **User**: user@test.com / user123

## Deployment

### Backend (Vercel)
1. Create a new Vercel project
2. Set environment variables in Vercel dashboard
3. Deploy from your repository

### Frontend (Vercel)
1. Create a new Vercel project
2. Set environment variables in Vercel dashboard
3. Update API URL to point to your deployed backend
4. Deploy from your repository

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Update MONGODB_URI in your environment variables
3. Whitelist your deployment IPs

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/dashboard` - Get dashboard data

### Subscriptions
- `GET /api/subscription/plans` - Get available plans
- `POST /api/subscription/create` - Create subscription
- `POST /api/subscription/cancel` - Cancel subscription

### Scores
- `GET /api/scores` - Get user scores
- `POST /api/scores` - Add new score
- `PUT /api/scores/:id` - Update score
- `DELETE /api/scores/:id` - Delete score

### Charities
- `GET /api/charity` - Get all charities
- `GET /api/charity/:id` - Get charity details
- `POST /api/charity/donate` - Make donation

### Draws
- `GET /api/draw/current` - Get current draw
- `GET /api/draw/history` - Get draw history
- `GET /api/draw/my-numbers` - Get user's draw numbers

### Admin
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - Manage users
- `GET /api/admin/charities` - Manage charities
- `GET /api/admin/draws` - Manage draws
- `POST /api/admin/draws/simulate` - Simulate draw
- `POST /api/admin/draws/run` - Run monthly draw

## Key Features Implementation

### Score System
- Users must enter exactly 5 scores to participate
- Scores are in Stableford format (1-45 points)
- New scores replace oldest when exceeding 5
- Scores become draw numbers (sorted ascending)

### Draw System
- Monthly automated draws using cron jobs
- Prize pool calculated from active subscriptions
- 40% for 5-match, 35% for 4-match, 25% for 3-match
- Jackpot rollover if no 5-match winners

### Charity System
- Users select charity at signup
- Minimum 10% contribution from subscription
- Direct donations also supported
- Real-time tracking of raised amounts

### Winner Verification
- Winners must upload proof of scores
- Admin verification process
- Status tracking: pending → verified → paid

## Security Features

- JWT authentication with secure tokens
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet for security headers

## Monitoring & Analytics

- User registration and activity tracking
- Subscription revenue monitoring
- Charity contribution tracking
- Draw participation analytics
- Winner verification metrics

## Support

For technical support or questions about the platform, please contact the development team or refer to the documentation.

## License

This project is proprietary software developed for Digital Heroes. All rights reserved.
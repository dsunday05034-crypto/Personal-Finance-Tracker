# Personal Finance Tracker

A personal finance tracking application built with Next.js and Supabase. Track your expenses across multiple currencies with automatic conversion to a base currency.

## Features

- **User Authentication**: Secure sign up, login, and logout powered by Supabase Auth
- **Transaction Management**: Create, view, and soft-delete expense transactions
- **Multi-Currency Support**: Track expenses in NGN, USD, or EUR with automatic conversion to USD base currency
- **Live Exchange Rates**: Real-time exchange rates fetched securely via server-side API
- **Category Auto-Suggestions**: Categories are automatically saved and can be used for future autocomplete (UI pending)
- **Soft Delete**: Transactions are marked as deleted but can be recovered (permanent deletion not yet implemented)
- **Row Level Security**: All data is isolated per user at the database level

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, plain JavaScript
- **Backend**: Supabase (PostgreSQL, Auth, Row Level Security)
- **API**: Next.js API Routes for server-side operations
- **External API**: exchangerate-api.com for live currency conversion rates
- **Hosting**: Designed for Vercel deployment

## Prerequisites

- Node.js LTS (installed via nvm recommended)
- npm or yarn
- A Supabase account and project
- An API key from [exchangerate-api.com](https://www.exchangerate-api.com/)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Personal-Finance-Tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXCHANGE_RATE_API_KEY=your-exchangerate-api-key
```

**How to get these values:**

1. **Supabase Project URL and Anon Key**:
   - Go to your Supabase dashboard
   - Navigate to Settings → API
   - Copy the "Project URL" and "anon public" key
   
2. **Exchange Rate API Key**:
   - Sign up at [exchangerate-api.com](https://www.exchangerate-api.com/)
   - Get your free API key from the dashboard

⚠️ **Important**: The `.env.local` file is gitignored and should never be committed to version control.

### 4. Set Up Supabase Database

Run the following SQL commands in your Supabase SQL Editor to create the required tables and policies:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create transactions table
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz,
  deleted_at timestamptz,
  user_id uuid references auth.users not null,
  category text not null,
  amount numeric not null,
  currency text not null default 'NGN',
  converted_amount numeric not null default 0,
  exchange_rate numeric not null default 1,
  base_currency text not null default 'USD'
);

-- Create categories table
create table categories (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now(),
  user_id uuid references auth.users not null,
  name text not null
);

-- Enable Row Level Security
alter table transactions enable row level security;
alter table categories enable row level security;

-- RLS policy for transactions: users can only access their own data
create policy "Users can access own transactions"
  on transactions
  for all
  using (auth.uid() = user_id);

-- RLS policy for categories: users can only access their own categories
create policy "Users can access own categories"
  on categories
  for all
  using (auth.uid() = user_id);
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Sign Up**: Create a new account with your email and password
2. **Log In**: Use your credentials to log in
3. **Add Transaction**: 
   - Enter a category (e.g., "Food", "Transport")
   - Enter an amount
   - Select a currency (NGN, USD, or EUR)
   - Click "Save"
4. **View Transactions**: All your transactions appear below the form
5. **Delete Transaction**: Click "Delete" to soft-delete a transaction (can be recovered from database)

## Architecture Notes

### Security
- **Anon Key Safety**: The Supabase anon key is safe to expose in client code - it identifies the app, not the user
- **RLS is the Real Security**: Row Level Security policies enforce data isolation at the database level
- **API Key Protection**: The exchange rate API key is kept server-side only, never exposed to the browser

### Data Integrity
- **Soft Delete**: Transactions are marked with `deleted_at` instead of being permanently removed
- **Locked Exchange Rates**: Conversion rates are captured at transaction creation time, so historical data doesn't change
- **Submission Guards**: Buttons are disabled during async operations to prevent duplicate submissions

### Currency Conversion
The app uses division (not multiplication) for currency conversion:
```
converted_amount = amount / exchange_rate
```
Where `exchange_rate` represents "units of this currency per 1 USD"

## Current Limitations & Future Work

### Completed ✅
- User authentication flow
- Full CRUD operations on transactions
- Multi-currency support with live rates
- Category auto-save backend logic
- Soft delete functionality
- Session management

### Pending 🚧
- **Category Autocomplete UI**: Backend ready, frontend dropdown not yet built
- **Edit Transaction UI**: Update function exists but no edit form/modal
- **Dashboard/Summary View**: No aggregated spending totals or charts
- **Styling**: Currently unstyled functional HTML
- **Loading States**: Minimal feedback during operations
- **Form Validation**: No validation for empty fields or invalid inputs
- **Error Messages**: Errors logged to console but not shown to users
- **Hard Delete/Purge**: No automated cleanup of soft-deleted records

## Deployment to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add the same environment variables in Vercel's project settings
4. Deploy

## License

MIT

## Author

Built as a mentor-guided hands-on learning project focusing on understanding each concept before implementation.
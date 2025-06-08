
# UC Management System

A comprehensive Utilization Certificate (UC) Management Application for Birla Institute of Technology, Mesra (BIT Mesra) R&D Cell to efficiently manage UC files and related sanction letters organized by financial year.

## 🎯 Features

### Core Functionality
- **UC Entry Management**: Create, edit, and track UC entries with complete metadata
- **File Management**: Upload and manage UC files and sanction letters with organized naming
- **Tracking System**: Monitor UC status (Pending/Submitted/Verified) with date tracking
- **Advanced Filtering**: Filter by funding agency, financial year, PI name, project code, and status
- **Dashboard Analytics**: Overview of total UCs, pending items, and key metrics

### User Interface
- **Professional Design**: Clean, modern interface optimized for administrative use
- **Responsive Layout**: Works seamlessly on desktop and tablet devices
- **Intuitive Navigation**: Easy-to-use forms and data tables
- **Status Indicators**: Color-coded badges for quick status identification

### Security & Access
- **Simple Authentication**: Single admin user login
- **Session Management**: Secure token-based authentication
- **File Security**: Organized file storage with unique naming conventions

## 🏗️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Lucide React** for icons
- **React Router** for navigation

### Backend (Ready for Implementation)
- **PostgreSQL** (local development)
- **Neon/Supabase** (cloud deployment)
- **File Storage** (local/Supabase Storage)

### Deployment
- **Local**: PostgreSQL + Node.js server
- **Cloud**: Vercel + Neon/Supabase

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL (for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd uc-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/uc_management"
   
   # Admin Credentials
   ADMIN_EMAIL="bikkuda@gmail.com"
   ADMIN_PASSWORD="Noida@a07"
   
   # File Storage (for cloud deployment)
   SUPABASE_URL="your-supabase-url"
   SUPABASE_ANON_KEY="your-supabase-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
   
   # App Configuration
   NODE_ENV="development"
   ```

4. **Database Setup** (PostgreSQL)
   ```sql
   -- Create database
   CREATE DATABASE uc_management;
   
   -- Create tables (run the schema from database documentation)
   -- See /docs/database-schema.sql for complete schema
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:8080`

## 📊 Database Schema

### Main Entities

```sql
-- Funding Agencies
CREATE TABLE funding_agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financial Years
CREATE TABLE financial_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year VARCHAR(10) NOT NULL UNIQUE, -- Format: 2024-2025
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Principal Investigators
CREATE TABLE principal_investigators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255),
    department VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- UC Entries
CREATE TABLE uc_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    funding_agency_id UUID REFERENCES funding_agencies(id),
    financial_year_id UUID REFERENCES financial_years(id),
    pi_id UUID REFERENCES principal_investigators(id),
    project_code VARCHAR(100) NOT NULL,
    
    -- File information
    uc_file_name VARCHAR(255) NOT NULL,
    uc_file_path VARCHAR(500) NOT NULL,
    sanction_letter_file_name VARCHAR(255) NOT NULL,
    sanction_letter_path VARCHAR(500) NOT NULL,
    
    -- Tracking fields
    date_received DATE,
    date_given DATE,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Submitted', 'Verified')),
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) DEFAULT 'admin',
    updated_by VARCHAR(255) DEFAULT 'admin'
);
```

## 🔧 Configuration

### Local Development
1. Install PostgreSQL locally
2. Create database and tables using the provided schema
3. Update `.env` with local database credentials
4. Run `npm run dev`

### Cloud Deployment (Vercel + Supabase)
1. Create a Supabase project
2. Set up the database schema in Supabase
3. Configure Supabase Storage for file uploads
4. Deploy to Vercel with environment variables
5. Update `.env` with Supabase credentials

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/
│   │   └── LoginForm.tsx          # Admin authentication
│   ├── dashboard/
│   │   └── Dashboard.tsx          # Main dashboard
│   ├── uc/
│   │   ├── UCList.tsx            # UC listing and filtering
│   │   └── UCForm.tsx            # UC creation and editing
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── database.ts               # Database utilities and types
│   ├── fileStorage.ts            # File upload and management
│   └── utils.ts                  # Utility functions
├── pages/
│   ├── Index.tsx                 # Main entry point
│   └── NotFound.tsx              # 404 page
└── hooks/                        # Custom React hooks
```

## 🔐 Authentication

The system uses a simple authentication mechanism:
- **Email**: bikkuda@gmail.com
- **Password**: Noida@a07

Authentication state is managed via localStorage and can be easily extended for multiple users.

## 📋 Usage Guide

### Adding New UC Entry
1. Login with admin credentials
2. Click "New UC Entry" or navigate to UC Tracker
3. Fill in all required fields:
   - Funding Agency (dropdown)
   - Financial Year (dropdown)
   - PI Name
   - Project Code
   - Upload UC File (PDF)
   - Upload Sanction Letter (PDF)
4. Optionally add tracking dates and status
5. Submit the form

### Managing Existing UCs
1. Go to UC Tracker page
2. Use filters to find specific UCs
3. Click edit button to modify UC details
4. Update tracking information and status
5. Download files as needed

### File Naming Convention
Files are automatically renamed using the pattern:
- UC File: `uc_{pi_name}_{project_code}_{financial_year}_{timestamp}.pdf`
- Sanction Letter: `sanction_{pi_name}_{project_code}_{financial_year}_{timestamp}.pdf`

## 🔄 Future Enhancements

The codebase is structured to easily support:
- **Multiple Admin Users**: Extend authentication system
- **Email Notifications**: Add notification triggers
- **Audit Logging**: Complete history of UC status changes
- **Advanced Reporting**: Generate PDF reports and analytics
- **Bulk Operations**: Import/export functionality
- **API Integration**: RESTful API for external integrations

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env file
   - Ensure database and tables exist

2. **File Upload Issues**
   - Check file permissions in upload directory
   - Verify Supabase storage configuration for cloud
   - Ensure PDF file format

3. **Authentication Problems**
   - Clear localStorage and try again
   - Verify admin credentials in .env file

### Development Tips
- Use browser dev tools to monitor network requests
- Check console for JavaScript errors
- Verify environment variables are loaded correctly

## 📄 License

This project is developed for Birla Institute of Technology, Mesra (BIT Mesra) R&D Cell for internal use.

## 🤝 Support

For technical support or feature requests, please contact the development team or refer to the documentation.

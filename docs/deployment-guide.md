
# Deployment Guide

## Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Git

### Steps

1. **Database Setup**
   ```bash
   # Install PostgreSQL (Ubuntu/Debian)
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   
   # Start PostgreSQL service
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   
   # Create database user
   sudo -u postgres createuser --interactive
   # Choose username: uc_admin
   # Superuser: y
   
   # Create database
   sudo -u postgres createdb uc_management
   
   # Set password
   sudo -u postgres psql
   ALTER USER uc_admin PASSWORD 'your_password';
   \q
   ```

2. **Application Setup**
   ```bash
   # Clone repository
   git clone <repository-url>
   cd uc-management-system
   
   # Install dependencies
   npm install
   
   # Copy environment file
   cp .env.example .env
   
   # Edit .env with your database credentials
   nano .env
   ```

3. **Database Schema**
   ```bash
   # Run database migrations (when implemented)
   npm run migrate
   
   # Or manually run SQL schema
   psql -U uc_admin -d uc_management -f docs/database-schema.sql
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Cloud Deployment (Vercel + Supabase)

### Option 1: Supabase Backend

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Note down URL and API keys

2. **Setup Database Schema**
   ```sql
   -- Run in Supabase SQL Editor
   -- Copy content from docs/database-schema.sql
   ```

3. **Configure Storage**
   ```sql
   -- Create storage bucket
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('uc-files', 'uc-files', false);
   
   -- Set up RLS policies
   CREATE POLICY "Admin can manage files" ON storage.objects
   FOR ALL USING (bucket_id = 'uc-files');
   ```

4. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   vercel
   
   # Add environment variables in Vercel dashboard
   # SUPABASE_URL, SUPABASE_ANON_KEY, etc.
   ```

### Option 2: Neon Backend

1. **Create Neon Database**
   - Go to https://neon.tech
   - Create new project
   - Get connection string

2. **Setup Schema**
   ```bash
   # Connect using provided connection string
   psql "postgresql://username:password@ep-xxx.neon.tech/dbname?sslmode=require"
   
   # Run schema
   \i docs/database-schema.sql
   ```

3. **Deploy to Vercel**
   - Same as Supabase option
   - Use Neon DATABASE_URL

## Production Configuration

### Environment Variables (Vercel)
```bash
# Required for all deployments
DATABASE_URL="your-database-connection-string"
ADMIN_EMAIL="bikkuda@gmail.com"
ADMIN_PASSWORD="Noida@a07"
NODE_ENV="production"

# For Supabase
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
STORAGE_TYPE="supabase"

# Security
JWT_SECRET="secure-random-string-32-chars+"
```

### Database Optimization

1. **Indexes**
   ```sql
   -- Add indexes for better performance
   CREATE INDEX idx_uc_entries_funding_agency ON uc_entries(funding_agency_id);
   CREATE INDEX idx_uc_entries_financial_year ON uc_entries(financial_year_id);
   CREATE INDEX idx_uc_entries_pi ON uc_entries(pi_id);
   CREATE INDEX idx_uc_entries_status ON uc_entries(status);
   CREATE INDEX idx_uc_entries_created_at ON uc_entries(created_at);
   ```

2. **Backup Strategy**
   ```bash
   # For Supabase - automated backups included
   # For Neon - automated backups included
   # For self-hosted PostgreSQL
   pg_dump -h localhost -U uc_admin uc_management > backup_$(date +%Y%m%d).sql
   ```

## Monitoring & Maintenance

### Health Checks
- Database connectivity
- File storage accessibility
- Application responsiveness

### Logs
- Application logs via Vercel
- Database logs via provider dashboard
- File upload/download logs

### Updates
```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm update

# Run migrations
npm run migrate

# Deploy
vercel --prod
```

## Troubleshooting

### Common Issues

1. **Database Connection Timeout**
   - Check connection string format
   - Verify network connectivity
   - Check database server status

2. **File Upload Failures**
   - Verify storage bucket permissions
   - Check file size limits
   - Validate file types

3. **Authentication Issues**
   - Clear browser cache/localStorage
   - Verify environment variables
   - Check admin credentials

### Performance Optimization

1. **Database**
   - Add appropriate indexes
   - Optimize queries
   - Regular maintenance

2. **Frontend**
   - Enable gzip compression
   - Optimize images
   - Use CDN for static assets

3. **File Storage**
   - Implement file compression
   - Use appropriate file formats
   - Clean up old files periodically

## Security Considerations

1. **Database Security**
   - Use strong passwords
   - Enable SSL connections
   - Regular security updates

2. **File Security**
   - Validate file types
   - Scan for malware
   - Implement access controls

3. **Application Security**
   - Regular dependency updates
   - Input validation
   - Error handling

## Backup & Recovery

### Automated Backups
- Database: Provider-managed
- Files: Regular Supabase/cloud backups
- Configuration: Version control

### Recovery Procedures
1. Database restore from backup
2. File restoration from storage backup
3. Application redeployment from Git

### Testing Recovery
- Regular backup testing
- Recovery procedure validation
- Disaster recovery planning

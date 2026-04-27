# Deployment Guide

This guide covers deploying the Admin Dashboard to production environments.

---

## 📋 Pre-Deployment Checklist

- [ ] All tests passing (`npm run test`)
- [ ] No console errors or warnings
- [ ] Environment variables configured
- [ ] Database backups configured
- [ ] SSL/HTTPS certificate ready
- [ ] Domain name configured
- [ ] Monitoring and logging set up

---

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended for React)

**Advantages:**
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Free tier available
- Automatic deployments from Git

**Steps:**

1. **Create Vercel account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Connect repository**
   - Click "New Project"
   - Select your GitHub repository
   - Vercel auto-detects it's a Vite project

3. **Configure build settings**
   - Build Command: `npm run build --prefix client`
   - Output Directory: `client/dist`
   - Root Directory: `.`

4. **Set environment variables**
   - Add `VITE_API_BASE_URL=https://your-api-domain.com`

5. **Deploy**
   - Click "Deploy"
   - Vercel automatically deploys on every push to main

**Access:** Your app will be available at `your-project.vercel.app`

---

### Option 2: Netlify

**Steps:**

1. **Build the frontend**
```bash
cd client
npm run build
```

2. **Connect to Netlify**
   - Go to https://netlify.com
   - Click "New site from Git"
   - Select your repository

3. **Configure build settings**
   - Build Command: `npm run build --prefix client`
   - Publish Directory: `client/dist`

4. **Deploy**
   - Netlify automatically deploys

---

### Option 3: AWS S3 + CloudFront

**Steps:**

1. **Build the frontend**
```bash
cd client
npm run build
```

2. **Create S3 bucket**
```bash
aws s3 mb s3://your-bucket-name
```

3. **Upload files**
```bash
aws s3 sync client/dist s3://your-bucket-name --delete
```

4. **Create CloudFront distribution**
   - Point to S3 bucket
   - Enable HTTPS
   - Set cache policies

5. **Configure domain**
   - Point domain to CloudFront distribution

---

### Option 4: GitHub Pages

**Steps:**

1. **Update vite.config.js**
```javascript
export default defineConfig({
  base: '/admin-dashboard/',
  // ... rest of config
})
```

2. **Build and deploy**
```bash
cd client
npm run build
git add dist
git commit -m "Deploy to GitHub Pages"
git push
```

---

## 🖥️ Backend Deployment

### Option 1: Heroku (Easiest)

**Advantages:**
- Simple deployment
- Automatic HTTPS
- Free tier available
- Easy environment variables

**Steps:**

1. **Create Heroku account**
   - Go to https://heroku.com
   - Sign up

2. **Install Heroku CLI**
```bash
npm install -g heroku
heroku login
```

3. **Create Heroku app**
```bash
heroku create your-app-name
```

4. **Set environment variables**
```bash
heroku config:set MONGO_URI=mongodb+srv://...
heroku config:set JWT_SECRET=your-secret-key
heroku config:set NODE_ENV=production
```

5. **Deploy**
```bash
git push heroku main
```

6. **View logs**
```bash
heroku logs --tail
```

**Access:** Your API will be available at `https://your-app-name.herokuapp.com`

---

### Option 2: DigitalOcean App Platform

**Steps:**

1. **Create DigitalOcean account**
   - Go to https://digitalocean.com
   - Sign up

2. **Create new app**
   - Click "Create" → "Apps"
   - Connect GitHub repository
   - Select `server` directory

3. **Configure environment**
   - Add environment variables
   - Set build command: `npm install`
   - Set run command: `npm start`

4. **Deploy**
   - Click "Deploy"

---

### Option 3: AWS EC2

**Steps:**

1. **Launch EC2 instance**
   - Choose Ubuntu 22.04 LTS
   - t3.micro (free tier eligible)
   - Configure security groups (allow ports 80, 443, 3001)

2. **SSH into instance**
```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

3. **Install dependencies**
```bash
sudo apt update
sudo apt install nodejs npm nginx
```

4. **Clone repository**
```bash
git clone https://github.com/yourusername/admin-dashboard.git
cd admin-dashboard/server
npm install
```

5. **Configure environment**
```bash
cp .env.example .env
nano .env  # Edit with your values
```

6. **Install PM2 (process manager)**
```bash
sudo npm install -g pm2
pm2 start server.js --name "admin-dashboard"
pm2 startup
pm2 save
```

7. **Configure Nginx reverse proxy**
```bash
sudo nano /etc/nginx/sites-available/default
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

8. **Enable HTTPS with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

9. **Restart Nginx**
```bash
sudo systemctl restart nginx
```

---

### Option 4: Railway

**Steps:**

1. **Create Railway account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create new project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"

3. **Configure**
   - Select your repository
   - Railway auto-detects Node.js
   - Add environment variables

4. **Deploy**
   - Railway automatically deploys

---

## 🗄️ Database Deployment

### MongoDB Atlas (Recommended)

**Steps:**

1. **Create account**
   - Go to https://mongodb.com/cloud/atlas
   - Sign up

2. **Create cluster**
   - Click "Create a Deployment"
   - Choose free tier
   - Select region closest to your users

3. **Create database user**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Save username and password

4. **Get connection string**
   - Go to "Databases"
   - Click "Connect"
   - Copy connection string
   - Replace `<username>` and `<password>`

5. **Whitelist IP addresses**
   - Go to "Network Access"
   - Click "Add IP Address"
   - For development: Add your IP
   - For production: Add your server IP or use 0.0.0.0/0 (less secure)

6. **Use in .env**
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/admin-dashboard?retryWrites=true&w=majority
```

---

## 🔒 Security Checklist

- [ ] Use HTTPS/SSL everywhere
- [ ] Set strong JWT_SECRET (minimum 32 characters)
- [ ] Enable MongoDB authentication
- [ ] Whitelist IP addresses in MongoDB
- [ ] Use environment variables for secrets
- [ ] Never commit .env to version control
- [ ] Enable CORS only for your domain
- [ ] Set NODE_ENV=production
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerts
- [ ] Regular security updates
- [ ] Database backups configured

---

## 📊 Monitoring & Logging

### Application Monitoring

**Option 1: PM2 Plus**
```bash
pm2 plus
```

**Option 2: New Relic**
```bash
npm install newrelic
```

**Option 3: Datadog**
```bash
npm install dd-trace
```

### Error Tracking

**Option 1: Sentry**
```bash
npm install @sentry/node
```

**Option 2: Rollbar**
```bash
npm install rollbar
```

### Logging

**Option 1: Winston**
```bash
npm install winston
```

**Option 2: Pino**
```bash
npm install pino
```

---

## 🚀 Deployment Workflow

### Development
```bash
npm run dev
```

### Staging
```bash
npm run build
npm run test
# Deploy to staging environment
```

### Production
```bash
npm run build
npm run test
# Run security checks
# Deploy to production
```

---

## 🔄 Continuous Deployment (CI/CD)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '24'
      - run: npm run install:all
      - run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: "your-app-name"
          heroku_email: "your-email@example.com"
```

---

## 📈 Performance Optimization

### Frontend
- Enable gzip compression
- Use CDN for static assets
- Implement lazy loading
- Optimize images
- Minify CSS/JS

### Backend
- Enable caching headers
- Use database indexes
- Implement pagination
- Use connection pooling
- Monitor query performance

### Database
- Create indexes on frequently queried fields
- Archive old data
- Regular backups
- Monitor disk usage

---

## 🆘 Troubleshooting

### Frontend not loading
- Check CORS settings
- Verify API URL in environment variables
- Check browser console for errors

### Backend not responding
- Check server logs
- Verify database connection
- Check firewall rules
- Verify environment variables

### Database connection failed
- Check MongoDB URI
- Verify IP whitelist
- Check database user credentials
- Verify network connectivity

### HTTPS certificate issues
- Renew certificate before expiry
- Check certificate configuration
- Verify domain DNS settings

---

## 📞 Support

For deployment issues:
1. Check application logs
2. Review error messages
3. Verify environment variables
4. Check database connectivity
5. Review security settings

---

## 🎯 Next Steps

1. Choose your deployment platform
2. Follow the platform-specific steps
3. Configure environment variables
4. Set up monitoring and logging
5. Test the deployment
6. Configure backups
7. Set up CI/CD pipeline

**Happy deploying!** 🚀

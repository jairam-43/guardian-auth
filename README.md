# Guardian Auth

**Your Identity, Secured Without Passwords**

A Security-as-a-Service graphical authentication platform that eliminates passwords using visual pattern recognition, emoji-based authentication, and advanced security features.

## 🚀 Features

- **🔐 Passwordless Authentication**: No more forgotten passwords with visual emoji patterns
- **🛡️ Advanced Security**: Device fingerprinting, geo-location tracking, behavioral biometrics
- **🤖 Bot Detection**: AI-powered analysis prevents automated attacks
- **📊 Real-time Dashboard**: Monitor security threats and user activity
- **🔌 Easy Integration**: Simple JavaScript widget for any website
- **🌍 Multi-factor Support**: OTP verification with 60-second expiry
- **📱 Responsive Design**: Works seamlessly on all devices

## 🏗️ Architecture

```
guardian-auth/
├── backend/                 # Node.js/Express API server
│   ├── server.js           # Main server file
│   ├── routes/             # API endpoints
│   ├── services/           # Business logic
│   └── package.json
├── frontend/               # React/Vite frontend
│   ├── src/
│   │   ├── pages/          # React pages
│   │   ├── components/     # Reusable components
│   │   └── styles/         # CSS/Tailwind styles
│   └── package.json
└── widget/                 # Standalone JavaScript widget
    ├── guardian-widget.js  # Main widget file
    └── README.md
```

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **Supabase** for database and authentication
- **JWT** for session management
- **bcryptjs** for password hashing
- **Axios** for HTTP requests
- **Resend** for email services

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Recharts** for data visualization
- **Lucide React** for icons

### Security Features
- **DPPG (Dynamic Pattern Password Grid)**: Visual authentication system
- **Risk Scoring**: Real-time threat assessment
- **Device Fingerprinting**: Hardware and browser identification
- **Geo-location Security**: Location-based anomaly detection
- **Behavioral Biometrics**: Click pattern analysis

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Supabase account and project set up
- Git for cloning

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd guardian-auth

# Install dependencies for both backend and frontend
cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment Configuration

The backend `.env` file is already configured with your Supabase credentials:

```env
SUPABASE_URL=https://kuikqxvdepkmhrbmpvvf.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
PORT=5000
JWT_SECRET=guardian_auth_super_secret_jwt_2026
```

### 3. Database Setup

Ensure your Supabase database has the following tables (already created):

- `users` - User accounts and authentication data
- `secret_images` - User's secret emoji hashes
- `dppg_rules` - Dynamic pattern rules
- `sessions` - Active authentication sessions
- `device_fingerprints` - Device recognition data
- `login_audit` - Security audit logs
- `connected_apps` - Third-party app integrations

### 4. Run the Application

```bash
# Terminal 1: Start Backend Server
cd D:/project/guardian-auth/backend
npm install
node server.js

# Terminal 2: Start Frontend Development Server
cd D:/project/guardian-auth/frontend
npm install
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 📱 Usage

### For End Users

1. **Registration**: Choose 5 secret emojis as your visual password
2. **Login**: Enter email and select emojis based on dynamic pattern rules
3. **Verification**: Complete OTP verification sent to email
4. **Dashboard**: Monitor account security and activity

### For Developers

1. **Register App**: Get API credentials from developer portal
2. **Integrate Widget**: Add the Guardian Auth widget to your website
3. **Customize Theme**: Match your brand colors and style
4. **Monitor Analytics**: Track authentication success rates and security

### For Administrators

1. **Admin Dashboard**: Monitor all user activity and security threats
2. **Risk Management**: View risk scores and suspicious activities
3. **Audit Logs**: Export and analyze authentication attempts
4. **Geo Analytics**: Monitor login locations and patterns

## 🔌 Widget Integration

Add Guardian Auth to any website in minutes:

```html
<!-- Step 1: Add the script -->
<script src="https://guardian-auth.vercel.app/widget.js"></script>

<!-- Step 2: Add the login button -->
<guardian-login app-id="your-app-id" theme-color="#4f8ef7"></guardian-login>

<!-- Step 3: Listen for success -->
<script>
  document.addEventListener('guardian-auth-success', function(e) {
    console.log('User verified:', e.detail.token);
    // Redirect or update your UI
  });
</script>
```

## 🔒 Security Features

### Visual Authentication
- **25-emoji grid** with random shuffling
- **5 secret emojis** per user
- **Dynamic pattern rules** (sequential, reverse, diagonal, etc.)
- **Anti-shoulder surfing** with blur protection

### Advanced Protection
- **Risk scoring** (0-100) with real-time assessment
- **Device fingerprinting** for trusted device recognition
- **Geo-location tracking** with anomaly detection
- **Behavioral biometrics** for bot detection
- **Rate limiting** and account lockout protection

### Data Protection
- **SHA-256 hashing** for secret images
- **JWT tokens** with secure expiration
- **Encrypted communication** with HTTPS
- **GDPR compliant** data handling

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/start-session` - Begin authentication
- `POST /api/auth/verify-images` - Verify emoji selection
- `POST /api/auth/verify-otp` - Complete authentication
- `POST /api/auth/logout` - End session

### Management
- `GET /api/dashboard/stats` - System statistics
- `GET /api/dashboard/audit-log` - Security logs
- `POST /api/widget/register-app` - Register new app
- `GET /api/session/active/:userId` - Active sessions

## 🎨 Design System

### Colors
- **Primary**: #4f8ef7 (Electric Blue)
- **Background**: #0a0a0f (Dark)
- **Cards**: #1a1a2e (Dark Blue)
- **Success**: #22c55e (Green)
- **Warning**: #eab308 (Yellow)
- **Danger**: #ef4444 (Red)

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: 700 weight
- **Body**: 400 weight

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: [guardian-auth.vercel.app](https://guardian-auth.vercel.app)
- **Issues**: GitHub Issues
- **Email**: support@guardian-auth.com

## 🎯 Roadmap

- [ ] Mobile app (iOS/Android)
- [ ] Biometric authentication support
- [ ] Advanced analytics dashboard
- [ ] Enterprise SSO integration
- [ ] Multi-language support
- [ ] Hardware security key support

---

**Guardian Auth** - Your Identity, Secured Without Passwords 🔐

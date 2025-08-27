# Used Shoes Business Tracker

A modern, single-page web application for managing used shoes import/export business operations with real-time analytics and cloud-based data persistence.

## 🚀 Features

### Core Functionality
- **Product Management** - Track inventory, costs, and stock levels
- **Container Management** - Monitor import shipments and costs
- **Sales Tracking** - Record transactions with automatic profit calculations
- **Expense Management** - Categorized expense tracking with detailed reporting
- **Analytics Dashboard** - Real-time KPIs and business insights
- **Profit & Loss Reports** - Professional income statements with date filtering
- **Data Export** - Export reports to CSV/Excel format
- **Cloud Sync** - GitHub-based data persistence for secure backups

### Recent UI/UX Enhancements
- Modern icon system using Lucide React
- Professional animated modals with backdrop blur
- Consistent typography and spacing throughout
- Enhanced data visualizations with Recharts
- Mobile-responsive design with touch optimization
- Custom confirmation dialogs replacing browser alerts

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + Headless UI
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form
- **Data Storage**: GitHub API
- **Deployment**: GitHub Pages

## 🏃 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- GitHub account with personal access token

### Installation

```bash
# Clone the repository
git clone https://github.com/wissamyah/usedshoes.git
cd usedshoes

# Install dependencies
npm install

# Start development server
npm run dev
```

### Configuration

1. Create a GitHub personal access token with `repo` permissions
2. Navigate to Settings page in the app
3. Enter your GitHub repository details and token
4. Test connection and save configuration

## 🎯 Usage

### Quick Start
1. **Add Containers** - Record import shipments with products and costs
2. **Track Sales** - Record daily sales with automatic stock management
3. **Log Expenses** - Categorize business expenses for accurate P&L
4. **View Reports** - Monitor business performance with real-time analytics

### Key Features

#### Container Management
- Track multiple products per container
- Weighted average cost calculations
- Stock integrity validation
- Purchase history tracking

#### Sales Operations
- Quick product selection with stock validation
- Automatic profit calculations
- Sales history with search and filtering
- Prevention of overselling

#### Analytics & Reports
- Real-time dashboard with KPIs
- Interactive charts and visualizations
- Professional income statements
- CSV/Excel export functionality

## 📦 Project Structure

```
src/
├── components/     # React components
├── context/        # Global state management
├── hooks/          # Custom React hooks
├── services/       # API and data services
├── utils/          # Utility functions
└── styles/         # CSS and styling
```

## 🔄 Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🚢 Deployment

The application is configured for GitHub Pages deployment:

1. Update `base` in `vite.config.js` with your repository name
2. Build the application: `npm run build`
3. Deploy to GitHub Pages (automated via GitHub Actions)

## 📊 Data Model

The application uses a structured JSON format for data storage:
- **Products**: Inventory items with stock and cost tracking
- **Containers**: Import shipments with product associations
- **Sales**: Transactions with profit calculations
- **Expenses**: Categorized business costs

## 🔒 Security

- GitHub token encryption using Web Crypto API
- Secure data storage in private GitHub repositories
- No sensitive data stored locally
- HTTPS-only connections

## 🤝 Contributing

This is a private business application. For issues or feature requests, please contact the repository owner.

## 📝 License

Proprietary - All rights reserved

## 👨‍💻 Development Status

**Current Version**: 1.0.0  
**Last Updated**: August 27, 2025  
**Status**: Production Ready

---

For detailed development documentation, see [PROJECT_ROADMAP.md](PROJECT_ROADMAP.md)
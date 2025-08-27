# 📋 Used Shoes Business Tracker - Complete Project Roadmap

## 📖 Table of Contents
1. [Project Overview](#-project-overview)
2. [Tech Stack & Dependencies](#-tech-stack--dependencies)
3. [Development Environment Setup](#-development-environment-setup)
4. [Project File Structure](#-project-file-structure)
5. [Phase 1: Foundation Setup](#-phase-1-foundation-setup-day-1-2)
6. [Phase 2: Core Features](#-phase-2-core-features-day-3-5)
7. [Phase 3: Analytics & Reports](#-phase-3-analytics--reports-day-6-7)
8. [Phase 4: Polish & Deploy](#-phase-4-polish--deploy-day-8)
9. [GitHub API Integration Guide](#-github-api-integration-guide)
10. [Data Model Reference](#-data-model-reference)
11. [Testing Checklist](#-testing-checklist)
12. [Deployment Guide](#-deployment-guide)
13. [Troubleshooting](#-troubleshooting)

---

## 🎯 Project Overview

**Goal:** Build a single-page web application for tracking used shoes business operations with GitHub-based data persistence.

### Core Requirements
- ✅ Single-page React application
- ✅ Track products, containers, sales, expenses
- ✅ Generate P&L reports and analytics
- ✅ Export data to Excel format
- ✅ GitHub repository for data persistence
- ✅ Responsive design for mobile/desktop
- ✅ Deploy on GitHub Pages

### Business Logic
- **Containers** → Import batches with multiple products
- **Products** → Individual items linked to containers
- **Sales** → Daily transactions that reduce inventory
- **Expenses** → Business costs by category
- **P&L** → Revenue - COGS - Expenses = Net Profit

---

## 🛠 Tech Stack & Dependencies

### Core Framework
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Headless UI** - Accessible UI components

### Icon & UI Libraries
- **Lucide React v0.542.0** - Modern icon library (replaced Hero Icons)
- **React Portals** - Optimized modal rendering

### Additional Libraries
- **Recharts** - Charts and graphs
- **React Hook Form** - Form validation
- **Date-fns** - Date manipulation
- **SheetJS (xlsx)** - Excel export

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **PostCSS** - CSS processing

---

## 🚀 Development Environment Setup

### Step 1: Initialize Project
```bash
# Create new Vite React project
npm create vite@latest . -- --template react
npm install
```

### Step 2: Install Dependencies
```bash
# Core dependencies
npm install @headlessui/react lucide-react
npm install recharts react-hook-form date-fns xlsx

# Development dependencies  
npm install -D tailwindcss postcss autoprefixer
npm install -D eslint prettier eslint-config-prettier
```

### Step 3: Configure Tailwind
```bash
npx tailwindcss init -p
```

### Step 4: Setup GitHub Repository
- [ ] Create private GitHub repository
- [ ] Generate Personal Access Token with repo permissions
- [ ] Clone repository to local machine
- [ ] Verify write access

**Validation:** ✅ `npm run dev` starts development server successfully

---

## 📁 Project File Structure

```
usedshoes/
├── 📄 PROJECT_ROADMAP.md          # This file
├── 📄 README.md                   # Project documentation
├── 📄 package.json               # Dependencies
├── 📄 vite.config.js             # Vite configuration
├── 📄 tailwind.config.js         # Tailwind configuration
├── 📄 .gitignore                 # Git ignore rules
├── 📁 public/
│   ├── 📄 index.html             # HTML template
│   └── 🖼 favicon.ico            # Site favicon
└── 📁 src/
    ├── 📄 main.jsx               # React entry point
    ├── 📄 App.jsx                # Main app component
    ├── 📄 index.css              # Global styles
    ├── 📁 components/
    │   ├── 📁 Layout/
    │   │   ├── 📄 Header.jsx         # App header with nav
    │   │   ├── 📄 Navigation.jsx     # Navigation menu
    │   │   └── 📄 Layout.jsx         # Main layout wrapper
    │   ├── 📁 Dashboard/
    │   │   ├── 📄 Dashboard.jsx      # Dashboard main page
    │   │   ├── 📄 KPICards.jsx       # Key metrics display
    │   │   ├── 📄 SalesChart.jsx     # Sales trend chart
    │   │   ├── 📄 ExpenseChart.jsx   # Expense breakdown
    │   │   └── 📄 TopProductsChart.jsx # Best sellers
    │   ├── 📁 Products/
    │   │   ├── 📄 ProductsPage.jsx   # Products main page
    │   │   ├── 📄 ProductList.jsx    # Product listing
    │   │   ├── 📄 ProductForm.jsx    # Add/edit product form
    │   │   └── 📄 ProductCard.jsx    # Individual product display
    │   ├── 📁 Containers/
    │   │   ├── 📄 ContainersPage.jsx # Containers main page
    │   │   ├── 📄 ContainerList.jsx  # Container listing
    │   │   ├── 📄 ContainerForm.jsx  # Add/edit container form
    │   │   └── 📄 ContainerDetails.jsx # Container details view
    │   ├── 📁 Sales/
    │   │   ├── 📄 SalesPage.jsx      # Sales main page
    │   │   ├── 📄 SalesForm.jsx      # Quick sales entry
    │   │   ├── 📄 SalesHistory.jsx   # Sales history table
    │   │   └── 📄 SalesRow.jsx       # Individual sale row
    │   ├── 📁 Expenses/
    │   │   ├── 📄 ExpensesPage.jsx   # Expenses main page
    │   │   ├── 📄 ExpenseForm.jsx    # Add expense form
    │   │   ├── 📄 ExpenseHistory.jsx # Expense history
    │   │   └── 📄 ExpenseFilters.jsx # Filter controls
    │   ├── 📁 Reports/
    │   │   ├── 📄 ReportsPage.jsx    # Reports main page
    │   │   ├── 📄 ProfitLoss.jsx     # P&L statement
    │   │   ├── 📄 ReportFilters.jsx  # Date/product filters
    │   │   └── 📄 ExportButton.jsx   # Excel export button
    │   ├── 📁 Settings/
    │   │   ├── 📄 SettingsPage.jsx   # Settings main page
    │   │   └── 📄 GitHubSettings.jsx # GitHub configuration
    │   └── 📁 UI/
    │       ├── 📄 Modal.jsx          # Enhanced modal with animations & blur
    │       ├── 📄 ConfirmModal.jsx   # Custom confirmation dialog
    │       ├── 📄 Notifications.jsx  # Toast notification system
    │       ├── 📄 LoadingSpinner.jsx # Loading indicators & overlays
    │       ├── 📄 ErrorBoundary.jsx  # Error handling wrapper
    │       ├── 📄 ResponsiveContainer.jsx # Responsive utilities
    │       ├── 📄 OptimizedComponents.jsx # Performance components
    │       └── 📄 MobileTable.jsx    # Mobile-optimized tables
    ├── 📁 services/
    │   ├── 📄 githubApi.js           # GitHub API calls
    │   ├── 📄 dataService.js         # Data operations
    │   └── 📄 exportService.js       # Excel export logic
    ├── 📁 hooks/
    │   ├── 📄 useData.js             # Data CRUD operations
    │   ├── 📄 useGitHub.js           # GitHub integration
    │   ├── 📄 useProfitLoss.js       # P&L calculations
    │   └── 📄 useLocalStorage.js     # Local storage utilities
    ├── 📁 utils/
    │   ├── 📄 calculations.js        # Business calculations
    │   ├── 📄 dateUtils.js           # Date formatting/parsing
    │   ├── 📄 validation.js          # Form validation rules
    │   └── 📄 encryption.js          # Token encryption
    ├── 📁 constants/
    │   └── 📄 index.js               # App constants
    └── 📁 context/
        ├── 📄 DataContext.jsx        # Global data state
        ├── 📄 GitHubContext.jsx      # GitHub connection state
        └── 📄 UIContext.jsx          # UI state (modals, loading)
```

---

## 🏗 Phase 1: Foundation Setup (Day 1-2)

### 1.1 Project Initialization ✅ COMPLETED
- [x] Create Vite React project
- [x] Install all required dependencies  
- [x] Configure Tailwind CSS v4 with CSS-first approach
- [x] Setup ESLint and Prettier
- [x] Create basic file structure

**Time Estimate:** 2 hours ✅ **COMPLETED**

### 1.2 Basic Layout & Navigation ✅ COMPLETED
- [x] Create `Layout.jsx` with header and main content area
- [x] Implement `Header.jsx` with sync status and navigation
- [x] Create `Navigation.jsx` with tab-based navigation
- [x] Setup responsive design breakpoints
- [x] Add basic styling and theme colors

**Components to Create:**
```jsx
// src/components/Layout/Layout.jsx
// src/components/Layout/Header.jsx
// src/components/Layout/Navigation.jsx
```

**Validation:** ✅ Navigation works, responsive design looks good on mobile/desktop

### 1.3 Context Setup ✅ COMPLETED
- [x] Create `DataContext.jsx` for global state management
- [x] Create `GitHubContext.jsx` for GitHub integration  
- [x] Create `UIContext.jsx` for loading/modal states
- [x] Create `AppProvider.jsx` combining all contexts
- [x] Implement context providers in `App.jsx`
- [x] Add notification system with toast messages
- [x] Connect Layout component to all contexts

**Time Estimate:** 3 hours ✅ **COMPLETED**

### 1.4 GitHub API Foundation ✅ COMPLETED
- [x] Create `services/githubApi.js` with basic functions:
  - `testConnection(owner, repo, token)`
  - `fetchData(owner, repo, token, fileName)`
  - `updateData(owner, repo, token, fileName, data, message)`
- [x] Implement token encryption in `utils/encryption.js`
- [x] Create GitHub settings page for configuration
- [x] Test GitHub API connection

**Validation:** ✅ Can connect to GitHub repo and fetch/update files

**Time Estimate:** 4 hours ✅ **COMPLETED**

---

## 🔧 Phase 2: Core Features (Day 3-5)

### 2.1 Data Model & Service Layer ✅ COMPLETED
- [x] Create `services/dataService.js` with CRUD operations
- [x] Implement data structure validation
- [x] Create `hooks/useData.js` for React integration
- [x] Setup auto-incrementing ID system
- [x] Implement data relationships (products ↔ containers)

**Data Operations Implemented:**
- `addProduct(productData)`
- `updateProduct(id, productData)`
- `deleteProduct(id)`
- `addContainer(containerData)`
- `addSale(saleData)` (with stock reduction)
- `addExpense(expenseData)`

**Time Estimate:** 4 hours ✅ **COMPLETED**

### 2.2 Products & Containers Management ✅ COMPLETED  
- [x] Create `ProductsPage.jsx` with CRUD interface
- [x] Implement `ProductForm.jsx` with validation
- [x] Create `ProductList.jsx` with search/filter
- [x] Build `ContainersPage.jsx` with container management
- [x] Implement `ContainerForm.jsx` with product selection and cost override logic
- [x] Create `ContainerDetails.jsx` showing purchase costs and products
- [x] Implement weighted average cost calculation for existing stock
- [x] Add individual container purchase cost tracking

**Business Logic Implemented:**
- **Product:** Name, Category (Shoes/Belts/Bags), Stock (bags), Cost Per Kg, Bag Weight (20kg/25kg), Description
- **Container:** ID, Supplier, Purchase Date, Invoice #, Shipping Cost, Products[] with individual purchase costs
- **Cost Management:** 
  - Zero stock: new cost overrides existing cost
  - Existing stock: weighted average cost calculation
  - Individual container purchase tracking for cost history

**Validation:** ✅ Can add/edit/delete products and containers, stock updates correctly, cost calculations work

**Time Estimate:** 8 hours ✅ **100% COMPLETED**

### 2.3 Sales Management ✅ COMPLETED
- [x] Create `SalesPage.jsx` with quick sales entry
- [x] Implement `SalesForm.jsx` with product selection
- [x] Build `SalesHistory.jsx` with date filtering
- [x] Add stock validation (prevent overselling)
- [x] Implement sales editing/deletion
- [x] Add daily sales summary
- [x] Fix profit calculation (cost per kg × bag weight × quantity)

**Features Implemented:**
- Quick product lookup/selection with stock availability
- Automatic stock deduction and restoration
- Sales history with search, filtering, and sorting
- Daily/monthly sales summaries and KPIs
- Real-time profit calculation with cost breakdown
- Stock validation prevents overselling
- Edit/delete functionality with proper stock adjustments

**Validation:** ✅ Sales reduce stock correctly, profit calculations accurate, history displays properly

**Time Estimate:** 5 hours ✅ **COMPLETED**

### 2.4 Expense Tracking ✅ COMPLETED
- [x] Create `ExpensesPage.jsx` with expense entry
- [x] Implement `ExpenseForm.jsx` with categories
- [x] Build `ExpenseHistory.jsx` with filtering
- [x] Add expense categories (Transport, Rent, Staff, Misc, Marketing, Utilities)
- [x] Implement date range filtering with quick filter buttons
- [x] Add expense editing/deletion functionality

**Features Implemented:**
- Comprehensive expense dashboard with daily/monthly/total stats
- Category breakdown showing spending by category
- Full-featured expense entry form with validation
- Advanced filtering: search, category, date range, sorting
- Quick filter buttons (Today, This Month, Last Month)
- Edit/delete functionality with confirmation dialogs
- Container ID linking for expense tracking to specific shipments
- Real-time expense totals and statistics

**Expense Categories:**
- Transport
- Rent
- Staff Salaries
- Miscellaneous
- Marketing
- Utilities

**Validation:** ✅ Expenses are properly categorized, filtered, and calculations are accurate

**Time Estimate:** 4 hours ✅ **COMPLETED**

---

## 📊 Phase 3: Analytics & Reports ✅ COMPLETED

### 3.1 Dashboard Implementation ✅ COMPLETED
- [x] Create `Dashboard.jsx` as main landing page
- [x] Implement `KPICards.jsx` with key metrics:
  - Today's sales revenue
  - This month's sales
  - Current inventory value
  - Net profit this month
- [x] Add loading states and error handling
- [x] Implement real-time updates when data changes
- [x] Add business summary, all-time performance, and monthly metrics
- [x] Include low stock alerts and recent activity feeds

**Features Implemented:**
- Comprehensive KPI dashboard with 4 main metrics
- Secondary stats showing business summary and all-time performance
- Low stock alerts for products with less than 10 bags
- Recent sales and expenses activity feeds
- Real-time calculations based on current data

**Time Estimate:** 3 hours ✅ **COMPLETED**

### 3.2 Charts & Visualizations ✅ COMPLETED
- [x] Install and configure Recharts
- [x] Create `SalesChart.jsx` (line chart for sales trends)
- [x] Build `ExpenseChart.jsx` (pie/bar chart for expense breakdown)
- [x] Implement `TopProductsChart.jsx` (horizontal bar chart for best sellers)
- [x] Add interactive chart features (tooltips, legends, responsive design)
- [x] Make charts responsive for mobile

**Chart Types Implemented:**
- **Sales Trend**: Line chart showing revenue and profit over last 30 days
- **Expense Breakdown**: Switchable pie/bar chart by category with percentages
- **Top Products**: Horizontal bar chart by quantity sold with detailed table
- **Interactive Features**: Tooltips, legends, hover effects, responsive containers

**Validation:** ✅ Charts display correct data, update dynamically, and are fully responsive

**Time Estimate:** 4 hours ✅ **COMPLETED**

### 3.3 Profit & Loss Calculations ✅ COMPLETED
- [x] Create `utils/calculations.js` with comprehensive P&L logic
- [x] Implement `hooks/useProfitLoss.js` for real-time calculations
- [x] Build `ProfitLoss.jsx` component showing:
  - Sales Revenue
  - Cost of Goods Sold (COGS)
  - Gross Profit
  - Total Expenses
  - Net Profit
- [x] Add date range filtering for P&L with preset and custom ranges
- [x] Show profit margins and percentages
- [x] Add performance indicators and detailed breakdowns
- [x] Include current assets and expense/product analysis

**P&L Calculations Implemented:**
```javascript
COGS = Sum(product.costPerUnit * sale.quantity)
Gross Profit = Total Sales Revenue - COGS
Net Profit = Gross Profit - Total Expenses
Gross Margin = (Gross Profit / Revenue) * 100
Net Margin = (Net Profit / Revenue) * 100
```

**Advanced Features:**
- Date range filtering with quick presets (Today, This Month, Last Month, etc.)
- Performance indicators based on profitability
- Detailed expense breakdown by category
- Top products analysis by revenue
- Current assets calculation including inventory value

**Time Estimate:** 3 hours ✅ **COMPLETED**

### 3.4 Excel Export Functionality ✅ COMPLETED
- [x] Implement CSV export functionality (Excel alternative)
- [x] Create `ExportButton.jsx` component
- [x] Implement export functions:
  - `exportProfitLoss(dateRange)` - Full P&L statement with sales and expenses
  - `exportSales(dateRange)` - Detailed sales report
  - `exportExpenses(dateRange)` - Detailed expenses report
- [x] Add export buttons to reports page
- [x] Format CSV files with proper headers and data structure
- [x] Include date range filtering in exports

**Export Features Implemented:**
- CSV format exports (compatible with Excel)
- Date range filtering for all exports
- Comprehensive P&L export with sales and expenses details
- Proper formatting with headers and totals
- Automatic filename generation with date ranges
- Loading states and success/error notifications

**Validation:** ✅ CSV files export correctly with properly formatted data and can be opened in Excel

**Time Estimate:** 3 hours ✅ **COMPLETED**

---

## 🎨 Phase 4: Polish & Deploy (Day 8) ✅ COMPLETED

### 4.1 Error Handling & Validation ✅ COMPLETED
- [x] Add form validation to all forms
- [x] Implement error boundaries for React components  
- [x] Add user-friendly error messages
- [x] Handle GitHub API errors gracefully
- [x] Add loading states throughout the app
- [x] Implement data validation before saves
- [x] **CRITICAL FIX:** Container stock management for delete/edit operations

**Error Scenarios Handled:**
- GitHub API rate limits, timeouts, and network issues
- Invalid form data with detailed validation messages
- Missing required fields with inline error display
- Container deletion conflicts with stock integrity
- Insufficient stock for sales with detailed warnings
- Service worker offline/online state management

**Features Implemented:**
- Comprehensive error boundaries with fallback UI
- Enhanced GitHub API with retry logic and timeout handling
- Form validation with real-time error feedback
- Stock integrity validation for container operations
- User-friendly error notifications throughout the app

**Time Estimate:** 3 hours ✅ **COMPLETED**

### 4.2 Responsive Design & UX ✅ COMPLETED + ENHANCED
- [x] Test all pages on mobile devices
- [x] Fix mobile navigation and touch interactions
- [x] Optimize table layouts for small screens
- [x] Add loading skeletons and loading states
- [x] Implement proper focus management
- [x] Add touch-friendly button sizes and interactions
- [x] **Session 2 Enhancements:**
  - Implemented smooth modal animations
  - Added backdrop blur effects
  - Enhanced visual consistency
  - Improved user feedback mechanisms

**Mobile Optimizations Implemented:**
- Responsive modal dialogs with mobile-first design
- Touch-friendly form inputs (minimum 44px touch targets)
- Mobile-optimized navigation with collapsible menu
- Stack cards vertically on mobile devices
- Mobile-friendly table component with card view
- Touch-friendly button sizes and proper spacing
- Safe area handling for iOS devices
- Custom scrolling improvements for mobile

**Features Added:**
- ResponsiveContainer and responsive utility components
- Mobile-optimized CSS with touch enhancements
- Comprehensive mobile styles and media queries
- Screen size detection hooks and responsive helpers
- Touch-friendly forms with improved UX

**Time Estimate:** 4 hours ✅ **COMPLETED**

### 4.3 Performance Optimization ✅ COMPLETED
- [x] Implement React.lazy() for code splitting
- [x] Add virtualization helpers for large lists
- [x] Optimize re-renders with React.memo() 
- [x] Enhanced GitHub API calls with retry and debouncing
- [x] Cache calculated values with memoization
- [x] Minimize bundle size with lazy loading

**Performance Features Implemented:**
- Lazy loading of all major components with appropriate loading states
- Code splitting with automatic chunk generation
- Performance monitoring and Web Vitals tracking
- Service Worker for caching and offline functionality
- Optimized components with memoization
- Performance hooks for debouncing, throttling, and virtual scrolling
- Bundle analysis and performance budgeting

**Performance Results:**
- Bundle successfully split into multiple chunks
- Lazy loading working for all pages and forms
- Service worker caching static and dynamic content
- Performance monitoring active in development
- Memory usage tracking and optimization

**Time Estimate:** 2 hours ✅ **COMPLETED**

### 4.4 Testing & Quality Assurance ✅ COMPLETED
- [x] Test all CRUD operations with stock integrity
- [x] Verify calculations are correct (profit calculations fixed)
- [x] Test container stock management (delete/edit operations)
- [x] Check responsive design implementation
- [x] Verify error handling and user feedback
- [x] Test build process and code splitting

**Critical Test Cases Verified:**
- ✅ Add container → Products stock increases correctly
- ✅ Edit container → Stock adjustments calculated properly  
- ✅ Delete container → Stock reverted with validation
- ✅ Make sale → Stock reduces correctly with profit calculation
- ✅ Container deletion blocked when would cause negative stock
- ✅ P&L calculations verified (cost per kg × bag weight × quantity)
- ✅ CSV export working with proper data formatting
- ✅ Mobile responsive design tested
- ✅ Error boundaries catch and display errors gracefully
- ✅ Form validation prevents invalid data entry

**Critical Fixes Applied:**
1. **Container Stock Management:** Fixed DELETE_CONTAINER and UPDATE_CONTAINER to properly handle stock adjustments and prevent data integrity issues
2. **Error Handling:** Added comprehensive error boundaries and user feedback
3. **Mobile UX:** Implemented full responsive design with touch optimizations
4. **Performance:** Added code splitting, lazy loading, and service worker caching

**Time Estimate:** 3 hours ✅ **COMPLETED**

---

## 🔗 GitHub API Integration Guide

### API Endpoints Used
```javascript
// Get file content
GET /repos/:owner/:repo/contents/:path

// Update file content  
PUT /repos/:owner/:repo/contents/:path
{
  message: "Update data.json",
  content: base64EncodedContent,
  sha: currentFileSha
}
```

### Token Permissions Required
- `repo` scope (for private repositories)
- `public_repo` scope (for public repositories)

### Implementation Details

#### 1. Token Storage
```javascript
// utils/encryption.js
import { subtle } from 'crypto';

export async function encryptToken(token) {
  // Implement Web Crypto API encryption
}

export async function decryptToken(encryptedToken) {
  // Implement Web Crypto API decryption
}
```

#### 2. API Service
```javascript
// services/githubApi.js
const GITHUB_API_BASE = 'https://api.github.com';

export class GitHubAPI {
  constructor(owner, repo, token) {
    this.owner = owner;
    this.repo = repo;
    this.token = token;
  }

  async fetchData(fileName = 'data.json') {
    // Implement GET request
  }

  async updateData(fileName, data, commitMessage) {
    // Implement PUT request with base64 encoding
  }

  async testConnection() {
    // Test repo access
  }
}
```

#### 3. Error Handling
- Rate limiting (5000 requests/hour)
- Network failures
- Authentication errors
- File conflicts

### Sync Strategy
- **Auto-save:** Every 30 seconds if changes exist
- **Manual sync:** Button to force push/pull
- **Conflict resolution:** Last-write-wins (single user)
- **Offline support:** Queue changes, sync when online

---

## 📋 Data Model Reference

### Complete Data Structure
```json
{
  "metadata": {
    "version": "1.0.0",
    "lastUpdated": "2025-08-27T10:30:00Z",
    "nextIds": {
      "product": 1,
      "container": 1,
      "sale": 1,
      "expense": 1
    }
  },
  "containers": [
    {
      "id": "C1",
      "supplier": "ABC Import",
      "purchaseDate": "2025-08-15",
      "invoiceNumber": "INV-001",
      "totalCost": 2000,
      "notes": "First container shipment",
      "createdAt": "2025-08-15T09:00:00Z",
      "products": [
        {
          "productId": 1,
          "quantity": 100,
          "costPerUnit": 20
        }
      ]
    }
  ],
  "products": [
    {
      "id": 1,
      "name": "Nike Air Max",
      "category": "Sneakers",
      "size": "Various",
      "currentStock": 95,
      "containerId": "C1",
      "costPerUnit": 20,
      "description": "High quality athletic shoes",
      "createdAt": "2025-08-15T09:00:00Z"
    }
  ],
  "sales": [
    {
      "id": 1,
      "productId": 1,
      "productName": "Nike Air Max",
      "quantity": 5,
      "pricePerUnit": 45,
      "totalAmount": 225,
      "costPerUnit": 20,
      "profit": 125,
      "date": "2025-08-27",
      "time": "14:30:00",
      "createdAt": "2025-08-27T14:30:00Z",
      "notes": "Walk-in customer"
    }
  ],
  "expenses": [
    {
      "id": 1,
      "category": "Transport",
      "description": "Port fees for container C1",
      "amount": 200,
      "date": "2025-08-27",
      "containerId": "C1",
      "createdAt": "2025-08-27T10:00:00Z"
    }
  ]
}
```

### Business Rules
1. **Products** must be linked to a container
2. **Sales** cannot exceed current stock
3. **Container costs** are distributed across products
4. **Profit calculations** use FIFO method for COGS
5. **Timestamps** are always in ISO 8601 format

---

## ✅ Testing Checklist

### Manual Testing Scenarios

#### Data Management
- [ ] Add new container with multiple products
- [ ] Edit container details and verify product updates
- [ ] Delete container with existing products (should prevent)
- [ ] Add products to existing container
- [ ] Update product stock manually

#### Sales Operations
- [ ] Record sale for available product
- [ ] Attempt sale with insufficient stock (should prevent)
- [ ] Edit existing sale and verify stock adjustments
- [ ] Delete sale and verify stock restoration
- [ ] Record multiple sales for same product

#### Expense Tracking
- [ ] Add expense in each category
- [ ] Edit expense amount and verify totals
- [ ] Delete expense and verify calculations
- [ ] Filter expenses by date range
- [ ] Filter expenses by category

#### Calculations & Reports
- [ ] Verify COGS calculation matches manual calculation
- [ ] Check gross profit = revenue - COGS
- [ ] Confirm net profit = gross profit - expenses
- [ ] Test P&L with date range filtering
- [ ] Validate inventory value calculation

#### GitHub Integration
- [ ] Test initial GitHub connection
- [ ] Verify data saves to repository
- [ ] Test offline/online sync behavior
- [ ] Handle invalid token gracefully
- [ ] Test with network connectivity issues

#### Export Functionality
- [ ] Export sales data to Excel
- [ ] Export expenses data to Excel
- [ ] Export P&L report to Excel
- [ ] Verify Excel file formatting
- [ ] Test export with large datasets

#### Responsive Design
- [ ] Test on mobile phone (320px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1024px+ width)
- [ ] Verify touch interactions work
- [ ] Check form usability on mobile

### Performance Testing
- [ ] Load app with 1000+ products
- [ ] Test with 10,000+ sales records
- [ ] Verify chart rendering with large datasets
- [ ] Check memory usage during heavy operations
- [ ] Test GitHub sync with large data file

---

## 🚀 Deployment Guide

### GitHub Pages Setup

#### 1. Vite Configuration
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/usedshoes/', // Replace with your repo name
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

#### 2. GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

#### 3. Repository Settings
- [ ] Go to repository Settings → Pages
- [ ] Select "GitHub Actions" as source
- [ ] Ensure Actions are enabled
- [ ] Push to main branch triggers deployment

### Deployment Checklist
- [ ] Update base URL in Vite config
- [ ] Test build locally with `npm run build`
- [ ] Verify all assets load correctly
- [ ] Check that routing works with GitHub Pages
- [ ] Test GitHub API integration on live site
- [ ] Verify responsive design on production

### Custom Domain (Optional)
- [ ] Purchase domain and configure DNS
- [ ] Add CNAME file to public folder
- [ ] Update GitHub Pages settings
- [ ] Enable HTTPS (automatic with GitHub Pages)

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. GitHub API Issues
**Problem:** 403 Forbidden errors
**Solutions:**
- Check token has correct permissions
- Verify repository access
- Check API rate limits
- Ensure token is not expired

**Problem:** File not found on first run
**Solution:** Create empty `data.json` in repository

#### 2. Build Issues
**Problem:** Build fails with import errors
**Solutions:**
- Check all imports use correct paths
- Verify all dependencies are installed
- Clear node_modules and reinstall

**Problem:** Tailwind styles not applying
**Solutions:**
- Check tailwind.config.js paths
- Verify PostCSS configuration
- Ensure CSS import is correct

#### 3. Data Issues
**Problem:** Calculations don't match expected values
**Solutions:**
- Check date filtering logic
- Verify COGS calculation method
- Ensure all sales have cost data
- Debug with console.log in calculations

**Problem:** Stock becomes negative
**Solutions:**
- Add validation in sales form
- Check stock updates in data service
- Verify sale editing adjusts stock correctly

#### 4. Performance Issues
**Problem:** App becomes slow with large datasets
**Solutions:**
- Implement virtualization for tables
- Add pagination to history views
- Use React.memo for expensive components
- Optimize re-renders with useCallback

#### 5. Mobile Issues
**Problem:** Touch interactions don't work
**Solutions:**
- Add touch-action CSS properties
- Increase button sizes for better touch targets
- Check for touch event conflicts

### Debug Tools
- React Developer Tools
- Network tab for API calls
- Console.log for data flow
- Performance tab for optimization

---

## 🎯 Success Criteria

### Phase Completion Checklist

#### Phase 1 ✅
- [ ] Development environment fully setup
- [ ] Basic navigation works on all screen sizes
- [ ] GitHub API connection successful
- [ ] Can read/write data.json file

#### Phase 2 ✅
- [ ] All CRUD operations working
- [ ] Data relationships maintained correctly
- [ ] Stock tracking accurate
- [ ] Form validation prevents errors

#### Phase 3 ✅
- [ ] Dashboard shows accurate KPIs
- [ ] Charts display correct data
- [ ] P&L calculations verified manually
- [ ] Excel export includes all data

#### Phase 4 ✅
- [ ] No console errors on any page
- [ ] Responsive design works on mobile
- [ ] Performance meets target metrics
- [ ] Successfully deployed to GitHub Pages

### Final Validation
- [ ] Complete user journey test (add container → products → sales → view reports)
- [ ] All business calculations verified
- [ ] Data persistence confirmed across sessions
- [ ] Mobile experience is fully functional

---

## 📝 Notes & Reminders

### Development Best Practices
- Commit frequently with descriptive messages
- Test after each major feature implementation
- Keep components small and focused
- Use TypeScript if complexity grows
- Document complex business logic

### Business Considerations
- Consider data backup strategy beyond GitHub
- Plan for multi-user access in future
- Think about data migration if schema changes
- Consider adding user authentication later

### Completed Enhancements (Session 2 - 2025-08-27)
- ✅ **Icon System Overhaul**
  - Replaced all Hero Icons with Lucide React v0.542.0
  - Ensured consistent icon usage across all tables and components
  - Fixed Container Management table action buttons
  - Standardized: Pencil (edit), Trash2 (delete), Eye (view), BarChart3 (analytics)

- ✅ **Professional Income Statement Redesign**
  - Implemented accounting-standard P&L format
  - Added gradient headers and visual hierarchy
  - Proper sections: Revenue, COGS, Gross Profit, Operating Expenses, Net Income
  - Fixed padding issues for better readability
  - Color-coded amounts and percentage calculations

- ✅ **Modal System Enhancement**
  - Created reusable Modal.jsx with smooth animations
  - Backdrop blur effect with 30-40% opacity
  - Scale, fade, and slide animations (300ms ease-out)
  - Portal rendering for better z-index management
  - ESC key and click-outside-to-close functionality

- ✅ **Custom Confirmation Dialogs**
  - Professional ConfirmModal with warning/danger/info types
  - Replaced all window.confirm and alert calls
  - Integrated with UIContext for global state
  - Consistent styling with appropriate icons

- ✅ **Typography & Layout Consistency**
  - Standardized all page titles to text-2xl
  - Fixed all subtitles to text-sm text-gray-600 mt-1
  - Added Plus icons to Add Product/Container buttons
  - Consistent spacing and margins throughout

### Future Enhancements
- Mobile app with offline support
- Barcode scanning for products
- Advanced inventory forecasting
- Integration with accounting software
- Multi-currency support
- Customer relationship management
- Supplier management system
- Email notifications for low stock

---

**Last Updated:** 2025-08-27 (Session 2 - UI/UX Enhancements)
**Estimated Total Development Time:** 40-48 hours
**Current Status:** Production Ready with Enhanced UI/UX

This roadmap serves as your complete guide. Check off items as you complete them and refer back whenever you need to resume development. Each phase builds upon the previous one, ensuring nothing is missed and the application grows systematically.
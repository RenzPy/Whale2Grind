// Grind2Whale🐋 Financial Management Application

function saveBillsToFile() {
    if (window.electron && window.electron.saveData) {
        window.electron.saveData('bills.json', JSON.stringify(this.data)).then(result => {
            if (!result.success) {
                console.error('Failed to save data:', result.error);
            }
        });
    }
}

function loadBillsFromFile() {
    if (window.electron && window.electron.loadData) {
        return window.electron.loadData('bills.json').then(result => {
            if (result.success && result.data) {
                const loadedData = JSON.parse(result.data);
                this.data = { ...this.data, ...loadedData };
                this.updateAllDisplays();
                return true;
            } else {
                this.loadSampleData();
                return false;
            }
        });
    } else {
        this.loadSampleData();
        return Promise.resolve(false);
    }
}

class FinancialManager {
    constructor() {
        this.data = {
            currency: "CHF",
            platforms: ["Stock Broker", "Crypto Exchange", "Real Estate", "Bonds", "Bank", "P2P Lending", "Commodities"],
            years: {},
            baseBills: [],
            investments: [],
            soldInvestments: []
        };
        
        // Exchange rates (simplified)
        this.exchangeRates = {
            CHF: { CHF: 1, USD: 1.10, EUR: 1.02 },
            USD: { CHF: 0.91, USD: 1, EUR: 0.93 },
            EUR: { CHF: 0.98, USD: 1.08, EUR: 1 }
        };
        
        this.currentYear = null;
        this.currentMonth = null;
        this.currentTab = 'bills';
        this.sortOrder = { field: 'name', direction: 'asc' };
        this.currentEditIndex = -1;
        this.currentSellIndex = -1;
        this.pendingAction = null;
        this.charts = {};
        
        this.init();
    }
    
    init() {
        loadBillsFromFile.call(this).then(() => {
});
        this.initializeDateSelectors();
        this.setupTabNavigation();
        this.setupEventListeners();
        this.updateAllDisplays();
        this.renderBaseBills();
        this.renderPlatforms();
        this.populatePlatformSelectors();
        // Delay chart initialization to ensure DOM is ready
        setTimeout(() => {
            this.initializeCharts();
        }, 100);
    }
    
    loadSampleData() {
        // Load the provided sample data
        this.data = {
            currency: "CHF",
            platforms: ["Stock Broker", "Crypto Exchange", "Real Estate", "Bonds", "Bank", "P2P Lending", "Commodities"],
            years: {
                "2024": {
                    "1": [
                        {"name": "Rent", "amount": 1400, "paid": true},
                        {"name": "Utilities", "amount": 180, "paid": true},
                        {"name": "Internet", "amount": 85, "paid": true},
                        {"name": "Phone", "amount": 55, "paid": false},
                        {"name": "Insurance", "amount": 250, "paid": true},
                        {"name": "Groceries", "amount": 350, "paid": false}
                    ],
                    "2": [
                        {"name": "Rent", "amount": 1400, "paid": true},
                        {"name": "Utilities", "amount": 195, "paid": true},
                        {"name": "Internet", "amount": 85, "paid": true},
                        {"name": "Phone", "amount": 55, "paid": true},
                        {"name": "Insurance", "amount": 250, "paid": true}
                    ],
                    "9": [
                        {"name": "Rent", "amount": 1400, "paid": true},
                        {"name": "Utilities", "amount": 160, "paid": true},
                        {"name": "Internet", "amount": 85, "paid": false},
                        {"name": "Phone", "amount": 55, "paid": true},
                        {"name": "Insurance", "amount": 250, "paid": true},
                        {"name": "Car Payment", "amount": 420, "paid": false}
                    ],
                    "12": [
                        {"name": "Rent", "amount": 1400, "paid": false},
                        {"name": "Utilities", "amount": 220, "paid": false},
                        {"name": "Internet", "amount": 85, "paid": true},
                        {"name": "Phone", "amount": 55, "paid": false},
                        {"name": "Insurance", "amount": 250, "paid": false},
                        {"name": "Holiday Bonus", "amount": -800, "paid": true}
                    ]
                },
                "2025": {
                    "1": [
                        {"name": "Rent", "amount": 1450, "paid": true},
                        {"name": "Utilities", "amount": 170, "paid": true},
                        {"name": "Internet", "amount": 90, "paid": true},
                        {"name": "Phone", "amount": 60, "paid": true},
                        {"name": "Insurance", "amount": 260, "paid": true}
                    ],
                    "9": [
                        {"name": "Rent", "amount": 1450, "paid": true},
                        {"name": "Utilities", "amount": 150, "paid": true},
                        {"name": "Internet", "amount": 90, "paid": false},
                        {"name": "Phone", "amount": 60, "paid": true},
                        {"name": "Insurance", "amount": 260, "paid": true}
                    ]
                }
            },
            baseBills: [
                {"name": "Rent", "amount": 1400},
                {"name": "Utilities", "amount": 180},
                {"name": "Internet", "amount": 85},
                {"name": "Phone", "amount": 55},
                {"name": "Insurance", "amount": 250}
            ],
            investments: [
                {
                    "name": "Nestlé Stock",
                    "amount": 18000,
                    "currency": "CHF",
                    "platform": "Stock Broker",
                    "monthlyContribution": 600,
                    "purchasePricePerUnit": 90,
                    "quantity": 200
                },
                {
                    "name": "Apple Stock",
                    "amount": 15000,
                    "currency": "USD",
                    "platform": "Stock Broker", 
                    "monthlyContribution": 500,
                    "purchasePricePerUnit": 180,
                    "quantity": 83.33
                },
                {
                    "name": "ASML Holdings",
                    "amount": 12000,
                    "currency": "EUR",
                    "platform": "Stock Broker",
                    "monthlyContribution": 400,
                    "purchasePricePerUnit": 600,
                    "quantity": 20
                },
                {
                    "name": "Bitcoin",
                    "amount": 12000,
                    "currency": "USD",
                    "platform": "Crypto Exchange",
                    "monthlyContribution": 300,
                    "purchasePricePerUnit": 60000,
                    "quantity": 0.2
                },
                {
                    "name": "Ethereum",
                    "amount": 8000,
                    "currency": "EUR",
                    "platform": "Crypto Exchange",
                    "monthlyContribution": 200,
                    "purchasePricePerUnit": 2000,
                    "quantity": 4
                },
                {
                    "name": "Zurich Apartment",
                    "amount": 800000,
                    "currency": "CHF",
                    "platform": "Real Estate",
                    "monthlyContribution": 0,
                    "purchasePricePerUnit": 800000,
                    "quantity": 1
                },
                {
                    "name": "US Treasury Bonds",
                    "amount": 10000,
                    "currency": "USD",
                    "platform": "Bonds",
                    "monthlyContribution": 300,
                    "purchasePricePerUnit": 1000,
                    "quantity": 10
                },
                {
                    "name": "High-Yield Savings",
                    "amount": 25000,
                    "currency": "CHF",
                    "platform": "Bank",
                    "monthlyContribution": 1200,
                    "purchasePricePerUnit": 1,
                    "quantity": 25000
                }
            ],
            soldInvestments: [
                {
                    "name": "Tesla Stock",
                    "platform": "Stock Broker",
                    "purchaseCurrency": "USD",
                    "sellCurrency": "USD",
                    "purchasePricePerUnit": 200,
                    "sellPricePerUnit": 250,
                    "quantity": 40,
                    "purchaseAmount": 8000,
                    "saleAmount": 10000,
                    "profitLoss": 2000,
                    "profitLossCHF": 1818,
                    "dateSold": "2025-08-15"
                },
                {
                    "name": "Microsoft Stock",
                    "platform": "Stock Broker",
                    "purchaseCurrency": "USD",
                    "sellCurrency": "EUR",
                    "purchasePricePerUnit": 280,
                    "sellPricePerUnit": 320,
                    "quantity": 25,
                    "purchaseAmount": 7000,
                    "saleAmount": 8000,
                    "profitLoss": 1000,
                    "profitLossCHF": 980,
                    "dateSold": "2025-09-10"
                },
                {
                    "name": "Dogecoin",
                    "platform": "Crypto Exchange",
                    "purchaseCurrency": "EUR",
                    "sellCurrency": "EUR",
                    "purchasePricePerUnit": 0.30,
                    "sellPricePerUnit": 0.22,
                    "quantity": 10000,
                    "purchaseAmount": 3000,
                    "saleAmount": 2200,
                    "profitLoss": -800,
                    "profitLossCHF": -784,
                    "dateSold": "2025-07-22"
                },
                {
                    "name": "Gold ETF",
                    "platform": "Commodities",
                    "purchaseCurrency": "CHF",
                    "sellCurrency": "USD",
                    "purchasePricePerUnit": 180,
                    "sellPricePerUnit": 200,
                    "quantity": 50,
                    "purchaseAmount": 9000,
                    "saleAmount": 10000,
                    "profitLoss": 1000,
                    "profitLossCHF": 909,
                    "dateSold": "2025-06-30"
                },
                {
                    "name": "Spotify Stock",
                    "platform": "Stock Broker",
                    "purchaseCurrency": "EUR",
                    "sellCurrency": "CHF",
                    "purchasePricePerUnit": 120,
                    "sellPricePerUnit": 140,
                    "quantity": 30,
                    "purchaseAmount": 3600,
                    "saleAmount": 4200,
                    "profitLoss": 600,
                    "profitLossCHF": 588,
                    "dateSold": "2025-05-18"
                }
            ]
        };
    }
    
    convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return amount;
        return amount * this.exchangeRates[fromCurrency][toCurrency];
    }
    
    formatCurrency(amount, currency = null) {
        currency = currency || this.data.currency;
        const symbols = { CHF: 'CHF', USD: '$', EUR: '€' };
        const symbol = symbols[currency] || currency;
        return `${symbol}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    initializeDateSelectors() {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        
        // Populate year selector
        const yearSelect = document.getElementById('yearSelect');
        if (yearSelect) {
            yearSelect.innerHTML = '';
            
            const years = Object.keys(this.data.years).sort((a, b) => parseInt(a) - parseInt(b));
            
            // Add current year if not in data
            if (!years.includes(currentYear.toString())) {
                years.push(currentYear.toString());
                years.sort((a, b) => parseInt(a) - parseInt(b));
            }
            
            years.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            });
            
            // Set current selections
            this.currentYear = currentYear.toString();
            this.currentMonth = currentMonth.toString();
            
            yearSelect.value = this.currentYear;
        }
        
        const monthSelect = document.getElementById('monthSelect');
        if (monthSelect) {
            monthSelect.value = this.currentMonth;
        }
        
        const globalCurrency = document.getElementById('globalCurrency');
        if (globalCurrency) {
            globalCurrency.value = this.data.currency;
        }
    }
    
    setupTabNavigation() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const tabId = e.target.getAttribute('data-tab');
                if (!tabId) return;
                
                // Update active tab button
                tabBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update active tab content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                const targetContent = document.getElementById(`${tabId}-tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
                
                this.currentTab = tabId;
                
                // Update displays and charts when switching tabs
                if (tabId === 'charts') {
                    setTimeout(() => this.updateCharts(), 100);
                } else if (tabId === 'sold') {
                    this.renderSoldTable();
                } else if (tabId === 'investments') {
                    this.renderInvestmentsTable();
                }
            });
        });
    }
    
    setupEventListeners() {
        // Global currency change
        const globalCurrency = document.getElementById('globalCurrency');
        if (globalCurrency) {
            globalCurrency.addEventListener('change', (e) => {
                this.data.currency = e.target.value;
                this.updateAllDisplays();
                this.updateCharts();
            });
        }
        
        // Year/Month selection
        const yearSelect = document.getElementById('yearSelect');
        if (yearSelect) {
            yearSelect.addEventListener('change', (e) => {
                this.currentYear = e.target.value;
                this.updateAllDisplays();
            });
        }
        
        const monthSelect = document.getElementById('monthSelect');
        if (monthSelect) {
            monthSelect.addEventListener('change', (e) => {
                this.currentMonth = e.target.value;
                this.updateAllDisplays();
            });
        }
        
        // Year management
        const deleteYearBtn = document.getElementById('deleteYearBtn');
        if (deleteYearBtn) {
            deleteYearBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDeleteYearDialog();
            });
        }
        
        // Bills form
        const addBillForm = document.getElementById('addBillForm');
        if (addBillForm) {
            addBillForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addBill();
            });
        }
        
        // Investments form
        const addInvestmentForm = document.getElementById('addInvestmentForm');
        if (addInvestmentForm) {
            addInvestmentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addInvestment();
            });
        }
        
        // Search functionality
        const searchBills = document.getElementById('searchBills');
        if (searchBills) {
            searchBills.addEventListener('input', () => {
                this.renderBillsTable();
            });
        }
        
        const searchInvestments = document.getElementById('searchInvestments');
        if (searchInvestments) {
            searchInvestments.addEventListener('input', () => {
                this.renderInvestmentsTable();
            });
        }
        
        const searchSold = document.getElementById('searchSold');
        if (searchSold) {
            searchSold.addEventListener('input', () => {
                this.renderSoldTable();
            });
        }
        
        const filterSoldPlatform = document.getElementById('filterSoldPlatform');
        if (filterSoldPlatform) {
            filterSoldPlatform.addEventListener('change', () => {
                this.renderSoldTable();
            });
        }
        
        // Export functionality
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportSummary();
            });
        }
        
        // Platform management
        const addPlatformBtn = document.getElementById('addPlatformBtn');
        if (addPlatformBtn) {
            addPlatformBtn.addEventListener('click', () => {
                this.addPlatform();
            });
        }
        
        const newPlatform = document.getElementById('newPlatform');
        if (newPlatform) {
            newPlatform.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addPlatform();
                }
            });
        }
        
        // Delete all data
        const deleteAllDataBtn = document.getElementById('deleteAllDataBtn');
        if (deleteAllDataBtn) {
            deleteAllDataBtn.addEventListener('click', () => {
                this.deleteAllData();
            });
        }
        
        // Modal events
        this.setupModalEvents();
        
        // Base bills management
        const addBaseBillBtn = document.getElementById('addBaseBillBtn');
        if (addBaseBillBtn) {
            addBaseBillBtn.addEventListener('click', () => {
                this.addBaseBill();
            });
        }
    }
    
    setupModalEvents() {
        // Confirmation modal
        const modalCancel = document.getElementById('modalCancel');
        if (modalCancel) {
            modalCancel.addEventListener('click', () => {
                this.hideModal('confirmModal');
            });
        }
        
        const modalConfirm = document.getElementById('modalConfirm');
        if (modalConfirm) {
            modalConfirm.addEventListener('click', () => {
                if (this.pendingAction) {
                    this.pendingAction();
                    this.pendingAction = null;
                }
                this.hideModal('confirmModal');
            });
        }
        
        // Edit bill modal
        const editCancel = document.getElementById('editCancel');
        if (editCancel) {
            editCancel.addEventListener('click', () => {
                this.hideModal('editModal');
            });
        }
        
        const editSave = document.getElementById('editSave');
        if (editSave) {
            editSave.addEventListener('click', () => {
                this.saveEditedBill();
            });
        }
        
        const editBillForm = document.getElementById('editBillForm');
        if (editBillForm) {
            editBillForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveEditedBill();
            });
        }
        
        // Edit investment modal
        const editInvestmentCancel = document.getElementById('editInvestmentCancel');
        if (editInvestmentCancel) {
            editInvestmentCancel.addEventListener('click', () => {
                this.hideModal('editInvestmentModal');
            });
        }
        
        const editInvestmentSave = document.getElementById('editInvestmentSave');
        if (editInvestmentSave) {
            editInvestmentSave.addEventListener('click', () => {
                this.saveEditedInvestment();
            });
        }
        
        const editInvestmentForm = document.getElementById('editInvestmentForm');
        if (editInvestmentForm) {
            editInvestmentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveEditedInvestment();
            });
        }
        
        // Sell investment modal
        const sellCancel = document.getElementById('sellCancel');
        if (sellCancel) {
            sellCancel.addEventListener('click', () => {
                this.hideModal('sellModal');
            });
        }
        
        const sellConfirm = document.getElementById('sellConfirm');
        if (sellConfirm) {
            sellConfirm.addEventListener('click', () => {
                this.confirmSale();
            });
        }
        
        // Update sell preview when values change
        const sellPrice = document.getElementById('sellPrice');
        if (sellPrice) {
            sellPrice.addEventListener('input', () => {
                this.updateSellPreview();
            });
        }
        
        const sellCurrency = document.getElementById('sellCurrency');
        if (sellCurrency) {
            sellCurrency.addEventListener('change', () => {
                this.updateSellPreview();
            });
        }
        
        // Close modals on overlay click and escape key
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hideModal(overlay.closest('.modal').id);
                }
            });
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
                    this.hideModal(modal.id);
                });
            }
        });
    }
    
    updateAllDisplays() {
        this.renderBillsTable();
        this.updateSummaries();
        this.updateCurrentMonthYear();
        this.updateInvestmentSummary();
        this.renderInvestmentsTable();
        this.updateSoldSummary();
    }
    
    // Bills Management
    getCurrentBills() {
        if (!this.data.years[this.currentYear]) {
            this.data.years[this.currentYear] = {};
        }
        
        if (!this.data.years[this.currentYear][this.currentMonth]) {
            this.data.years[this.currentYear][this.currentMonth] = [...this.data.baseBills.map(bill => ({
                ...bill,
                paid: false
            }))];
        }
        
        return this.data.years[this.currentYear][this.currentMonth];
    }
    
    renderBillsTable() {
        const bills = this.getCurrentBills();
        const tbody = document.getElementById('billsTableBody');
        if (!tbody) return;
        
        const searchTerm = document.getElementById('searchBills')?.value.toLowerCase() || '';
        
        const filteredBills = bills.filter(bill => 
            bill.name.toLowerCase().includes(searchTerm)
        );
        
        tbody.innerHTML = '';
        
        const noBillsMessage = document.getElementById('noBillsMessage');
        if (filteredBills.length === 0) {
            if (noBillsMessage) noBillsMessage.classList.remove('hidden');
            return;
        } else {
            if (noBillsMessage) noBillsMessage.classList.add('hidden');
        }
        
        filteredBills.forEach((bill, index) => {
            const originalIndex = bills.indexOf(bill);
            const row = document.createElement('tr');
            row.className = 'bill-row fade-in';
            
            const amountClass = bill.amount >= 0 ? 'positive' : 'negative';
            const statusClass = bill.paid ? 'paid' : 'unpaid';
            const toggleText = bill.paid ? 'Mark Unpaid' : 'Mark Paid';
            const toggleClass = bill.paid ? 'paid' : 'unpaid';
            
            row.innerHTML = `
                <td class="bill-name">${bill.name}</td>
                <td class="bill-amount ${amountClass}">${this.formatCurrency(bill.amount)}</td>
                <td><span class="status-badge ${statusClass}">${bill.paid ? 'Paid' : 'Unpaid'}</span></td>
                <td class="bill-actions">
                    <button class="toggle-paid ${toggleClass}" data-index="${originalIndex}">
                        ${toggleText}
                    </button>
                    <button class="btn btn--secondary btn--sm" data-index="${originalIndex}" data-action="edit">
                        Edit
                    </button>
                    <button class="btn btn--outline btn--sm" data-index="${originalIndex}" data-action="delete">
                        Delete
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Add event listeners
        tbody.querySelectorAll('.toggle-paid').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                this.togglePaidStatus(index);
            });
        });
        
        tbody.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                this.editBill(index);
            });
        });
        
        tbody.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                this.deleteBill(index);
            });
        });
    }
    
    addBill() {
        const nameEl = document.getElementById('billName');
        const amountEl = document.getElementById('billAmount');
        
        if (!nameEl || !amountEl) return;
        
        const name = nameEl.value.trim();
        const amount = parseFloat(amountEl.value);
        
        if (!name || isNaN(amount)) {
            this.showToast('Please enter valid bill name and amount', 'error');
            return;
        }
        
        const bills = this.getCurrentBills();
        
        if (bills.some(bill => bill.name.toLowerCase() === name.toLowerCase())) {
            this.showToast('A bill with this name already exists', 'error');
            return;
        }
        
        bills.push({
            name: name,
            amount: amount,
            paid: false
        });
        
        this.updateAllDisplays();
        this.clearAddBillForm();
        this.showToast('Bill added successfully', 'success');
        saveBillsToFile.call(this);
    }
    
    clearAddBillForm() {
        const nameEl = document.getElementById('billName');
        const amountEl = document.getElementById('billAmount');
        
        if (nameEl) nameEl.value = '';
        if (amountEl) amountEl.value = '';
        if (nameEl) nameEl.focus();
    }
    
    editBill(index) {
        const bills = this.getCurrentBills();
        const bill = bills[index];
        
        this.currentEditIndex = index;
        
        const editName = document.getElementById('editBillName');
        const editAmount = document.getElementById('editBillAmount');
        
        if (editName) editName.value = bill.name;
        if (editAmount) editAmount.value = bill.amount;
        
        this.showModal('editModal');
    }
    
    saveEditedBill() {
        const editName = document.getElementById('editBillName');
        const editAmount = document.getElementById('editBillAmount');
        
        if (!editName || !editAmount) return;
        
        const name = editName.value.trim();
        const amount = parseFloat(editAmount.value);
        
        if (!name || isNaN(amount)) {
            this.showToast('Please enter valid bill name and amount', 'error');
            return;
        }
        
        const bills = this.getCurrentBills();
        const existingBill = bills.find((bill, index) => 
            index !== this.currentEditIndex && 
            bill.name.toLowerCase() === name.toLowerCase()
        );
        
        if (existingBill) {
            this.showToast('A bill with this name already exists', 'error');
            return;
        }
        
        bills[this.currentEditIndex].name = name;
        bills[this.currentEditIndex].amount = amount;
        
        this.updateAllDisplays();
        this.hideModal('editModal');
        this.showToast('Bill updated successfully', 'success');
    }
    
    deleteBill(index) {
    const bills = this.getCurrentBills();
    const billName = bills[index].name;
    
    this.showConfirmDialog(
        'Delete Bill',
        `Are you sure you want to delete "${billName}"?`,
        () => {
            bills.splice(index, 1);
            saveBillsToFile.call(this);
            this.updateAllDisplays();
            this.showToast('Bill deleted successfully', 'success');
        }
    );
}
    
    togglePaidStatus(index) {
        const bills = this.getCurrentBills();
        bills[index].paid = !bills[index].paid;
        this.updateAllDisplays();
        this.updateCharts();
        
        const status = bills[index].paid ? 'paid' : 'unpaid';
        this.showToast(`Bill marked as ${status}`, 'success');
    }
    
    updateSummaries() {
        this.updateMonthlySummary();
        this.updateOverallSummary();
    }
    
    updateMonthlySummary() {
        const bills = this.getCurrentBills();
        
        const total = bills.reduce((sum, bill) => sum + bill.amount, 0);
        const paid = bills.filter(bill => bill.paid).reduce((sum, bill) => sum + bill.amount, 0);
        const unpaid = total - paid;
        const percentage = total !== 0 ? Math.round((paid / total) * 100) : 0;
        
        const monthlyTotal = document.getElementById('monthlyTotal');
        const monthlyPaid = document.getElementById('monthlyPaid');
        const monthlyUnpaid = document.getElementById('monthlyUnpaid');
        const monthlyPercentage = document.getElementById('monthlyPercentage');
        
        if (monthlyTotal) monthlyTotal.textContent = this.formatCurrency(total);
        if (monthlyPaid) monthlyPaid.textContent = this.formatCurrency(paid);
        if (monthlyUnpaid) monthlyUnpaid.textContent = this.formatCurrency(unpaid);
        if (monthlyPercentage) monthlyPercentage.textContent = `${percentage}%`;
    }
    
    updateOverallSummary() {
        let totalPaid = 0;
        let totalBills = 0;
        let paidBills = 0;
        
        Object.keys(this.data.years).forEach(year => {
            Object.keys(this.data.years[year]).forEach(month => {
                const bills = this.data.years[year][month];
                bills.forEach(bill => {
                    totalBills++;
                    if (bill.paid) {
                        totalPaid += this.convertCurrency(bill.amount, 'CHF', this.data.currency);
                        paidBills++;
                    }
                });
            });
        });
        
        const overallPaid = document.getElementById('overallPaid');
        const overallBills = document.getElementById('overallBills');
        
        if (overallPaid) overallPaid.textContent = this.formatCurrency(totalPaid);
        if (overallBills) overallBills.textContent = `${paidBills}/${totalBills}`;
    }
    
    updateCurrentMonthYear() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const monthName = monthNames[parseInt(this.currentMonth) - 1];
        
        const currentMonthYear = document.getElementById('currentMonthYear');
        if (currentMonthYear) {
            currentMonthYear.textContent = `${monthName} ${this.currentYear}`;
        }
    }
    
    // Investment Management
    addInvestment() {
        const nameEl = document.getElementById('investmentName');
        const amountEl = document.getElementById('investmentAmount');
        const currencyEl = document.getElementById('investmentCurrency');
        const platformEl = document.getElementById('investmentPlatform');
        const monthlyContributionEl = document.getElementById('monthlyContribution');
        const pricePerUnitEl = document.getElementById('pricePerUnit');
        const quantityEl = document.getElementById('quantity');
        
        if (!nameEl || !amountEl || !currencyEl || !platformEl || !pricePerUnitEl || !quantityEl) return;
        
        const name = nameEl.value.trim();
        const amount = parseFloat(amountEl.value);
        const currency = currencyEl.value;
        const platform = platformEl.value;
        const monthlyContribution = parseFloat(monthlyContributionEl.value) || 0;
        const pricePerUnit = parseFloat(pricePerUnitEl.value);
        const quantity = parseFloat(quantityEl.value);
        
        if (!name || isNaN(amount) || !currency || !platform || isNaN(pricePerUnit) || isNaN(quantity)) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }
        
        if (this.data.investments.some(inv => inv.name.toLowerCase() === name.toLowerCase())) {
            this.showToast('An investment with this name already exists', 'error');
            return;
        }
        
        this.data.investments.push({
            name,
            amount,
            currency,
            platform,
            monthlyContribution,
            purchasePricePerUnit: pricePerUnit,
            quantity
        });
        
        this.updateAllDisplays();
        this.clearAddInvestmentForm();
        this.showToast('Investment added successfully', 'success');
    }
    
    clearAddInvestmentForm() {
        const fields = ['investmentName', 'investmentAmount', 'monthlyContribution', 'pricePerUnit', 'quantity'];
        fields.forEach(fieldId => {
            const el = document.getElementById(fieldId);
            if (el) el.value = '';
        });
        
        const currencyEl = document.getElementById('investmentCurrency');
        if (currencyEl) currencyEl.value = 'CHF';
        
        const nameEl = document.getElementById('investmentName');
        if (nameEl) nameEl.focus();
    }
    
    renderInvestmentsTable() {
        const investments = this.data.investments;
        const tbody = document.getElementById('investmentsTableBody');
        if (!tbody) return;
        
        const searchTerm = document.getElementById('searchInvestments')?.value.toLowerCase() || '';
        
        const filteredInvestments = investments.filter(inv => 
            inv.name.toLowerCase().includes(searchTerm) ||
            inv.platform.toLowerCase().includes(searchTerm)
        );
        
        tbody.innerHTML = '';
        
        filteredInvestments.forEach((investment, index) => {
            const originalIndex = investments.indexOf(investment);
            const row = document.createElement('tr');
            row.className = 'investment-row fade-in';
            
            row.innerHTML = `
                <td class="investment-name">${investment.name}</td>
                <td class="investment-amount">${this.formatCurrency(investment.amount, investment.currency)}</td>
                <td><span class="currency-${investment.currency.toLowerCase()}">${investment.currency}</span></td>
                <td>${investment.platform}</td>
                <td>${this.formatCurrency(investment.monthlyContribution, investment.currency)}</td>
                <td>${this.formatCurrency(investment.purchasePricePerUnit, investment.currency)}</td>
                <td>${investment.quantity}</td>
                <td class="investment-actions">
                    <button class="btn btn--primary btn--sm" data-index="${originalIndex}" data-action="sell">
                        Sell
                    </button>
                    <button class="btn btn--secondary btn--sm" data-index="${originalIndex}" data-action="edit">
                        Edit
                    </button>
                    <button class="btn btn--outline btn--sm" data-index="${originalIndex}" data-action="delete">
                        Delete
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Add event listeners
        tbody.querySelectorAll('[data-action="sell"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                this.sellInvestment(index);
            });
        });
        
        tbody.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                this.editInvestment(index);
            });
        });
        
        tbody.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                this.deleteInvestment(index);
            });
        });
    }
    
    updateInvestmentSummary() {
        const totalInvestments = this.data.investments.reduce((sum, inv) => 
            sum + this.convertCurrency(inv.amount, inv.currency, this.data.currency), 0);
        
        const monthlyContributions = this.data.investments.reduce((sum, inv) => 
            sum + this.convertCurrency(inv.monthlyContribution, inv.currency, this.data.currency), 0);
        
        const platforms = new Set(this.data.investments.map(inv => inv.platform)).size;
        
        const totalInvestmentsEl = document.getElementById('totalInvestments');
        const monthlyContributionsEl = document.getElementById('monthlyContributions');
        const platformCountEl = document.getElementById('platformCount');
        
        if (totalInvestmentsEl) totalInvestmentsEl.textContent = this.formatCurrency(totalInvestments);
        if (monthlyContributionsEl) monthlyContributionsEl.textContent = this.formatCurrency(monthlyContributions);
        if (platformCountEl) platformCountEl.textContent = platforms;
    }
    
    editInvestment(index) {
        const investment = this.data.investments[index];
        this.currentEditIndex = index;
        
        const fields = {
            'editInvestmentName': investment.name,
            'editInvestmentAmount': investment.amount,
            'editInvestmentCurrency': investment.currency,
            'editInvestmentPlatform': investment.platform,
            'editMonthlyContribution': investment.monthlyContribution,
            'editPricePerUnit': investment.purchasePricePerUnit,
            'editQuantity': investment.quantity
        };
        
        Object.keys(fields).forEach(fieldId => {
            const el = document.getElementById(fieldId);
            if (el) el.value = fields[fieldId];
        });
        
        this.populatePlatformSelectors();
        this.showModal('editInvestmentModal');
    }
    
    saveEditedInvestment() {
        const fields = {
            name: document.getElementById('editInvestmentName'),
            amount: document.getElementById('editInvestmentAmount'),
            currency: document.getElementById('editInvestmentCurrency'),
            platform: document.getElementById('editInvestmentPlatform'),
            monthlyContribution: document.getElementById('editMonthlyContribution'),
            pricePerUnit: document.getElementById('editPricePerUnit'),
            quantity: document.getElementById('editQuantity')
        };
        
        const values = {};
        for (let key in fields) {
            if (!fields[key]) return;
            if (key === 'name' || key === 'currency' || key === 'platform') {
                values[key] = fields[key].value.trim();
            } else {
                values[key] = parseFloat(fields[key].value);
            }
        }
        
        values.monthlyContribution = values.monthlyContribution || 0;
        
        if (!values.name || isNaN(values.amount) || !values.currency || !values.platform || 
            isNaN(values.pricePerUnit) || isNaN(values.quantity)) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }
        
        const existingInvestment = this.data.investments.find((inv, index) => 
            index !== this.currentEditIndex && 
            inv.name.toLowerCase() === values.name.toLowerCase()
        );
        
        if (existingInvestment) {
            this.showToast('An investment with this name already exists', 'error');
            return;
        }
        
        const investment = this.data.investments[this.currentEditIndex];
        investment.name = values.name;
        investment.amount = values.amount;
        investment.currency = values.currency;
        investment.platform = values.platform;
        investment.monthlyContribution = values.monthlyContribution;
        investment.purchasePricePerUnit = values.pricePerUnit;
        investment.quantity = values.quantity;
        
        this.updateAllDisplays();
        this.hideModal('editInvestmentModal');
        this.showToast('Investment updated successfully', 'success');
    }
    
    deleteInvestment(index) {
    const investment = this.data.investments[index];
    
    this.showConfirmDialog(
        'Delete Investment',
        `Are you sure you want to delete "${investment.name}"?`,
        () => {
            this.data.investments.splice(index, 1);
            saveBillsToFile.call(this); // ADD THIS LINE
            this.updateAllDisplays();
            this.showToast('Investment deleted successfully', 'success');
        }
    );
}
    
    sellInvestment(index) {
        const investment = this.data.investments[index];
        this.currentSellIndex = index;
        
        const sellInvestmentNameEl = document.getElementById('sellInvestmentName');
        const sellInvestmentQuantityEl = document.getElementById('sellInvestmentQuantity');
        const sellInvestmentPurchasePriceEl = document.getElementById('sellInvestmentPurchasePrice');
        const sellPriceEl = document.getElementById('sellPrice');
        const sellCurrencyEl = document.getElementById('sellCurrency');
        
        if (sellInvestmentNameEl) sellInvestmentNameEl.textContent = investment.name;
        if (sellInvestmentQuantityEl) sellInvestmentQuantityEl.textContent = investment.quantity;
        if (sellInvestmentPurchasePriceEl) {
            sellInvestmentPurchasePriceEl.textContent = this.formatCurrency(investment.purchasePricePerUnit, investment.currency);
        }
        
        if (sellPriceEl) sellPriceEl.value = investment.purchasePricePerUnit;
        if (sellCurrencyEl) sellCurrencyEl.value = investment.currency;
        
        this.updateSellPreview();
        this.showModal('sellModal');
    }
    
    updateSellPreview() {
        if (this.currentSellIndex === -1) return;
        
        const investment = this.data.investments[this.currentSellIndex];
        const sellPriceEl = document.getElementById('sellPrice');
        const sellCurrencyEl = document.getElementById('sellCurrency');
        
        if (!sellPriceEl || !sellCurrencyEl) return;
        
        const sellPrice = parseFloat(sellPriceEl.value) || 0;
        const sellCurrency = sellCurrencyEl.value;
        
        const saleAmount = sellPrice * investment.quantity;
        let profitLoss = 0;
        
        if (investment.currency === sellCurrency) {
            profitLoss = saleAmount - investment.amount;
        } else {
            const convertedPurchaseAmount = this.convertCurrency(investment.amount, investment.currency, sellCurrency);
            profitLoss = saleAmount - convertedPurchaseAmount;
        }
        
        const profitLossCHF = this.convertCurrency(profitLoss, sellCurrency, 'CHF');
        
        const previewSaleAmountEl = document.getElementById('previewSaleAmount');
        const previewProfitLossEl = document.getElementById('previewProfitLoss');
        const previewCHFEl = document.getElementById('previewCHF');
        
        if (previewSaleAmountEl) previewSaleAmountEl.textContent = this.formatCurrency(saleAmount, sellCurrency);
        
        if (previewProfitLossEl) {
            previewProfitLossEl.textContent = this.formatCurrency(profitLoss, sellCurrency);
            previewProfitLossEl.className = `stat-value ${profitLoss >= 0 ? 'profit' : 'loss'}`;
        }
        
        if (previewCHFEl) previewCHFEl.textContent = this.formatCurrency(profitLossCHF, 'CHF');
    }
    
    confirmSale() {
        if (this.currentSellIndex === -1) return;
        
        const investment = this.data.investments[this.currentSellIndex];
        const sellPriceEl = document.getElementById('sellPrice');
        const sellCurrencyEl = document.getElementById('sellCurrency');
        
        if (!sellPriceEl || !sellCurrencyEl) return;
        
        const sellPrice = parseFloat(sellPriceEl.value);
        const sellCurrency = sellCurrencyEl.value;
        
        if (!sellPrice || isNaN(sellPrice) || sellPrice <= 0) {
            this.showToast('Please enter a valid selling price', 'error');
            return;
        }
        
        const saleAmount = sellPrice * investment.quantity;
        let profitLoss = 0;
        
        if (investment.currency === sellCurrency) {
            profitLoss = saleAmount - investment.amount;
        } else {
            const convertedPurchaseAmount = this.convertCurrency(investment.amount, investment.currency, sellCurrency);
            profitLoss = saleAmount - convertedPurchaseAmount;
        }
        
        const profitLossCHF = this.convertCurrency(profitLoss, sellCurrency, 'CHF');
        
        // Create sold investment record
        const soldInvestment = {
            name: investment.name,
            platform: investment.platform,
            purchaseCurrency: investment.currency,
            sellCurrency: sellCurrency,
            purchasePricePerUnit: investment.purchasePricePerUnit,
            sellPricePerUnit: sellPrice,
            quantity: investment.quantity,
            purchaseAmount: investment.amount,
            saleAmount: saleAmount,
            profitLoss: profitLoss,
            profitLossCHF: profitLossCHF,
            dateSold: new Date().toISOString().split('T')[0]
        };
        
        // Add to sold investments
        this.data.soldInvestments.push(soldInvestment);
        
        // Remove from active investments
        this.data.investments.splice(this.currentSellIndex, 1);
        
        this.updateAllDisplays();
        this.updateCharts();
        this.hideModal('sellModal');
        this.currentSellIndex = -1;
        
        const profitText = profitLoss >= 0 ? 'profit' : 'loss';
        this.showToast(`Investment sold with ${Math.abs(profitLoss).toFixed(2)} ${sellCurrency} ${profitText}`, 'success');
    }
    
    // Sold Investments Management
    renderSoldTable() {
        const soldInvestments = this.data.soldInvestments;
        const tbody = document.getElementById('soldTableBody');
        if (!tbody) return;
        
        const searchTerm = document.getElementById('searchSold')?.value.toLowerCase() || '';
        const platformFilter = document.getElementById('filterSoldPlatform')?.value || '';
        
        let filteredSold = soldInvestments.filter(sold => {
            const matchesSearch = sold.name.toLowerCase().includes(searchTerm) ||
                                  sold.platform.toLowerCase().includes(searchTerm);
            const matchesPlatform = !platformFilter || sold.platform === platformFilter;
            return matchesSearch && matchesPlatform;
        });
        
        // Sort by date sold (most recent first)
        filteredSold.sort((a, b) => new Date(b.dateSold) - new Date(a.dateSold));
        
        tbody.innerHTML = '';
        
        filteredSold.forEach(sold => {
            const row = document.createElement('tr');
            row.className = 'sold-row fade-in';
            
            const plClass = sold.profitLoss >= 0 ? 'profit' : 'loss';
            const plCHFClass = sold.profitLossCHF >= 0 ? 'profit' : 'loss';
            
            row.innerHTML = `
                <td>${sold.name}</td>
                <td>${sold.platform}</td>
                <td>${this.formatCurrency(sold.purchasePricePerUnit, sold.purchaseCurrency)} ${sold.purchaseCurrency}</td>
                <td>${this.formatCurrency(sold.sellPricePerUnit, sold.sellCurrency)} ${sold.sellCurrency}</td>
                <td class="profit-loss ${plClass}">${this.formatCurrency(sold.profitLoss, sold.sellCurrency)}</td>
                <td class="profit-loss ${plCHFClass}">${this.formatCurrency(sold.profitLossCHF, 'CHF')}</td>
                <td>${new Date(sold.dateSold).toLocaleDateString()}</td>
            `;
            
            tbody.appendChild(row);
        });
        
        this.populateSoldPlatformFilter();
    }
    
    populateSoldPlatformFilter() {
        const select = document.getElementById('filterSoldPlatform');
        if (!select) return;
        
        const currentValue = select.value;
        
        select.innerHTML = '<option value="">All Platforms</option>';
        
        const platforms = [...new Set(this.data.soldInvestments.map(sold => sold.platform))];
        platforms.sort().forEach(platform => {
            const option = document.createElement('option');
            option.value = platform;
            option.textContent = platform;
            select.appendChild(option);
        });
        
        if (currentValue) {
            select.value = currentValue;
        }
    }
    
    updateSoldSummary() {
        const totalProfitCHF = this.data.soldInvestments.reduce((sum, sold) => sum + sold.profitLossCHF, 0);
        const soldCount = this.data.soldInvestments.length;
        
        // Calculate average return
        let avgReturn = 0;
        if (soldCount > 0) {
            const totalReturns = this.data.soldInvestments.reduce((sum, sold) => {
                const returnPercent = (sold.profitLoss / sold.purchaseAmount) * 100;
                return sum + returnPercent;
            }, 0);
            avgReturn = totalReturns / soldCount;
        }
        
        const totalElement = document.getElementById('totalProfit');
        if (totalElement) {
            totalElement.textContent = this.formatCurrency(totalProfitCHF, 'CHF');
            totalElement.className = `stat-value ${totalProfitCHF >= 0 ? 'profit' : 'loss'}`;
        }
        
        const soldCountEl = document.getElementById('soldCount');
        if (soldCountEl) soldCountEl.textContent = soldCount;
        
        const avgElement = document.getElementById('avgReturn');
        if (avgElement) {
            avgElement.textContent = `${avgReturn.toFixed(1)}%`;
            avgElement.className = `stat-value ${avgReturn >= 0 ? 'profit' : 'loss'}`;
        }
    }
    
    // Platform Management
    populatePlatformSelectors() {
        const selectors = [
            'investmentPlatform',
            'editInvestmentPlatform'
        ];
        
        selectors.forEach(selectorId => {
            const select = document.getElementById(selectorId);
            if (!select) return;
            
            const currentValue = select.value;
            select.innerHTML = '';
            
            this.data.platforms.forEach(platform => {
                const option = document.createElement('option');
                option.value = platform;
                option.textContent = platform;
                select.appendChild(option);
            });
            
            if (currentValue && this.data.platforms.includes(currentValue)) {
                select.value = currentValue;
            }
        });
    }
    
    renderPlatforms() {
        const container = document.getElementById('platformsList');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.data.platforms.forEach((platform, index) => {
            const div = document.createElement('div');
            div.className = 'platform-item';
            div.innerHTML = `
                <span class="platform-name">${platform}</span>
                <button class="btn btn--outline btn--sm" data-index="${index}">
                    Remove
                </button>
            `;
            
            div.querySelector('button').addEventListener('click', () => {
                this.removePlatform(index);
            });
            
            container.appendChild(div);
        });
    }
    
    addPlatform() {
        const input = document.getElementById('newPlatform');
        if (!input) return;
        
        const name = input.value.trim();
        
        if (!name) {
            this.showToast('Please enter a platform name', 'error');
            return;
        }
        
        if (this.data.platforms.includes(name)) {
            this.showToast('Platform already exists', 'error');
            return;
        }
        
        this.data.platforms.push(name);
        this.data.platforms.sort();
        
        this.renderPlatforms();
        this.populatePlatformSelectors();
        input.value = '';
        
        this.showToast('Platform added successfully', 'success');
    }
    
    removePlatform(index) {
        const platform = this.data.platforms[index];
        
        // Check if platform is in use
        const inUseInvestments = this.data.investments.some(inv => inv.platform === platform);
        const inUseSold = this.data.soldInvestments.some(sold => sold.platform === platform);
        
        if (inUseInvestments || inUseSold) {
            this.showToast('Cannot remove platform that is in use', 'error');
            return;
        }
        
        this.showConfirmDialog(
            'Remove Platform',
            `Are you sure you want to remove "${platform}"?`,
            () => {
                this.data.platforms.splice(index, 1);
                this.renderPlatforms();
                this.populatePlatformSelectors();
                this.showToast('Platform removed successfully', 'success');
            }
        );
    }
    
    // Charts
    initializeCharts() {
        this.createPLChart();
        this.createBillsChart();
        this.createOverallChart();
        this.createPlatformChart();
    }
    
    updateCharts() {
        if (this.currentTab === 'charts') {
            this.updatePLChart();
            this.updateBillsChart();
            this.updateOverallChart();
            this.updatePlatformChart();
        }
    }
    
    createPLChart() {
        const ctx = document.getElementById('plChart');
        if (!ctx) return;
        
        this.charts.pl = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Cumulative P/L (CHF)',
                    data: [],
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true,
                    tension: 0.2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `P/L: ${this.formatCurrency(context.raw, 'CHF')}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatCurrency(value, 'CHF')
                        }
                    }
                }
            }
        });
        
        this.updatePLChart();
    }
    
    updatePLChart() {
        if (!this.charts.pl) return;
        
        // Sort sold investments by date
        const sortedSold = [...this.data.soldInvestments].sort((a, b) => new Date(a.dateSold) - new Date(b.dateSold));
        
        const labels = [];
        const data = [];
        let cumulativePL = 0;
        
        sortedSold.forEach(sold => {
            labels.push(new Date(sold.dateSold).toLocaleDateString());
            cumulativePL += sold.profitLossCHF;
            data.push(cumulativePL);
        });
        
        this.charts.pl.data.labels = labels;
        this.charts.pl.data.datasets[0].data = data;
        this.charts.pl.update('none');
    }
    
    createBillsChart() {
        const ctx = document.getElementById('billsChart');
        if (!ctx) return;
        
        this.charts.bills = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Paid', 'Unpaid'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: ['#1FB8CD', '#B4413C']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.label}: ${this.formatCurrency(context.raw)}`;
                            }
                        }
                    }
                }
            }
        });
        
        this.updateBillsChart();
    }
    
    updateBillsChart() {
        if (!this.charts.bills) return;
        
        const bills = this.getCurrentBills();
        const paid = bills.filter(bill => bill.paid).reduce((sum, bill) => sum + bill.amount, 0);
        const unpaid = bills.filter(bill => !bill.paid).reduce((sum, bill) => sum + bill.amount, 0);
        
        this.charts.bills.data.datasets[0].data = [paid, unpaid];
        this.charts.bills.update('none');
    }
    
    createOverallChart() {
        const ctx = document.getElementById('overallChart');
        if (!ctx) return;
        
        this.charts.overall = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Paid Bills', 'Unpaid Bills'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: ['#1FB8CD', '#B4413C']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.label}: ${context.raw}`;
                            }
                        }
                    }
                }
            }
        });
        
        this.updateOverallChart();
    }
    
    updateOverallChart() {
        if (!this.charts.overall) return;
        
        let paidBills = 0;
        let unpaidBills = 0;
        
        Object.keys(this.data.years).forEach(year => {
            Object.keys(this.data.years[year]).forEach(month => {
                const bills = this.data.years[year][month];
                bills.forEach(bill => {
                    if (bill.paid) paidBills++;
                    else unpaidBills++;
                });
            });
        });
        
        this.charts.overall.data.datasets[0].data = [paidBills, unpaidBills];
        this.charts.overall.update('none');
    }
    
    createPlatformChart() {
        const ctx = document.getElementById('platformChart');
        if (!ctx) return;
        
        this.charts.platform = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.label}: ${this.formatCurrency(context.raw)}`;
                            }
                        }
                    }
                }
            }
        });
        
        this.updatePlatformChart();
    }
    
    updatePlatformChart() {
        if (!this.charts.platform) return;
        
        const platformData = {};
        
        this.data.investments.forEach(inv => {
            const amount = this.convertCurrency(inv.amount, inv.currency, this.data.currency);
            platformData[inv.platform] = (platformData[inv.platform] || 0) + amount;
        });
        
        const labels = Object.keys(platformData);
        const data = Object.values(platformData);
        
        this.charts.platform.data.labels = labels;
        this.charts.platform.data.datasets[0].data = data;
        this.charts.platform.update('none');
    }
    
    // Base Bills Management
    renderBaseBills() {
        const container = document.getElementById('baseBillsList');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.data.baseBills.forEach((bill, index) => {
            const div = document.createElement('div');
            div.className = 'base-bill-item';
            div.innerHTML = `
                <div class="base-bill-info">
                    <span class="base-bill-name">${bill.name}</span>
                    <span class="base-bill-amount">${this.formatCurrency(bill.amount)}</span>
                </div>
                <button class="btn btn--outline btn--sm" data-index="${index}">
                    Remove
                </button>
            `;
            
            div.querySelector('button').addEventListener('click', () => {
                this.removeBaseBill(index);
            });
            
            container.appendChild(div);
        });
    }
    
    addBaseBill() {
        const name = prompt('Enter bill name:');
        if (!name) return;
        
        const amount = parseFloat(prompt('Enter amount:'));
        if (isNaN(amount)) {
            this.showToast('Please enter a valid amount', 'error');
            return;
        }
        
        if (this.data.baseBills.some(bill => bill.name.toLowerCase() === name.toLowerCase())) {
            this.showToast('A base bill with this name already exists', 'error');
            return;
        }
        
        this.data.baseBills.push({ name, amount });
        this.renderBaseBills();
        this.showToast('Base bill added successfully', 'success');
    }
    
    removeBaseBill(index) {
        const billName = this.data.baseBills[index].name;
        this.showConfirmDialog(
            'Remove Base Bill',
            `Are you sure you want to remove "${billName}" from base bills?`,
            () => {
                this.data.baseBills.splice(index, 1);
                this.renderBaseBills();
                this.showToast('Base bill removed successfully', 'success');
            }
        );
    }
    
    // Year Management
    showAddYearDialog() {
        const modal = document.getElementById('addYearModal');
        const field = document.getElementById('addYearField');
        const cancelBtn = document.getElementById('addYearCancel');
        const confirmBtn = document.getElementById('addYearConfirm');
        modal.classList.remove('hidden');
        field.value = '';

        const confirm = () => {
            const year = field.value.trim();
            if(!/^[0-9]{4}$/.test(year)) {
                this.showToast('Enter a valid 4-digit year', 'error');
                return;
            }
            if(this.data.years[year]) {
                this.showToast('Year already exists', 'error');
                return;
            }
            this.addYear(year);
            saveBillsToFile.call(this);
            modal.classList.add('hidden');
            cleanup();
        };
        const cancel = () => {
            modal.classList.add('hidden');
                cleanup();
            };
        const cleanup = () => {
            cancelBtn.removeEventListener('click', cancel);
            confirmBtn.removeEventListener('click', confirm);
        };
        cancelBtn.addEventListener('click', cancel);
        confirmBtn.addEventListener('click', confirm);
        field.addEventListener('keydown', function handler(e) {
            if(e.key === 'Enter') {
                confirm();
                field.removeEventListener('keydown', handler);
            }
            if(e.key === 'Escape') {
                cancel();
                field.removeEventListener('keydown', handler);
            }
    });
    
    setTimeout(()=>{ field.focus(); }, 50);
    }

    addYear(year) {
        this.data.years[year] = {};
        
        const yearSelect = document.getElementById('yearSelect');
        if (!yearSelect) return;
        
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        
        const options = Array.from(yearSelect.options);
        let inserted = false;
        for (let i = 0; i < options.length; i++) {
            if (parseInt(options[i].value) > parseInt(year)) {
                yearSelect.insertBefore(option, options[i]);
                inserted = true;
                break;
            }
        }
        if (!inserted) {
            yearSelect.appendChild(option);
        }
        
        this.currentYear = year;
        yearSelect.value = year;

        saveBillsToFile.call(this);

        this.updateAllDisplays();
        
        this.showToast(`Year ${year} added successfully`, 'success');
    }
    
    showDeleteYearDialog() {
        if (Object.keys(this.data.years).length <= 1) {
            this.showToast('Cannot delete the only remaining year', 'error');
            return;
        }
        
        this.showConfirmDialog(
            'Delete Year',
            `Are you sure you want to delete year ${this.currentYear} and all its data?`,
            () => {
                this.deleteCurrentYear();
            }
        );
    }
    
    deleteCurrentYear() {
        delete this.data.years[this.currentYear];
        
        const yearSelect = document.getElementById('yearSelect');
        if (!yearSelect) return;
        
        const optionToRemove = yearSelect.querySelector(`option[value="${this.currentYear}"]`);
        if (optionToRemove) {
            yearSelect.removeChild(optionToRemove);
        }
        
        const remainingYears = Object.keys(this.data.years);
        this.currentYear = remainingYears[0];
        yearSelect.value = this.currentYear;
        
        this.updateAllDisplays();
        this.showToast('Year deleted successfully', 'success');
    }
    
    // Export
    exportSummary() {
        const bills = this.getCurrentBills();
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const monthName = monthNames[parseInt(this.currentMonth) - 1];
        
        let summary = `Grind2Whale🐋 Summary for ${monthName} ${this.currentYear}\n`;
        summary += '='.repeat(60) + '\n\n';
        
        const total = bills.reduce((sum, bill) => sum + bill.amount, 0);
        const paid = bills.filter(bill => bill.paid).reduce((sum, bill) => sum + bill.amount, 0);
        const unpaid = total - paid;
        
        summary += `Total Expenses: ${this.formatCurrency(total)}\n`;
        summary += `Total Paid: ${this.formatCurrency(paid)}\n`;
        summary += `Total Unpaid: ${this.formatCurrency(unpaid)}\n`;
        summary += `Percentage Paid: ${total !== 0 ? Math.round((paid / total) * 100) : 0}%\n\n`;
        
        summary += 'Bills:\n';
        summary += '-'.repeat(30) + '\n';
        
        bills.forEach(bill => {
            const status = bill.paid ? 'PAID' : 'UNPAID';
            summary += `${bill.name}: ${this.formatCurrency(bill.amount)} [${status}]\n`;
        });
        
        const blob = new Blob([summary], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grind2whale_${monthName.toLowerCase()}_${this.currentYear}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Summary exported successfully', 'success');
    }
    
    // Delete All Data
    deleteAllData() {
        const confirmationEl = document.getElementById('deleteConfirmation');
        if (!confirmationEl) return;
        
        const confirmation = confirmationEl.value;
        
        if (confirmation !== 'DELETE') {
            this.showToast('Please type DELETE to confirm', 'error');
            return;
        }
        
        this.showConfirmDialog(
            'Delete All Data',
            'This will permanently delete ALL data including bills, investments, and sold investments. This action cannot be undone.',
            () => {
                this.data = {
                    currency: "CHF",
                    platforms: ["Stock Broker", "Crypto Exchange", "Real Estate", "Bonds", "Bank", "P2P Lending", "Commodities"],
                    years: {},
                    baseBills: [],
                    investments: [],
                    soldInvestments: []
                };
                
                confirmationEl.value = '';
                this.initializeDateSelectors();
                this.updateAllDisplays();
                this.renderBaseBills();
                this.renderPlatforms();
                this.populatePlatformSelectors();
                this.updateCharts();
                
                this.showToast('All data deleted successfully', 'success');
            }
        );
    }
    
    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        const firstInput = modal.querySelector('input, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
    
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
        document.body.style.overflow = '';
    }
    
    showConfirmDialog(title, message, callback) {
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        
        if (modalTitle) modalTitle.textContent = title;
        if (modalMessage) modalMessage.textContent = message;
        
        this.pendingAction = callback;
        this.showModal('confirmModal');
    }
    
    showToast(message, type = 'success') {
        const toast = document.getElementById('messageToast');
        const messageSpan = document.getElementById('toastMessage');
        
        if (!toast || !messageSpan) return;
        
        messageSpan.textContent = message;
        toast.className = `toast ${type}`;
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
        
        setTimeout(() => {
            toast.classList.add('hidden');
            toast.className = 'toast hidden';
        }, 3500);
    }
}

// Initialize the application
let financialManager;
document.addEventListener('DOMContentLoaded', () => {
    financialManager = new FinancialManager();
    window.app = financialManager;  // Make globally accessible as 'app'

    // Add year button wiring
    const addYearBtn = document.getElementById('addYearBtn');
    if (addYearBtn) {
        addYearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.app.showAddYearDialog();
        });
    }

    // Subtab switching logic for Investments subtabs
    document.querySelectorAll('.subtab-btn').forEach(button => {
        button.addEventListener('click', () => {
            const parent = button.closest('#investments-tab');
            if (!parent) return;

            // Hide all subtab contents
            parent.querySelectorAll('.subtab-content').forEach(content => {
                content.style.display = 'none';
            });

            // Remove active class on all subtab buttons
            parent.querySelectorAll('.subtab-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Show the selected subtab
            const targetSubtab = button.getAttribute('data-subtab');
            const pane = document.getElementById(targetSubtab);
            if (pane) {
                pane.style.display = 'block';
            }

            // Activate the clicked button
            button.classList.add('active');
        });
    });
});

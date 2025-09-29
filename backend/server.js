const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,
}));

app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://whale2grind.vercel.app/',
        process.env.FRONTEND_URL
    ],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

app.use(express.json());

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Authentication middleware
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
    }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Grind2Whale API is running!' });
});

// Get user's financial data
app.get('/api/user/data', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all user data
        const [billsResult, investmentsResult, soldResult, platformsResult, baseBillsResult] = await Promise.all([
            supabase.from('bills').select('*').eq('user_id', userId),
            supabase.from('investments').select('*').eq('user_id', userId),
            supabase.from('sold_investments').select('*').eq('user_id', userId),
            supabase.from('platforms').select('*').eq('user_id', userId),
            supabase.from('base_bills').select('*').eq('user_id', userId)
        ]);

        // Transform data to match frontend structure
        const years = {};
        if (billsResult.data) {
            billsResult.data.forEach(bill => {
                if (!years[bill.year]) years[bill.year] = {};
                if (!years[bill.year][bill.month]) years[bill.year][bill.month] = [];
                
                years[bill.year][bill.month].push({
                    name: bill.name,
                    amount: parseFloat(bill.amount),
                    paid: bill.paid
                });
            });
        }

        const responseData = {
            currency: 'CHF',
            platforms: platformsResult.data?.map(p => p.name) || [],
            years: years,
            baseBills: baseBillsResult.data?.map(b => ({
                name: b.name,
                amount: parseFloat(b.amount)
            })) || [],
            investments: investmentsResult.data?.map(inv => ({
                name: inv.name,
                amount: parseFloat(inv.amount),
                currency: inv.currency,
                platform: inv.platform,
                monthlyContribution: parseFloat(inv.monthly_contribution),
                purchasePricePerUnit: parseFloat(inv.purchase_price_per_unit),
                quantity: parseFloat(inv.quantity)
            })) || [],
            soldInvestments: soldResult.data?.map(sold => ({
                name: sold.name,
                platform: sold.platform,
                purchaseCurrency: sold.purchase_currency,
                sellCurrency: sold.sell_currency,
                purchasePricePerUnit: parseFloat(sold.purchase_price_per_unit),
                sellPricePerUnit: parseFloat(sold.sell_price_per_unit),
                quantity: parseFloat(sold.quantity),
                purchaseAmount: parseFloat(sold.purchase_amount),
                saleAmount: parseFloat(sold.sale_amount),
                profitLoss: parseFloat(sold.profit_loss),
                profitLossCHF: parseFloat(sold.profit_loss_chf),
                dateSold: sold.date_sold
            })) || []
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// Save user's financial data
app.post('/api/user/data', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const data = req.body;

        // Clear existing data
        await Promise.all([
            supabase.from('bills').delete().eq('user_id', userId),
            supabase.from('investments').delete().eq('user_id', userId),
            supabase.from('sold_investments').delete().eq('user_id', userId),
            supabase.from('platforms').delete().eq('user_id', userId),
            supabase.from('base_bills').delete().eq('user_id', userId)
        ]);

        // Insert platforms
        if (data.platforms && data.platforms.length > 0) {
            const platformsToInsert = data.platforms.map(name => ({
                user_id: userId,
                name: name
            }));
            await supabase.from('platforms').insert(platformsToInsert);
        }

        // Insert base bills
        if (data.baseBills && data.baseBills.length > 0) {
            const baseBillsToInsert = data.baseBills.map(bill => ({
                user_id: userId,
                name: bill.name,
                amount: bill.amount
            }));
            await supabase.from('base_bills').insert(baseBillsToInsert);
        }

        // Insert bills
        if (data.years) {
            const billsToInsert = [];
            Object.keys(data.years).forEach(year => {
                Object.keys(data.years[year]).forEach(month => {
                    data.years[year][month].forEach(bill => {
                        billsToInsert.push({
                            user_id: userId,
                            name: bill.name,
                            amount: bill.amount,
                            paid: bill.paid,
                            year: parseInt(year),
                            month: parseInt(month)
                        });
                    });
                });
            });
            
            if (billsToInsert.length > 0) {
                await supabase.from('bills').insert(billsToInsert);
            }
        }

        // Insert investments
        if (data.investments && data.investments.length > 0) {
            const investmentsToInsert = data.investments.map(inv => ({
                user_id: userId,
                name: inv.name,
                amount: inv.amount,
                currency: inv.currency,
                platform: inv.platform,
                monthly_contribution: inv.monthlyContribution || 0,
                purchase_price_per_unit: inv.purchasePricePerUnit,
                quantity: inv.quantity
            }));
            await supabase.from('investments').insert(investmentsToInsert);
        }

        // Insert sold investments
        if (data.soldInvestments && data.soldInvestments.length > 0) {
            const soldToInsert = data.soldInvestments.map(sold => ({
                user_id: userId,
                name: sold.name,
                platform: sold.platform,
                purchase_currency: sold.purchaseCurrency,
                sell_currency: sold.sellCurrency,
                purchase_price_per_unit: sold.purchasePricePerUnit,
                sell_price_per_unit: sold.sellPricePerUnit,
                quantity: sold.quantity,
                purchase_amount: sold.purchaseAmount,
                sale_amount: sold.saleAmount,
                profit_loss: sold.profitLoss,
                profit_loss_chf: sold.profitLossCHF,
                date_sold: sold.dateSold
            }));
            await supabase.from('sold_investments').insert(soldToInsert);
        }

        res.json({ success: true, message: 'Data saved successfully' });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
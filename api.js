class FinancialAPI {
    constructor() {
        // Replace this with your Railway URL from Step 5.3
        this.baseURL = 'https://your-railway-url.railway.app/api';
        this.token = null;
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    getToken() {
        if (!this.token) {
            this.token = localStorage.getItem('auth_token');
        }
        return this.token;
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        const token = this.getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            
            if (response.status === 401) {
                this.clearToken();
                // Redirect to login or show login form
                return null;
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async loadData() {
        return this.request('/user/data');
    }

    async saveData(data) {
        return this.request('/user/data', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async testConnection() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}
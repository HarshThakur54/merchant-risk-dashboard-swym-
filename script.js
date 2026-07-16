// Mock Data Generator
function generateMockMerchants(count = 15) {
    const names = ['Acme Corp', 'TechFlow', 'DataSync', 'CloudNine', 'Nexus Innovations', 'Alpha Solutions', 'Beta Dynamics', 'Gamma Systems', 'Delta Logistics', 'Epsilon Media', 'Zeta Networks', 'Eta Security', 'Theta Analytics', 'Iota Designs', 'Kappa Ventures'];
    const tiers = ['Basic', 'Pro', 'Enterprise'];
    
    return Array.from({ length: count }, (_, i) => {
        // Randomize data to show different scenarios
        const usageDrop = Math.random() > 0.6 ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 20) - 10;
        const daysSinceLogin = Math.floor(Math.random() * 30);
        const today = new Date();
        const loginDate = new Date(today);
        loginDate.setDate(today.getDate() - daysSinceLogin);
        
        return {
            id: `MCH-${1000 + i}`,
            name: names[i] || `Merchant ${i}`,
            planTier: tiers[Math.floor(Math.random() * tiers.length)],
            signupDate: '2025-01-15T10:00:00Z',
            lastLoginDate: loginDate.toISOString(),
            supportTicketsOpen: Math.random() > 0.7 ? Math.floor(Math.random() * 6) + 2 : Math.floor(Math.random() * 2),
            paymentDeclined: Math.random() > 0.85,
            usageDropPercentage: usageDrop
        };
    });
}

// Logic to determine risk and next steps based on v1_spec
function analyzeMerchant(merchant) {
    const daysSinceLogin = (new Date() - new Date(merchant.lastLoginDate)) / (1000 * 60 * 60 * 24);
    
    let riskLevel = 'Healthy';
    let primarySignal = 'None';
    let nextStep = 'Monitor.';

    if (merchant.paymentDeclined) {
        riskLevel = 'High';
        primarySignal = 'Payment Declined';
        nextStep = 'Send automated billing reminder & link to update payment method.';
    } else if (merchant.usageDropPercentage > 30) {
        riskLevel = 'Medium';
        primarySignal = `Usage Drop (${merchant.usageDropPercentage}%)`;
        nextStep = 'Schedule a Customer Success check-in to discuss feature adoption.';
    } else if (merchant.supportTicketsOpen > 3) {
        riskLevel = 'Medium';
        primarySignal = `High Support Tickets (${merchant.supportTicketsOpen})`;
        nextStep = 'Escalate open tickets to Tier 2 support immediately.';
    } else if (daysSinceLogin > 14) {
        riskLevel = 'Low';
        primarySignal = `Stale Login (${Math.floor(daysSinceLogin)} days)`;
        nextStep = 'Send re-engagement email campaign highlighting new features.';
    }

    return { ...merchant, riskLevel, primarySignal, nextStep };
}

let merchantsData = [];

// Initialize Dashboard
function initDashboard() {
    generateRandomData();
    
    // Event Listeners for Filters
    document.getElementById('search-input').addEventListener('input', renderTable);
    document.getElementById('filter-select').addEventListener('change', renderTable);

    // Sidebar navigation mock
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            if (!item.classList.contains('active')) {
                alert('This is a mockup link to make the dashboard look like a real app. For the Swym assignment, only the main Risk Dashboard view was required!');
            }
        });
    });
}

function generateRandomData() {
    const rawData = generateMockMerchants(12);
    merchantsData = rawData.map(analyzeMerchant);
    
    // Sort by risk (High -> Medium -> Low -> Healthy)
    const riskWeight = { 'High': 3, 'Medium': 2, 'Low': 1, 'Healthy': 0 };
    merchantsData.sort((a, b) => riskWeight[b.riskLevel] - riskWeight[a.riskLevel]);
    
    updateSummaryCards();
    renderTable();
}

function updateSummaryCards() {
    const counts = { High: 0, Medium: 0, Low: 0, Healthy: 0 };
    merchantsData.forEach(m => counts[m.riskLevel]++);
    
    document.getElementById('high-risk-count').textContent = counts.High;
    document.getElementById('medium-risk-count').textContent = counts.Medium;
    document.getElementById('low-risk-count').textContent = counts.Low;
    document.getElementById('healthy-count').textContent = counts.Healthy;
}

function renderTable() {
    const tbody = document.getElementById('merchant-table-body');
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const riskFilter = document.getElementById('filter-select').value;
    
    tbody.innerHTML = '';
    
    const filteredData = merchantsData.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchTerm) || m.id.toLowerCase().includes(searchTerm);
        const matchesRisk = riskFilter === 'all' || m.riskLevel === riskFilter;
        return matchesSearch && matchesRisk;
    });

    filteredData.forEach(merchant => {
        const tr = document.createElement('tr');
        
        const riskBadgeClass = `risk-${merchant.riskLevel.toLowerCase()}`;
        
        tr.innerHTML = `
            <td>
                <div class="merchant-cell">
                    <span class="merchant-name">${merchant.name}</span>
                    <span class="merchant-id">${merchant.id}</span>
                </div>
            </td>
            <td>${merchant.planTier}</td>
            <td><span class="badge-risk ${riskBadgeClass}">${merchant.riskLevel}</span></td>
            <td><span class="signal-text">${merchant.primarySignal}</span></td>
            <td><span class="recommendation-text">${merchant.nextStep}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="alert('Executing action for ${merchant.name}...')">Take Action</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Start
document.addEventListener('DOMContentLoaded', initDashboard);

// DYNAMIC DATA GENERATOR: Generates merchant data on the fly
function generateDynamicMerchants(count = 25) {
    const names = ["Acme Corp", "Globex Inc", "Initech", "Soylent Corp", "Massive Dynamic", "Stark Industries", "Wayne Enterprises", "Cyberdyne", "Umbrella Corp", "Hooli", "Pied Piper", "Aviato", "Vandelay Ind", "Dunder Mifflin", "Oscorp", "Los Pollos", "Tyrell Corp", "Wonka Ind", "Gringotts", "Daily Planet"];
    const plans = [{ tier: "Basic", mrr: 49 }, { tier: "Pro", mrr: 299 }, { tier: "Enterprise", mrr: 1200 }];
    const paymentStatuses = ["Healthy", "Healthy", "Healthy", "Healthy", "Past Due", "Expiring Soon"];
    
    const merchants = [];
    
    for (let i = 0; i < count; i++) {
        const plan = plans[Math.floor(Math.random() * plans.length)];
        const payment = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
        
        // Randomly simulate different user states to hit edge cases
        const isNewUser = Math.random() > 0.8; // 20% are new
        const isPowerUser = Math.random() > 0.7; // 30% are power users
        const hasBugs = Math.random() > 0.8; // 20% have support issues

        const tenure = isNewUser ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 48) + 4;
        const logins = isPowerUser ? Math.floor(Math.random() * 50) + 20 : Math.floor(Math.random() * 10);
        const featureUsage = isPowerUser ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 40);
        const tickets = hasBugs ? Math.floor(Math.random() * 4) + 3 : Math.floor(Math.random() * 2);
        
        // Randomize days until renewal, slightly weighting towards upcoming renewals to show off the edge case
        const isExpiringSoon = Math.random() > 0.7; // 30% chance of renewing soon
        const daysToRenew = isExpiringSoon ? Math.floor(Math.random() * 30) + 1 : Math.floor(Math.random() * 335) + 31;

        merchants.push({
            id: `M-${1000 + i}`,
            name: names[i % names.length] + (i >= names.length ? ` ${Math.floor(i/names.length)+1}` : ''),
            planTier: plan.tier,
            mrr: plan.mrr,
            tenureMonths: tenure,
            loginsLast30Days: logins,
            coreFeatureUsage: featureUsage,
            openSupportTickets: tickets,
            paymentStatus: payment,
            daysUntilRenewal: daysToRenew
        });
    }
    return merchants;
}

let MOCK_MERCHANTS = generateDynamicMerchants(25);
let ACTIVITY_LOG = [];

// LOGIC: Evaluate Churn Risk Signals
function evaluateMerchantRisk(merchant) {
    // Default Risk before escalation checks
    let riskResult = {
        level: "Low",
        signal: "Healthy Metrics",
        recommendation: "No action needed. Continue standard marketing drips."
    };

    // 1. Payment Risk (Direct revenue threat)
    if (merchant.paymentStatus === "Past Due") {
        if (merchant.planTier === "Enterprise") {
            riskResult = {
                level: "High",
                signal: "Enterprise Payment Past Due",
                recommendation: "Urgent: Contact the Account Executive and follow up with the Accounts Payable team."
            };
        } else {
            riskResult = {
                level: "High",
                signal: "Payment Past Due",
                recommendation: "Send automated billing update link. Pause account in 7 days."
            };
        }
    } else if (merchant.paymentStatus === "Expiring Soon") {
        riskResult = {
            level: "Medium",
            signal: "Card Expiring Soon",
            recommendation: "Send proactive card update reminder."
        };
    }
    
    // 2. Early Churn Risk (High priority because early adoption is critical)
    else if (merchant.tenureMonths <= 3 && (merchant.loginsLast30Days <= 2 || merchant.coreFeatureUsage < 30)) {
        if (merchant.planTier === "Basic") {
            riskResult = {
                level: "High",
                signal: "Early Churn Risk (Low Adoption)",
                recommendation: "Trigger automated 'Getting Started' email drip campaign."
            };
        } else {
            riskResult = {
                level: "High",
                signal: "Early Churn Risk (Low Adoption)",
                recommendation: "Mandate a 1-on-1 onboarding sync call."
            };
        }
    }

    // 3. Usage Drop-off (Standard churn indicator)
    else if (merchant.loginsLast30Days <= 2 || merchant.coreFeatureUsage < 10) {
        if (merchant.tenureMonths >= 24 || merchant.planTier === "Enterprise") {
            riskResult = {
                level: "Medium",
                signal: "Usage Drop-off (Long-term/Enterprise)",
                recommendation: "Send an automated check-in email. Monitor next month before escalating."
            };
        } else {
            riskResult = {
                level: "High",
                signal: "Severe Usage Drop-off",
                recommendation: "Schedule a re-engagement product walkthrough."
            };
        }
    }

    // 3b. Enterprise Downgrade / Contraction Risk (New Logic)
    else if (merchant.planTier === "Enterprise" && merchant.loginsLast30Days > 2 && merchant.coreFeatureUsage < 30) {
        riskResult = {
            level: "Medium",
            signal: "Contraction Risk (Low Value Extraction)",
            recommendation: "Schedule feature training or prepare a retention offer. High downgrade risk."
        };
    }

    // 4. Support Friction (Indicates frustration, potential downgrade/churn)
    else if (merchant.openSupportTickets >= 3) {
        const isPowerUser = merchant.loginsLast30Days > 20 && merchant.coreFeatureUsage > 70;
        
        if (!isPowerUser) {
            riskResult = {
                level: "Medium",
                signal: "High Support Friction (Low/Avg Engagement)",
                recommendation: "CS Manager to personally reach out and expedite ticket resolution."
            };
        }
    }

    // RENEWAL ESCALATION LOGIC
    // If they are Medium Risk but renewing in <= 30 days, we run out of time to save them. Escalate to High Risk.
    if (riskResult.level === "Medium" && merchant.daysUntilRenewal <= 30) {
        riskResult.level = "High";
        riskResult.signal = `[ESCALATED] ${riskResult.signal}`;
        riskResult.recommendation = `URGENT (Renews in ${merchant.daysUntilRenewal} days): ${riskResult.recommendation}`;
    }

    return riskResult;
}

// UI RENDERING
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

function renderTable(merchants) {
    const tbody = document.getElementById('merchant-table-body');
    tbody.innerHTML = '';
    
    let highRiskCount = 0;

    merchants.forEach(merchant => {
        const risk = evaluateMerchantRisk(merchant);
        
        if (risk.level === 'High') highRiskCount++;

        const tr = document.createElement('tr');
        
        // Helper classes for visual warnings
        const loginClass = merchant.loginsLast30Days <= 2 ? 'warning' : '';
        const ticketClass = merchant.openSupportTickets >= 3 ? 'warning' : '';
        const paymentClass = merchant.paymentStatus === 'Past Due' ? 'warning' : '';
        const renewalClass = merchant.daysUntilRenewal <= 30 ? 'warning' : '';

        tr.innerHTML = `
            <td class="merchant-info">
                <div class="name">${merchant.name}</div>
                <div class="id">${merchant.id} • ${merchant.tenureMonths} mo tenure</div>
            </td>
            <td class="plan-info">
                <div class="plan">${merchant.planTier}</div>
                <div class="mrr">${formatCurrency(merchant.mrr)}/mo</div>
                <div class="id ${renewalClass}" style="margin-top: 4px;">Renews in ${merchant.daysUntilRenewal} days</div>
            </td>
            <td>
                <ul class="metrics-list">
                    <li class="${loginClass}">Logins (30d): <strong>${merchant.loginsLast30Days}</strong></li>
                    <li>Feature Score: <strong>${merchant.coreFeatureUsage}/100</strong></li>
                    <li class="${ticketClass}">Tickets: <strong>${merchant.openSupportTickets}</strong></li>
                    <li class="${paymentClass}">Billing: <strong>${merchant.paymentStatus}</strong></li>
                </ul>
            </td>
            <td>
                <span class="risk-badge risk-${risk.level}">${risk.level}</span>
            </td>
            <td class="action-cell">
                <span class="signal-reason">Trigger: ${risk.signal}</span>
                <div class="recommendation">${risk.recommendation}</div>
                ${risk.level !== 'Low' ? '<button class="action-btn">Take Action</button>' : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Update Header Stat
    document.getElementById('high-risk-count').textContent = highRiskCount;

    // Attach event listeners to action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            const merchantName = row.querySelector('.name').textContent;
            
            // Visual feedback: animate row removal
            row.style.opacity = '0';
            row.style.transform = 'translateX(20px)';
            row.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                row.remove();
                
                // Log activity
                const now = new Date();
                const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                const actionTaken = risk.recommendation;
                
                ACTIVITY_LOG.unshift({
                    time: timeString,
                    merchant: merchantName,
                    action: actionTaken
                });
                
                // Remove from global state
                MOCK_MERCHANTS = MOCK_MERCHANTS.filter(m => m.name !== merchantName);

                // Update views
                renderRecentActivity();
                renderMerchantsGrid();
                
                // Update high risk count if we removed a high risk merchant
                if (row.querySelector('.risk-High')) {
                    const countEl = document.getElementById('high-risk-count');
                    countEl.textContent = Math.max(0, parseInt(countEl.textContent) - 1);
                }
                
                // Optional: alert can be removed since we have the activity feed now, 
                // but keeping it small or just letting the feed handle it.
            }, 300);
        });
    });
}

// FILTERING LOGIC
function applyFilter(filterLevel) {
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filterLevel);
    });

    // Filter and sort data
    // We always sort High risk to the top
    let filteredData = MOCK_MERCHANTS.map(m => ({ ...m, risk: evaluateMerchantRisk(m) }));
    
    if (filterLevel !== 'all') {
        filteredData = filteredData.filter(m => m.risk.level === filterLevel);
    } else {
        // Sort: High > Medium > Low
        const order = { 'High': 1, 'Medium': 2, 'Low': 3 };
        filteredData.sort((a, b) => order[a.risk.level] - order[b.risk.level]);
    }

    renderTable(filteredData);
}

// NEW VIEWS RENDERING
function renderMerchantsGrid() {
    const grid = document.getElementById('merchants-grid-body');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    MOCK_MERCHANTS.forEach(merchant => {
        const card = document.createElement('div');
        card.className = 'merchant-card';
        card.innerHTML = `
            <div class="name">${merchant.name}</div>
            <div class="id">${merchant.id} • ${merchant.tenureMonths} mo tenure</div>
            <div class="plan">${merchant.planTier} • ${formatCurrency(merchant.mrr)}/mo</div>
            <div class="stats">
                <div>Logins (30d)<strong>${merchant.loginsLast30Days}</strong></div>
                <div>Feature Score<strong>${merchant.coreFeatureUsage}/100</strong></div>
                <div>Support Tickets<strong>${merchant.openSupportTickets}</strong></div>
                <div>Billing Status<strong>${merchant.paymentStatus}</strong></div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderRecentActivity() {
    const feed = document.getElementById('activity-feed-body');
    if (!feed) return;
    
    feed.innerHTML = '';
    
    if (ACTIVITY_LOG.length === 0) {
        feed.innerHTML = `<div class="empty-state">No recent activity. Actions taken on the dashboard will appear here.</div>`;
        return;
    }
    
    ACTIVITY_LOG.forEach(log => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div class="activity-time">${log.time}</div>
            <div class="activity-title">Action taken for ${log.merchant}</div>
            <div class="activity-desc">${log.action}</div>
        `;
        feed.appendChild(item);
    });
}

// INITIALIZE & SPA NAVIGATION
document.addEventListener('DOMContentLoaded', () => {
    // Navigation Logic
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.dataset.target;
            if (!targetId) return;

            // Update active state in sidebar
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');

            // Switch views
            document.querySelectorAll('.view-section').forEach(view => view.classList.add('hidden'));
            document.getElementById(targetId).classList.remove('hidden');
        });
    });

    // Add Event Listeners for dashboard filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            applyFilter(e.target.dataset.filter);
        });
    });

    // Initial Renders
    applyFilter('all');
    renderMerchantsGrid();
    renderRecentActivity();
});

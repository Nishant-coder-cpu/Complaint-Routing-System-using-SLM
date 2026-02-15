const supabase = require('../config/supabase');

/**
 * Admin Chatbot Service
 * Translates natural language queries into structured database queries
 * NO hallucinations - only returns actual data from database
 */

// Intent patterns with keywords
const intents = {
    criticalCount: {
        keywords: ['critical', 'urgent', 'high', 'severity', 'unresolved', 'pending'],
        // Relaxed requirement: just needs to mention critical/high severity
        // The query handler will filter for unresolved by default as that's what's usually important
    },
    totalComplaints: {
        keywords: ['total', 'how many', 'count', 'number of'],
    },
    slaBreaches: {
        keywords: ['sla', 'breach', 'overdue', 'late', 'deadline'],
    },
    departmentMost: {
        keywords: ['department', 'most', 'highest', 'which'],
    },
    recentComplaints: {
        keywords: ['recent', 'latest', 'last', 'new', 'show', 'list'],
        requiresAll: ['recent'], // or 'latest', handled in logic
    },
    statusBreakdown: {
        keywords: ['status', 'breakdown', 'distribution'],
    },
    greeting: {
        keywords: ['hi', 'hello', 'hey', 'greetings', 'morning', 'afternoon', 'evening'],
    },
    help: {
        keywords: ['help', 'what can you do', 'features', 'assist'],
    }
};

// Detect intent from user message
function detectIntent(message) {
    const lowerMessage = message.toLowerCase();

    for (const [intent, config] of Object.entries(intents)) {
        const matchedKeywords = config.keywords.filter(kw => lowerMessage.includes(kw));

        if (config.requiresAll) {
            const hasAll = config.requiresAll.every(kw => lowerMessage.includes(kw));
            if (hasAll) return intent;
        } else if (intent === 'criticalCount' && (lowerMessage.includes('critical') || lowerMessage.includes('high'))) {
            return intent;
        } else if (intent === 'recentComplaints' && (lowerMessage.includes('recent') || lowerMessage.includes('latest'))) {
            return intent;
        } else if ((intent === 'greeting' || intent === 'help') && matchedKeywords.length >= 1) {
            return intent;
        } else if (matchedKeywords.length >= 2) {
            return intent;
        }
    }

    return 'unknown';
}

const aiService = require('./ai.service');

// ... (intents definitions remain same)

// Execute structured query based on intent
async function executeQuery(intent, userMessage) {
    try {
        switch (intent) {
            // ... (existing cases remain same)
            case 'criticalCount': {
                const { count } = await supabase
                    .from('complaints')
                    .select('*', { count: 'exact', head: true })
                    .eq('severity', 'High')
                    .neq('status', 'resolved');

                return {
                    answer: `There are **${count || 0}** critical (High severity) complaints that are currently unresolved.`,
                    data: { count: count || 0 },
                    type: 'metric'
                };
            }
            // ... (other cases)

            case 'totalComplaints': {
                const { count } = await supabase
                    .from('complaints')
                    .select('*', { count: 'exact', head: true });

                return {
                    answer: `There are **${count || 0}** complaints in the system.`,
                    data: { count: count || 0 },
                    type: 'metric'
                };
            }

            case 'slaBreaches': {
                const now = new Date().toISOString();
                const { count } = await supabase
                    .from('complaints')
                    .select('*', { count: 'exact', head: true })
                    .neq('status', 'resolved')
                    .lt('sla_deadline', now);

                return {
                    answer: `There are **${count || 0}** active complaints with SLA breaches.`,
                    data: { count: count || 0 },
                    type: 'metric'
                };
            }

            case 'departmentMost': {
                const { data } = await supabase
                    .from('complaints')
                    .select('route_to');

                if (!data || data.length === 0) {
                    return {
                        answer: 'No complaints found in the system.',
                        type: 'info'
                    };
                }

                const deptCount = data.reduce((acc, item) => {
                    acc[item.route_to] = (acc[item.route_to] || 0) + 1;
                    return acc;
                }, {});

                const topDept = Object.entries(deptCount)
                    .sort(([, a], [, b]) => b - a)[0];

                return {
                    answer: `**${topDept[0]}** has the most complaints with **${topDept[1]}** total.`,
                    data: { department: topDept[0], count: topDept[1] },
                    type: 'metric'
                };
            }

            case 'recentComplaints': {
                const { data } = await supabase
                    .from('complaints')
                    .select('id, severity, status, created_at')
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (!data || data.length === 0) {
                    return {
                        answer: 'No recent complaints found.',
                        type: 'info'
                    };
                }

                const list = data.map(c =>
                    `- **${c.severity}** severity, Status: ${c.status}`
                ).join('\n');

                return {
                    answer: `Here are the 5 most recent complaints:\n${list}`,
                    data: data,
                    type: 'list'
                };
            }

            case 'statusBreakdown': {
                const { data } = await supabase
                    .from('complaints')
                    .select('status');

                if (!data || data.length === 0) {
                    return {
                        answer: 'No complaints found in the system.',
                        type: 'info'
                    };
                }

                const statusCount = data.reduce((acc, item) => {
                    acc[item.status] = (acc[item.status] || 0) + 1;
                    return acc;
                }, {});

                const breakdown = Object.entries(statusCount)
                    .map(([status, count]) => `- **${status}**: ${count}`)
                    .join('\n');

                return {
                    answer: `Status breakdown:\n${breakdown}`,
                    data: statusCount,
                    type: 'breakdown'
                };
            }

            case 'greeting': {
                return {
                    answer: 'Hello! 👋 I am your Admin Assistant. I can help you track complaints, SLA breaches, and system statistics. What would you like to know?',
                    type: 'chat'
                };
            }

            case 'help': {
                return {
                    answer: 'I can help you analyze system data. Try asking:\n- **"Show recent complaints"**\n- **"How many critical issues?"**\n- **"Which department has the most complaints?"**\n- **"Show status breakdown"**',
                    type: 'help'
                };
            }

            default:
                // Fallback for unknown intents
                // AI Chat is currently disabled due to model output issues
                return {
                    answer: "I'm tuned to help with **complaint statistics** and **system data**. \n\nI can't answer general questions right now, but I can tell you about:\n- Complaint counts & severity\n- Department performance\n- SLA breaches\n- Recent activity",
                    type: 'fallback'
                };
        }
    } catch (error) {
        console.error('Chatbot query error:', error);
        return {
            answer: 'Sorry, I encountered an error while fetching data.',
            type: 'error'
        };
    }
}

// Main chatbot function
async function chat(userMessage) {
    const intent = detectIntent(userMessage);
    const response = await executeQuery(intent, userMessage);

    return {
        query: userMessage,
        intent,
        ...response,
        timestamp: new Date().toISOString()
    };
}

module.exports = { chat };

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase with Service Key to bypass RLS
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedCommunity() {
    console.log('Seeding Community Pulse...');

    // 1. Get a valid user to attribute complaints to (or created a dummy one if needed)
    // For simplicity, we'll try to get the first user from auth.users
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

    if (userError || !users || users.length === 0) {
        console.error('Error: No users found to attach complaints to.', userError);
        return;
    }

    const userId = users[0].id;
    console.log(`Attributing complaints to user: ${userId}`);

    const dummyComplaints = [
        {
            user_id: userId,
            complaint_text: "The library AC has been broken for 3 days. It's impossible to study there during the afternoon.",
            categories: ['Infrastructure'],
            severity: 'Normal',
            route_to: 'Infrastructure',
            sla_hours: 48,
            sla_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            predicted_resolution_days: 2,
            ai_confidence: 0.95
        },
        {
            user_id: userId,
            complaint_text: "Cafeteria food quality has dropped significantly this week. Found undercooked rice today.",
            categories: ['Food'],
            severity: 'High',
            status: 'in_progress',
            visibility: 'public',
            anonymous: true,
            route_to: 'Student Affairs',
            sla_hours: 24,
            sla_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            predicted_resolution_days: 1,
            ai_confidence: 0.88
        },
        {
            user_id: userId,
            complaint_text: "Bus 42 is consistently 20 minutes late every morning. Please adjust the schedule or add more buses.",
            categories: ['Transport'],
            severity: 'Normal',
            status: 'pending',
            visibility: 'public',
            anonymous: false,
            route_to: 'Transport',
            sla_hours: 72,
            sla_deadline: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
            predicted_resolution_days: 3,
            ai_confidence: 0.92
        },
        {
            user_id: userId,
            complaint_text: "WiFi in the common room is extremely slow. Can we get an extender installed?",
            categories: ['IT'],
            severity: 'Normal',
            status: 'resolved',
            visibility: 'public',
            anonymous: false,
            route_to: 'IT Support',
            sla_hours: 48,
            sla_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            predicted_resolution_days: 2,
            ai_confidence: 0.98
        },
        {
            user_id: userId,
            complaint_text: "Found a lost student ID card near the main gate. Handed it to security.",
            categories: ['Security'],
            severity: 'Normal',
            status: 'resolved',
            visibility: 'public',
            anonymous: true,
            route_to: 'Security',
            sla_hours: 24,
            sla_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            predicted_resolution_days: 1,
            ai_confidence: 0.99
        },
        {
            user_id: userId,
            complaint_text: "Water cooler on the 2nd floor is leaking.",
            categories: ['Infrastructure'],
            severity: 'Normal',
            status: 'pending',
            visibility: 'public',
            anonymous: true,
            route_to: 'Infrastructure',
            sla_hours: 48,
            sla_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            predicted_resolution_days: 2,
            ai_confidence: 0.90
        }
    ];

    for (const complaint of dummyComplaints) {
        const { error } = await supabase
            .from('complaints')
            .insert(complaint);

        if (error) {
            console.error(`Error inserting complaint '${complaint.complaint_text.substring(0, 20)}...':`, error.message);
        } else {
            console.log(`Inserted: ${complaint.complaint_text.substring(0, 20)}...`);
        }
    }

    console.log('Seeding complete!');
    process.exit(0);
}

seedCommunity();

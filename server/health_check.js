async function quickTest() {
    console.log("Starting API Health Check...");
    const baseUrl = 'http://localhost:3001';

    try {
        // 1. Check Backend Health
        const empRes = await fetch(`${baseUrl}/api/employees`);
        if (!empRes.ok) throw new Error("Backend not responding yet");
        const employees = (await empRes.json()).data;
        console.log(`✅ Backend up. Found ${employees.length} employees.`);

        // 2. Check Plans
        const plansRes = await fetch(`${baseUrl}/api/plans`);
        const plans = (await plansRes.json()).data;
        console.log(`✅ API reachable. Current total plans: ${plans.length}`);

        // 3. Test Login
        const loginRes = await fetch(`${baseUrl}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'YIBELTAL' })
        });
        if (loginRes.ok) console.log("✅ Login API working.");

        console.log("\nSystem seems healthy.");
    } catch (e) {
        console.error("❌ Test failed:", e.message);
    }
}
quickTest();

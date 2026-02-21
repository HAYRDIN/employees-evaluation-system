async function test() {
    try {
        const response = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'YIBELTAL' })
        });
        const data = await response.json();
        console.log('Login Test SUCCESS:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Login Test FAILED:', err.message);
        process.exit(1);
    }
}
test();

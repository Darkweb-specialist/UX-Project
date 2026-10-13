const http = require('http');
const app = require('../server');

const PORT = 5055; // Use dedicated port for automated test run
let server;

const request = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({
              statusCode: res.statusCode,
              body: JSON.parse(data),
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              body: data,
            });
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

async function runTests() {
  console.log('\n==================================================');
  console.log('🧪 Starting Smart Food Donation API Automated Tests');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  server = app.listen(PORT, async () => {
    try {
      // Test 1: Health check
      process.stdout.write('Test 1: Health Check GET /api/health ... ');
      const healthRes = await request('GET', '/api/health');
      if (healthRes.statusCode === 200 && healthRes.body.status === 'ok') {
        console.log('✅ PASSED');
        passed++;
      } else {
        console.log('❌ FAILED', healthRes);
        failed++;
      }

      // Test 2: List donations
      process.stdout.write('Test 2: List Donations GET /api/donations ... ');
      const listRes = await request('GET', '/api/donations');
      if (listRes.statusCode === 200 && Array.isArray(listRes.body.data) && listRes.body.data.length > 0) {
        console.log(`✅ PASSED (${listRes.body.data.length} items returned)`);
        passed++;
      } else {
        console.log('❌ FAILED', listRes);
        failed++;
      }

      // Test 3: Create donation
      process.stdout.write('Test 3: Create Donation POST /api/donations ... ');
      const testDonation = {
        foodName: 'Test Catered Sandwich Platter',
        category: 'Bakery & Bread',
        quantity: '10',
        unit: 'platters',
        description: 'Automated test batch of fresh sandwiches.',
        preparedAt: 'Today, 11:00 AM',
        pickupDeadline: 'Today, 6:00 PM',
        pickupAddress: 'Test Kitchen Lab, Sector 5',
        donorPhone: '+91 91234 56789',
        donorName: 'Test Kitchen Donor',
      };

      const createRes = await request('POST', '/api/donations', testDonation);
      let createdId = null;
      if (createRes.statusCode === 201 && createRes.body.success) {
        createdId = createRes.body.data.id;
        console.log(`✅ PASSED (Created donation ID: ${createdId})`);
        passed++;
      } else {
        console.log('❌ FAILED', createRes);
        failed++;
      }

      // Test 4: Retrieve donation details
      if (createdId) {
        process.stdout.write(`Test 4: Get Donation GET /api/donations/${createdId} ... `);
        const getRes = await request('GET', `/api/donations/${createdId}`);
        if (getRes.statusCode === 200 && getRes.body.data.foodName === testDonation.foodName) {
          console.log('✅ PASSED');
          passed++;
        } else {
          console.log('❌ FAILED', getRes);
          failed++;
        }
      }

      // Test 5: Create pickup request
      process.stdout.write('Test 5: Create Pickup POST /api/pickups ... ');
      const testPickup = {
        donationId: createdId || 'don-1',
        foodName: 'Test Catered Sandwich Platter',
        quantity: '10 platters',
        receiverName: 'Test NGO Volunteer',
        receiverPhone: '+91 99887 76655',
        pickupTimeEstimated: 'Within 30 mins',
        pickupAddress: 'Test Kitchen Lab, Sector 5',
        notes: 'Automated test pickup request',
      };

      const pickupRes = await request('POST', '/api/pickups', testPickup);
      let pickupId = null;
      if (pickupRes.statusCode === 201 && pickupRes.body.success) {
        pickupId = pickupRes.body.data.id;
        console.log(`✅ PASSED (Pickup request ID: ${pickupId})`);
        passed++;
      } else {
        console.log('❌ FAILED', pickupRes);
        failed++;
      }

      // Test 6: Update status
      if (createdId) {
        process.stdout.write(`Test 6: Update Status PATCH /api/donations/${createdId}/status ... `);
        const statusRes = await request('PATCH', `/api/donations/${createdId}/status`, {
          status: 'Accepted',
        });
        if (statusRes.statusCode === 200 && statusRes.body.success) {
          console.log('✅ PASSED');
          passed++;
        } else {
          console.log('❌ FAILED', statusRes);
          failed++;
        }
      }

      // Test 7: Get stats
      process.stdout.write('Test 7: Summary Stats GET /api/stats ... ');
      const statsRes = await request('GET', '/api/stats');
      if (statsRes.statusCode === 200 && statsRes.body.data.totalDonations >= 1) {
        console.log('✅ PASSED');
        passed++;
      } else {
        console.log('❌ FAILED', statsRes);
        failed++;
      }

      console.log('\n--------------------------------------------------');
      console.log(`Test Summary: ${passed} Passed, ${failed} Failed`);
      console.log('--------------------------------------------------\n');

      server.close(() => {
        process.exit(failed > 0 ? 1 : 0);
      });
    } catch (err) {
      console.error('\nTest Execution Error:', err);
      if (server) server.close();
      process.exit(1);
    }
  });
}

runTests();

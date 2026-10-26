// Comprehensive Backend Integration Test Script
// Tests all 14 academic and functional requirements against live Express + PostgreSQL API

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log(' CampusBite Automated API Test Suite Execution');
  console.log('====================================================\n');

  const results = [];

  const recordResult = (num, name, expected, actual, pass) => {
    results.push({ num, name, expected, actual, status: pass ? 'PASS' : 'FAIL' });
    console.log(`[TEST ${num}] ${name}`);
    console.log(`  Expected: ${expected}`);
    console.log(`  Actual:   ${actual}`);
    console.log(`  Result:   ${pass ? '✔ PASS' : '❌ FAIL'}\n`);
  };

  try {
    // 1. Menu items load successfully
    const menuRes = await fetch(`${BASE_URL}/menu`);
    const menuData = await menuRes.json();
    const test1Pass = menuRes.status === 200 && menuData.success === true && menuData.data.length >= 6;
    recordResult(
      1,
      'Menu items load successfully',
      'HTTP 200 with array of menu items',
      `HTTP ${menuRes.status}, items returned: ${menuData.data ? menuData.data.length : 0}`,
      test1Pass
    );

    const dosa = menuData.data.find(i => i.name === 'Masala Dosa');
    const tea = menuData.data.find(i => i.name === 'Tea');
    const soldOutItem = menuData.data.find(i => !i.isAvailable);

    // 2. A student can place a valid order
    const orderPayload = {
      studentName: 'Aarav Sharma',
      studentId: 'CS2026-042',
      pickupTime: 'In 20 mins',
      items: [
        { menuItemId: dosa.id, quantity: 2 }, // 2 * 60 = 120
        { menuItemId: tea.id, quantity: 1 }    // 1 * 15 = 15
      ]
    };
    const orderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    const orderData = await orderRes.json();
    const createdOrder = orderData.data;
    const test2Pass = orderRes.status === 201 && orderData.success === true && createdOrder?.id > 0;
    recordResult(
      2,
      'Student can place a valid order',
      'HTTP 201 with created Order record and assigned ID',
      `HTTP ${orderRes.status}, Order ID: #${createdOrder?.id}, Status: ${createdOrder?.status}`,
      test2Pass
    );

    // 3. Order total is calculated correctly on server
    // Expected: 2 * 60.00 + 1 * 15.00 = 135.00
    const expectedTotal = 135.00;
    const actualTotal = parseFloat(createdOrder?.totalAmount);
    const test3Pass = actualTotal === expectedTotal;
    recordResult(
      3,
      'Order total calculated correctly on server',
      `Total calculated as ₹${expectedTotal.toFixed(2)} on server directly from DB prices`,
      `totalAmount returned: ₹${actualTotal.toFixed(2)}`,
      test3Pass
    );

    // 4. Invalid quantities are rejected
    const invalidQtyRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: 'Rohan Verma',
        studentId: 'CS2026-015',
        pickupTime: 'In 15 mins',
        items: [{ menuItemId: dosa.id, quantity: -2 }]
      })
    });
    const invalidQtyData = await invalidQtyRes.json();
    const test4Pass = invalidQtyRes.status === 400 && invalidQtyData.success === false;
    recordResult(
      4,
      'Invalid quantities are rejected',
      'HTTP 400 Bad Request with validation error message',
      `HTTP ${invalidQtyRes.status}, Error: ${JSON.stringify(invalidQtyData.error?.details || invalidQtyData.error?.message)}`,
      test4Pass
    );

    // 5. Unavailable food items cannot be ordered
    const unavailableRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: 'Priya Patel',
        studentId: 'EC2026-088',
        pickupTime: 'In 10 mins',
        items: [{ menuItemId: soldOutItem.id, quantity: 1 }]
      })
    });
    const unavailableData = await unavailableRes.json();
    const test5Pass = unavailableRes.status === 400 && unavailableData.error?.message.includes('sold out');
    recordResult(
      5,
      'Unavailable food items cannot be ordered',
      'HTTP 400 Bad Request rejecting unavailable item',
      `HTTP ${unavailableRes.status}, Error: "${unavailableData.error?.message}"`,
      test5Pass
    );

    // 6. An empty order is rejected
    const emptyOrderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: 'Ananya Iyer',
        studentId: 'ME2026-012',
        pickupTime: 'In 30 mins',
        items: []
      })
    });
    const emptyOrderData = await emptyOrderRes.json();
    const test6Pass = emptyOrderRes.status === 400 && emptyOrderData.success === false;
    recordResult(
      6,
      'Empty order is rejected',
      'HTTP 400 Bad Request rejecting empty items array',
      `HTTP ${emptyOrderRes.status}, Error: ${JSON.stringify(emptyOrderData.error?.details || emptyOrderData.error?.message)}`,
      test6Pass
    );

    // 7. Nonexistent order returns 404
    const notFoundRes = await fetch(`${BASE_URL}/orders/99999`);
    const notFoundData = await notFoundRes.json();
    const test7Pass = notFoundRes.status === 404 && notFoundData.success === false;
    recordResult(
      7,
      'Nonexistent order returns 404',
      'HTTP 404 Not Found for non-existing order ID',
      `HTTP ${notFoundRes.status}, Message: "${notFoundData.error?.message}"`,
      test7Pass
    );

    // 8. Staff member can update a valid order status (PLACED -> PREPARING)
    const updateStatusRes = await fetch(`${BASE_URL}/orders/${createdOrder.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PREPARING' })
    });
    const updateStatusData = await updateStatusRes.json();
    const test8Pass = updateStatusRes.status === 200 && updateStatusData.data?.status === 'PREPARING';
    recordResult(
      8,
      'Staff member can update a valid order status',
      'HTTP 200 with status successfully updated to PREPARING',
      `HTTP ${updateStatusRes.status}, Updated status: ${updateStatusData.data?.status}`,
      test8Pass
    );

    // 9. Invalid order status transitions are rejected
    // PREPARING -> PLACED is backwards and invalid!
    const invalidTransRes = await fetch(`${BASE_URL}/orders/${createdOrder.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PLACED' })
    });
    const invalidTransData = await invalidTransRes.json();
    const test9Pass = invalidTransRes.status === 400 && invalidTransData.success === false;
    recordResult(
      9,
      'Invalid order status transitions are rejected',
      'HTTP 400 Bad Request rejecting backward transition (PREPARING -> PLACED)',
      `HTTP ${invalidTransRes.status}, Message: "${invalidTransData.error?.message}"`,
      test9Pass
    );

    // 10. Menu item CRUD works correctly
    // Create new temporary item
    const createItemRes = await fetch(`${BASE_URL}/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Veg Puff',
        description: 'Crispy golden flaky pastry filled with curried vegetables.',
        price: 25.00,
        isAvailable: true
      })
    });
    const createItemData = await createItemRes.json();
    const newTempId = createItemData.data?.id;

    // Update the item
    const updateItemRes = await fetch(`${BASE_URL}/menu/${newTempId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: 30.00, description: 'Updated crispy puff' })
    });
    const updateItemData = await updateItemRes.json();

    // Delete the unreferenced item
    const deleteItemRes = await fetch(`${BASE_URL}/menu/${newTempId}`, {
      method: 'DELETE'
    });
    const deleteItemData = await deleteItemRes.json();

    const test10Pass = createItemRes.status === 201 &&
                       updateItemRes.status === 200 &&
                       parseFloat(updateItemData.data?.price) === 30.00 &&
                       deleteItemRes.status === 200;
    recordResult(
      10,
      'Menu item CRUD works correctly',
      'POST creates (201), PUT updates (200), DELETE removes unreferenced item (200)',
      `Create: ${createItemRes.status}, Update: ${updateItemRes.status} (₹${updateItemData.data?.price}), Delete: ${deleteItemRes.status}`,
      test10Pass
    );

    // 11. Order history preserves the original unit price
    // Check createdOrder's orderItems unitPrice
    const orderDetailsRes = await fetch(`${BASE_URL}/orders/${createdOrder.id}`);
    const orderDetails = await orderDetailsRes.json();
    const dosaOrderItem = orderDetails.data?.orderItems.find(i => i.menuItemId === dosa.id);
    const test11Pass = parseFloat(dosaOrderItem?.unitPrice) === 60.00;
    recordResult(
      11,
      'Order history preserves original unit price',
      'OrderItem snapshot unitPrice matches ₹60.00 at order time',
      `Snapshot unitPrice in OrderItem: ₹${parseFloat(dosaOrderItem?.unitPrice).toFixed(2)}`,
      test11Pass
    );

    // 12. Failed order transaction does not create partial records
    // Multi-item order where item 1 is valid, item 2 is non-existent
    const ordersCountBeforeRes = await fetch(`${BASE_URL}/orders`);
    const ordersBefore = (await ordersCountBeforeRes.json()).data.length;

    const failedTxRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: 'Test Rollback',
        studentId: 'TEST-001',
        pickupTime: 'In 15 mins',
        items: [
          { menuItemId: dosa.id, quantity: 1 },
          { menuItemId: 99999, quantity: 1 } // non-existent item triggers transaction rollback
        ]
      })
    });
    const ordersCountAfterRes = await fetch(`${BASE_URL}/orders`);
    const ordersAfter = (await ordersCountAfterRes.json()).data.length;
    const test12Pass = failedTxRes.status === 400 && ordersBefore === ordersAfter;
    recordResult(
      12,
      'Failed order transaction does not create partial records (Atomic Rollback)',
      'HTTP 400, Order count unchanged before and after failed transaction',
      `HTTP ${failedTxRes.status}, Orders count before: ${ordersBefore}, after: ${ordersAfter} (No partial record)`,
      test12Pass
    );

    // 13. Orders remain stored after persistence check
    const orderCheckRes = await fetch(`${BASE_URL}/orders/${createdOrder.id}`);
    const orderCheckData = await orderCheckRes.json();
    const test13Pass = orderCheckRes.status === 200 && orderCheckData.data?.id === createdOrder.id;
    recordResult(
      13,
      'Orders remain persistently stored in PostgreSQL database',
      'Order record fetched directly by primary key from PostgreSQL table',
      `Fetched order #${orderCheckData.data?.id} for ${orderCheckData.data?.studentName} from DB`,
      test13Pass
    );

    // 14. Menu Item Referential Deletion Protection (Preserve historical order details)
    // Attempting to delete Masala Dosa which is referenced by order #createdOrder.id
    const deleteReferencedRes = await fetch(`${BASE_URL}/menu/${dosa.id}`, {
      method: 'DELETE'
    });
    const deleteReferencedData = await deleteReferencedRes.json();
    const test14Pass = deleteReferencedRes.status === 400 && deleteReferencedData.error?.message.includes('historical order');
    recordResult(
      14,
      'Referential integrity protects historical orders on menu item delete',
      'HTTP 400 rejecting deletion of menu item linked to historical orders',
      `HTTP ${deleteReferencedRes.status}, Protection message: "${deleteReferencedData.error?.message}"`,
      test14Pass
    );

    console.log('\n====================================================');
    console.log(' ALL 14 TEST CASES COMPLETED');
    const allPassed = results.every(r => r.status === 'PASS');
    console.log(` Summary: ${results.filter(r => r.status === 'PASS').length}/${results.length} PASSED`);
    console.log(` Overall Status: ${allPassed ? 'ALL TESTS PASSED ✔' : 'SOME TESTS FAILED ❌'}`);
    console.log('====================================================');

  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTests();

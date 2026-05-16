const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.post('/api/order', async (req, res) => {
  try {
    const { email, phone, shipping, items } = req.body;
    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE}/admin/api/2024-01/orders.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order: {
            email, phone,
            financial_status: 'paid',
            send_receipt: true,
            line_items: items,
            shipping_address: shipping,
            shipping_lines: [{
              title: 'Free Shipping',
              price: '0.00',
              code: 'free'
            }]
          }
        })
      }
    );
    const data = await response.json();
    if (data.order) {
      res.json({ success: true, order_id: data.order.order_number });
    } else {
      res.status(400).json({ success: false, error: data });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.listen(process.env.PORT || 3000, () => console.log('Running!'));

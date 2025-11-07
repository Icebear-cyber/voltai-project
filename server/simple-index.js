const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (temporary)
let customers = [
  { id: 1, name: 'John Doe', address: '123 Main St', monthly_usage: 450 },
  { id: 2, name: 'Jane Smith', address: '456 Oak Ave', monthly_usage: 320 },
  { id: 3, name: 'Mike Johnson', address: '789 Pine Rd', monthly_usage: 890, alert: 'High Usage' }
];

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'VoltAI Backend is running!',
    version: '1.0.0',
    database: 'In-memory (temporary)'
  });
});

// Bill calculation
app.post('/calculate-bill', (req, res) => {
  const { usage } = req.body;
  
  if (!usage || isNaN(usage)) {
    return res.status(400).json({ error: 'Valid usage value is required' });
  }
  
  const amount = usage * 0.15;
  
  res.json({ 
    usage: parseInt(usage),
    amount: parseFloat(amount.toFixed(2)),
    rate: 0.15,
    message: `Bill calculated for ${usage} kWh`
  });
});

// Get all customers
app.get('/customers', (req, res) => {
  res.json(customers);
});

// Add new customer
app.post('/customers', (req, res) => {
  const { name, address, initialUsage } = req.body;
  
  if (!name || !address) {
    return res.status(400).json({ error: 'Name and address are required' });
  }
  
  const newCustomer = {
    id: customers.length + 1,
    name,
    address,
    monthly_usage: initialUsage || 0,
    alert: initialUsage > 800 ? 'High Usage' : null,
    created_at: new Date().toISOString()
  };
  
  customers.push(newCustomer);
  
  res.json({ 
    success: true, 
    customer: newCustomer,
    message: 'Customer added successfully'
  });
});

// Update customer usage
app.put('/customers/:id/usage', (req, res) => {
  const { id } = req.params;
  const { usage } = req.body;
  
  const customer = customers.find(c => c.id === parseInt(id));
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  
  customer.monthly_usage = usage;
  customer.alert = usage > 800 ? 'High Usage' : null;
  
  res.json({ 
    success: true, 
    customer: customer,
    message: 'Usage updated successfully'
  });
});

// Delete customer
app.delete('/customers/:id', (req, res) => {
  const { id } = req.params;
  
  const customerIndex = customers.findIndex(c => c.id === parseInt(id));
  if (customerIndex === -1) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  
  customers.splice(customerIndex, 1);
  
  res.json({ 
    success: true, 
    message: 'Customer deleted successfully'
  });
});

// Detect anomalies
app.post('/detect-anomalies', (req, res) => {
  const { usageHistory } = req.body;
  
  if (!usageHistory || !Array.isArray(usageHistory) || usageHistory.length === 0) {
    return res.status(400).json({ error: 'Valid usageHistory array is required' });
  }
  
  const averageUsage = usageHistory.reduce((a, b) => a + b, 0) / usageHistory.length;
  const latestUsage = usageHistory[usageHistory.length - 1];
  
  const isAnomaly = latestUsage > averageUsage * 1.5;
  const percentageChange = ((latestUsage - averageUsage) / averageUsage) * 100;
  
  res.json({
    isAnomaly,
    averageUsage: parseFloat(averageUsage.toFixed(2)),
    latestUsage,
    percentageChange: parseFloat(percentageChange.toFixed(2)),
    message: isAnomaly ? 
      `High usage detected! ${percentageChange.toFixed(2)}% above average` : 
      'Usage patterns normal'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    customers: customers.length
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 VoltAI Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available:`);
  console.log(`   GET  / - Server info`);
  console.log(`   GET  /health - Health check`);
  console.log(`   GET  /customers - Get all customers`);
  console.log(`   POST /calculate-bill - Calculate electricity bill`);
  console.log(`   POST /detect-anomalies - AI anomaly detection`);
  console.log(`   POST /customers - Add new customer`);
});
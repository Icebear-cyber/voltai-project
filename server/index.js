const express = require('express');
const cors = require('cors');
require('dotenv').config();
const supabase = require('./supabase');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database initialization
const initializeDatabase = async () => {
  // Create customers table if not exists
  const { error } = await supabase.from('customers').select('*').limit(1);
  
  if (error) {
    console.log('Initializing database...');
    // Table will be created automatically on first insert
  }
};

// Updated API endpoints with database

// Get all customers
app.get('/customers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Add new customer
app.post('/customers', async (req, res) => {
  try {
    const { name, address, monthly_usage = 0 } = req.body;

    if (!name || !address) {
      return res.status(400).json({ error: 'Name and address are required' });
    }

    const newCustomer = {
      name,
      address,
      monthly_usage,
      alert: monthly_usage > 800 ? 'High Usage' : null,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('customers')
      .insert([newCustomer])
      .select();

    if (error) throw error;

    res.json({ 
      success: true, 
      customer: data[0],
      message: 'Customer added successfully'
    });
  } catch (error) {
    console.error('Error adding customer:', error);
    res.status(500).json({ error: 'Failed to add customer' });
  }
});

// Update customer usage
app.put('/customers/:id/usage', async (req, res) => {
  try {
    const { id } = req.params;
    const { usage } = req.body;

    const { data, error } = await supabase
      .from('customers')
      .update({ 
        monthly_usage: usage,
        alert: usage > 800 ? 'High Usage' : null
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json({ 
      success: true, 
      customer: data[0],
      message: 'Usage updated successfully'
    });
  } catch (error) {
    console.error('Error updating usage:', error);
    res.status(500).json({ error: 'Failed to update usage' });
  }
});

// Delete customer
app.delete('/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ 
      success: true, 
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// Initialize database on startup
initializeDatabase();

// ... keep all your existing endpoints (calculate-bill, detect-anomalies, etc.)

app.listen(PORT, () => {
  console.log(`🚀 VoltAI Server with Database running on http://localhost:${PORT}`);
});
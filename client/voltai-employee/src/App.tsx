import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface Customer {
  id: number;
  name: string;
  address: string;
  monthly_usage: number;
  alert?: string;
  created_at?: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCustomer, setNewCustomer] = useState({ name: '', address: '', initialUsage: '' });

  const API_URL = 'http://localhost:3001';

  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('voltai_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      fetchCustomers();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    fetchCustomers();
  };

  const handleLogout = () => {
    localStorage.removeItem('voltai_user');
    setUser(null);
    setCustomers([]);
  };

  // Load customers from backend
  const fetchCustomers = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await fetch(`${API_URL}/customers`);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Failed to load customers. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async () => {
    if (!newCustomer.name || !newCustomer.address) {
      alert('Please enter name and address');
      return;
    }

    try {
      setError(null);
      const response = await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCustomer.name,
          address: newCustomer.address,
          initialUsage: newCustomer.initialUsage ? parseInt(newCustomer.initialUsage) : 0
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setCustomers([...customers, data.customer]);
        setNewCustomer({ name: '', address: '', initialUsage: '' });
        alert('Customer added successfully!');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      setError('Failed to add customer. Please try again.');
    }
  };

  const addTestCustomer = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Test Customer ${customers.length + 1}`,
          address: `${customers.length + 100} Test Street`,
          initialUsage: Math.floor(Math.random() * 500) + 200
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setCustomers([...customers, data.customer]);
      }
    } catch (error) {
      console.error('Error adding test customer:', error);
      setError('Failed to add test customer.');
    }
  };

  const clearAlert = (customerId: number) => {
    setCustomers(customers.map(customer => 
      customer.id === customerId ? { ...customer, alert: undefined } : customer
    ));
  };

  const deleteCustomer = async (customerId: number) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/customers/${customerId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      if (data.success) {
        setCustomers(customers.filter(customer => customer.id !== customerId));
        alert('Customer deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer');
    }
  };

  const updateCustomerUsage = async (customerId: number, newUsage: number) => {
    try {
      const response = await fetch(`${API_URL}/customers/${customerId}/usage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usage: newUsage
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setCustomers(customers.map(customer => 
          customer.id === customerId ? data.customer : customer
        ));
        alert('Usage updated successfully!');
      }
    } catch (error) {
      console.error('Error updating usage:', error);
      alert('Failed to update usage');
    }
  };

  const calculateRevenue = () => {
    return customers.reduce((sum, customer) => sum + (customer.monthly_usage * 0.15), 0);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (loading) {
    return <div className="loading">Loading VoltAI Dashboard...</div>;
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>⚡ VoltAI Employee Dashboard</h1>
            <p>Smart Energy Management System</p>
          </div>
          <div className="user-info">
            <span>Welcome, {user.name}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard">
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={fetchCustomers} className="retry-button">Retry</button>
          </div>
        )}

        <div className="stats">
          <div className="stat-card">
            <h3>Total Customers</h3>
            <p className="stat-number">{customers.length}</p>
          </div>
          <div className="stat-card">
            <h3>Alerts</h3>
            <p className="stat-number alert">
              {customers.filter(c => c.alert).length}
            </p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-number">${calculateRevenue().toFixed(2)}</p>
          </div>
        </div>

        {/* Add Customer Form */}
        <div className="add-customer-form">
          <h3>Add New Customer</h3>
          <div className="form-row">
            <input
              type="text"
              placeholder="Customer Name"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
              className="form-input"
            />
            <input
              type="text"
              placeholder="Address"
              value={newCustomer.address}
              onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
              className="form-input"
            />
            <input
              type="number"
              placeholder="Initial Usage (kWh)"
              value={newCustomer.initialUsage}
              onChange={(e) => setNewCustomer({...newCustomer, initialUsage: e.target.value})}
              className="form-input"
            />
            <button onClick={addCustomer} className="action-button">
              Add Customer
            </button>
          </div>
        </div>

        <div className="actions">
          <button className="action-button" onClick={addTestCustomer}>
            + Add Test Customer
          </button>
          <button className="secondary-button" onClick={fetchCustomers}>
            🔄 Refresh Data
          </button>
        </div>

        <div className="customer-list">
          <h2>Customer Management ({customers.length} customers)</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Address</th>
                <th>Usage (kWh)</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td>{customer.name}</td>
                  <td>{customer.address}</td>
                  <td>{customer.monthly_usage}</td>
                  <td>${(customer.monthly_usage * 0.15).toFixed(2)}</td>
                  <td>
                    {customer.alert ? 
                      <span className="alert-badge">⚠️ {customer.alert}</span> : 
                      <span className="normal-badge">Normal</span>
                    }
                  </td>
                  <td>
                    <div className="action-buttons">
                      {customer.alert && (
                        <button 
                          className="clear-button"
                          onClick={() => clearAlert(customer.id)}
                        >
                          Clear Alert
                        </button>
                      )}
                      <button 
                        className="update-button"
                        onClick={() => {
                          const newUsage = prompt('Enter new usage (kWh):', customer.monthly_usage.toString());
                          if (newUsage && !isNaN(Number(newUsage))) {
                            updateCustomerUsage(customer.id, Number(newUsage));
                          }
                        }}
                      >
                        Update Usage
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => deleteCustomer(customer.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
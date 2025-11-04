// Test script to call API endpoints directly
const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api';

async function testEndpoints() {
  console.log('🧪 Testing API endpoints...\n');

  const endpoints = [
    { name: 'Jobs', url: `${BASE_URL}/jobs`, params: { jobStatus: 'all', limit: 100 } },
    { name: 'Competitions', url: `${BASE_URL}/competitions`, params: { status: 'active', limit: 100 } },
    { name: 'Achievements', url: `${BASE_URL}/achievements`, params: { status: 'published', limit: 100 } },
    { name: 'Research', url: `${BASE_URL}/research`, params: { status: 'published', limit: 100 } },
    { name: 'Higher Studies', url: `${BASE_URL}/higher-studies`, params: { status: 'active', limit: 100 } }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing ${endpoint.name}: GET ${endpoint.url}`);

      const response = await axios.get(endpoint.url, { params: endpoint.params });

      console.log(`✅ Status: ${response.status}`);
      console.log(`📊 Response structure:`, typeof response.data);

      if (response.data) {
        console.log(`📋 Keys:`, Object.keys(response.data));

        if (response.data.success !== undefined) {
          console.log(`🎯 Success: ${response.data.success}`);
        }

        if (response.data.data) {
          const data = response.data.data;
          if (Array.isArray(data)) {
            console.log(`📝 Records count: ${data.length}`);
            if (data.length > 0) {
              console.log(`📄 Sample record keys:`, Object.keys(data[0]));
              console.log(`📄 Sample title: "${data[0].title || 'No title'}"`);
            }
          } else {
            console.log(`📝 Data type:`, typeof data);
            console.log(`📝 Data keys:`, Object.keys(data));
          }
        }

        if (response.data.message) {
          console.log(`💬 Message: ${response.data.message}`);
        }
      }

      console.log('');
    } catch (error) {
      console.log(`❌ Error:`, error.response ?
        `${error.response.status} - ${error.response.statusText}` :
        error.message
      );

      if (error.response && error.response.data) {
        console.log(`💬 Error message:`, error.response.data.message || error.response.data);
      }
      console.log('');
    }
  }
}

testEndpoints();

document.addEventListener("DOMContentLoaded", () => {
  // Fetch data from API
  fetch('/api/reports-data')
    .then(response => response.json())
    .then(data => {
      // Update revenue cards
      const parkingRevenueEl = document.getElementById('parkingRevenue');
      const tyreRevenueEl = document.getElementById(' tyreRevenue');
      const batteryRevenueEl = document.getElementById('batteryRevenue');
      const totalRevenueEl = document.getElementById('totalRevenue');
      
      if (parkingRevenueEl) {
        parkingRevenueEl.textContent = `UGX ${data.parkingRevenue.toLocaleString()}`;
      }
      if (tyreRevenueEl) {
        tyreRevenueEl.textContent = `UGX ${data.tyrRevenue.toLocaleString()}`;
      }
      if (batteryRevenueEl) {
        batteryRevenueEl.textContent = `UGX ${data.batteryRevenue.toLocaleString()}`;
      }
      if (totalRevenueEl) {
        totalRevenueEl.textContent = `UGX ${data.totalRevenue.toLocaleString()}`;
      }
      
      // Update signed out vehicles table
      const signedOutTable = document.getElementById('signedOutTable');
      if (signedOutTable) {
        const tbody = signedOutTable.querySelector('tbody');
        if (tbody && data.signedOutVehicles.length > 0) {
          tbody.innerHTML = data.signedOutVehicles.map(v => `
            <tr>
              <td>${v.plateNumber}</td>
              <td>${v.driverName}</td>
              <td>${new Date(v.entryTime).toLocaleTimeString()}</td>
              <td>${v.exitTime ? new Date(v.exitTime).toLocaleTimeString() : '-'}</td>
              <td>${calculateDuration(v.entryTime, v.exitTime)}</td>
              <td>UGX ${v.parkingFee.toLocaleString()}</td>
              <td>${v.receiverName || '-'}</td>
            </tr>
          `).join('');
          
          // Update count
          const countEl = document.getElementById('signedOutCount');
          if (countEl) countEl.textContent = `${data.signedOutVehicles.length} vehicles`;
        }
      }
      
      // Update tyre services table
      const tyreList = document.getElementById(' tyreList');
      if ( tyreList) {
        const tbody = tyreList.querySelector('tbody');
        if (tbody && data.tyrServices.length > 0) {
          tbody.innerHTML = data.tyrServices.map(s => `
            <tr>
              <td>${s.plateNumber}</td>
              <td>${s.serviceType}</td>
              <td>UGX ${s.amount.toLocaleString()}</td>
              <td>${new Date(s.serviceDate).toLocaleTimeString()}</td>
            </tr>
          `).join('');
        }
      }
      
      // Update battery services table
      const batteryList = document.getElementById('batteryList');
      if (batteryList) {
        const tbody = batteryList.querySelector('tbody');
        if (tbody && data.batteryServices.length > 0) {
          tbody.innerHTML = data.batteryServices.map(s => `
            <tr>
              <td>${s.customerName}</td>
              <td>${s.batteryModel}</td>
              <td>${s.serviceType}</td>
              <td>UGX ${s.amount.toLocaleString()}</td>
            </tr>
          `).join('');
        }
      }
    })
    .catch(error => {
      console.error('Error loading reports:', error);
    });
});

// Helper function to calculate duration
function calculateDuration(entryTime, exitTime) {
  if (!entryTime || !exitTime) return '-';
  
  const entry = new Date(entryTime);
  const exit = new Date(exitTime);
  const durationMs = exit - entry;
  
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min`;
  }
  return `${minutes} min`;
}

// Export report function
function exportReport() {
  window.print();
}
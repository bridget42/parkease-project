// filepath: backend/public/js/sign-out.js

// Global search and print functionality
async function searchVehicle() {
  const searchInput = document.getElementById('searchInput').value.trim();
  const vehicleDetailsCard = document.getElementById('vehicleDetails');
  const searchStatus = document.getElementById('searchStatus');
  
  if (!searchInput) {
    alert('⚠️ Please enter a vehicle plate or receipt number');
    return;
  }
  
  // Show loading status
  searchStatus.style.display = 'block';
  vehicleDetailsCard.style.display = 'none';
  
  try {
    // Call the actual API
    const response = await fetch(`/api/search-vehicle?query=${encodeURIComponent(searchInput)}`);
    const data = await response.json();
    
    searchStatus.style.display = 'none';
    
    if (!response.ok) {
      alert('⚠️ ' + (data.error || 'Vehicle not found'));
      return;
    }
    
    // Calculate duration
    const entryTime = new Date(data.entryTime);
    const now = new Date();
    const durationMs = now - entryTime;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const durationStr = hours > 0 ? `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min${minutes > 1 ? 's' : ''}` : `${minutes} min${minutes > 1 ? 's' : ''}`;
    
    // Format entry time
    const entryTimeStr = entryTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    // Display vehicle details
    document.getElementById('displayDriver').textContent = data.driverName;
    document.getElementById('displayPlate').textContent = data.plateNumber;
    document.getElementById('displayType').textContent = data.vehicleType;
    document.getElementById('displayArrival').textContent = entryTimeStr;
    document.getElementById('displayDuration').textContent = durationStr;
    document.getElementById('displayReceipt').textContent = data.receiptNumber || 'N/A';
    
    // Display payment amount
    document.getElementById('totalPayable').textContent = 'UGX ' + data.parkingFee.toLocaleString();
    
    // Store plate number for form submission
    document.getElementById('searchInput').dataset.plateNumber = data.plateNumber;
    
    vehicleDetailsCard.style.display = 'block';
    
  } catch (error) {
    searchStatus.style.display = 'none';
    console.error('Search error:', error);
    alert('⚠️ Error searching for vehicle. Please try again.');
  }
}

function printReceipt() {
  const receiptData = {
    driver: document.getElementById('displayDriver').textContent,
    plate: document.getElementById('displayPlate').textContent,
    type: document.getElementById('displayType').textContent,
    receiver: document.getElementById('receiverName').value,
    amount: document.getElementById('totalPayable').textContent
  };
  
  const printWindow = window.open('', '', 'height=500,width=500');
  printWindow.document.write(`
    <html>
      <head>
        <title>ParkEase Receipt</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #00327d; padding-bottom: 10px; margin-bottom: 20px; }
          .details { margin: 15px 0; }
          .label { font-weight: bold; color: #00327d; }
          .total { border-top: 2px solid #00327d; margin-top: 20px; padding-top: 10px; font-size: 18px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>🅿️ ParkEase</h2>
          <h3>Sign-Out Receipt</h3>
        </div>
        <div class="details">
          <p><span class="label">Vehicle Plate:</span> ${receiptData.plate}</p>
          <p><span class="label">Vehicle Type:</span> ${receiptData.type}</p>
          <p><span class="label">Driver:</span> ${receiptData.driver}</p>
          <p><span class="label">Receiver:</span> ${receiptData.receiver}</p>
        </div>
        <div class="total">
          <p>Total Amount Paid: ${receiptData.amount}</p>
        </div>
        <div class="footer">
          <p>Thank you for using ParkEase!</p>
          <p>Receipt printed on ${new Date().toLocaleString()}</p>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}

// Form validation for sign-out
document.addEventListener("DOMContentLoaded", () => {
  const signOutForm = document.getElementById('signOutForm');
  
  if (signOutForm) {
    signOutForm.addEventListener('submit', function(e) {
      const receiverName = document.getElementById('receiverName')?.value?.trim() || '';
      const receiverPhone = document.getElementById('receiverPhone')?.value?.trim() || '';
      const gender = document.getElementById('gender')?.value || '';
      
      // Validate receiver name
      if (!/^[A-Z][a-zA-Z\s]*$/.test(receiverName)) {
        e.preventDefault();
        alert('Invalid receiver name.\n• Must start with a capital letter\n• Must not contain numbers');
        return false;
      }
      
      // Validate phone number
      const cleanPhone = receiverPhone.replace(/\s/g, '');
      const ugandanPhoneRegex = /^(\+256|0)[0-9]{9}$/;
      if (!ugandanPhoneRegex.test(cleanPhone)) {
        e.preventDefault();
        alert('Invalid phone number.\n• Must be a valid Ugandan number\n• Format: 07XX XXX XXX');
        return false;
      }
      
      // Validate gender
      if (!gender) {
        e.preventDefault();
        alert('Please select a gender.');
        return false;
      }
      
      // Get the plate number from the stored data
      const searchInput = document.getElementById('searchInput');
      if (searchInput && searchInput.dataset.plateNumber) {
        // Create a hidden input with the plate number for the form
        let hiddenInput = document.getElementById('hiddenPlateNumber');
        if (!hiddenInput) {
          hiddenInput = document.createElement('input');
          hiddenInput.type = 'hidden';
          hiddenInput.name = 'plateNumber';
          hiddenInput.id = 'hiddenPlateNumber';
          signOutForm.appendChild(hiddenInput);
        }
        hiddenInput.value = searchInput.dataset.plateNumber;
      }
      
      console.log('✓ Sign-out form validation passed');
    });
  }
  
  // Make functions globally available
  window.searchVehicle = searchVehicle;
  window.printReceipt = printReceipt;
});

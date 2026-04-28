document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("vehicleForm");
  const entryTimeInput = document.getElementById("entryTime");

  if (!form) return;

  // Auto-fill current datetime
  if (entryTimeInput && !entryTimeInput.value) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    entryTimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  form.addEventListener("submit", (e) => {
    // Get values and trim/convert immediately
    const plateNumberInput = document.getElementById("plateNumber");
    const vehicleTypeInput = document.getElementById("vehicleType");
    const driverNameInput = document.getElementById("driverName");
    const phoneNumberInput = document.getElementById("phoneNumber");
    const parkingSlotInput = document.getElementById("parkingSlot");
    const entryTimeInputSubmit = document.getElementById("entryTime");
    const ninNumberInput = document.getElementById("ninNumber");

    // Extract and clean values
    const plateNumber = plateNumberInput?.value?.trim().toUpperCase() || "";
    const vehicleType = vehicleTypeInput?.value?.trim() || "";
    const driverName = driverNameInput?.value?.trim() || "";
    const phoneNumber = phoneNumberInput?.value?.trim() || "";
    const parkingSlot = parkingSlotInput?.value?.trim() || "";
    const entryTime = entryTimeInputSubmit?.value || "";
    const ninNumber = ninNumberInput?.value?.trim() || "";

    // Validate all required fields
    if (!plateNumber || !vehicleType || !driverName || !phoneNumber || !parkingSlot || !entryTime) {
      e.preventDefault();
      const missingFields = [];
      if (!driverName) missingFields.push("Driver Name");
      if (!phoneNumber) missingFields.push("Phone Number");
      if (!vehicleType) missingFields.push("Vehicle Type");
      if (!plateNumber) missingFields.push("Number Plate");
      if (!parkingSlot) missingFields.push("Parking Slot");
      if (!entryTime) missingFields.push("Entry Time");
      
      alert("Please fill in all required fields:\n• " + missingFields.join("\n• "));
      return false;
    }

    // Validate driver name - must start with capital letter, no numbers
    if (!/^[A-Z][a-zA-Z\s]*$/.test(driverName)) {
      e.preventDefault();
      alert("Invalid driver name.\n• Must start with a capital letter\n• Must not contain numbers\nYou entered: " + driverName);
      return false;
    }

    // Validate phone number format (Ugandan numbers)
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    const ugandanPhoneRegex = /^(\+256|0)[0-9]{9}$/;
    if (!ugandanPhoneRegex.test(cleanPhone)) {
      e.preventDefault();
      alert("Invalid phone number.\n• Must be a valid Ugandan number\n• Format: 07XX XXX XXX or +256 XXX XXX XXX\nYou entered: " + phoneNumber);
      return false;
    }

    // Validate plate number format - must start with U, alphanumeric, max 6 chars
    const plateRegex = /^[A-Z]{3}\s\d{3}[A-Z]$/;
    if (!plateRegex.test(plateNumber)) {
      e.preventDefault();
      alert("Invalid plate number.\n• Must start with 'U'\n• Must be alphanumeric (letters and numbers only)\n• Must be less than 6 characters\nYou entered: " + plateNumber);
      return false;
    }

    // Validate NIN for Boda-boda
    if (vehicleType === "Boda-boda" && !ninNumber) {
      e.preventDefault();
      alert("NIN number is required for Boda-boda vehicles.");
      return false;
    }

    // All validation passed, update the form values to uppercase before submission
    plateNumberInput.value = plateNumber;
    
    console.log("✓ Form validation passed. Submitting:", {
      plateNumber,
      vehicleType,
      driverName,
      phoneNumber,
      parkingSlot,
      entryTime,
      ninNumber
    });
  });
});
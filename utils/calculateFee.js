// filepath: backend/utils/calculateFee.js
function calculateFee(vehicleType, checkInTime, checkOutTime) {
  const checkIn = new Date(checkInTime);
  const checkOut = new Date(checkOutTime);
  
  // Calculate duration in hours
  const durationMs = checkOut - checkIn;
  const durationHours = durationMs / (1000 * 60 * 60);
  
  // Determine if day or night based on check-in time
  const checkInHour = checkIn.getHours();
  const isDay = checkInHour >= 6 && checkInHour < 19; // 6:00am - 6:59pm is day
  
  // Define rates based on vehicle type and time
  const rates = {
    "Truck": { day: 5000, night: 10000, short: 2000 },
    "Personal Car": { day: 3000, night: 2000, short: 2000 },
    "Taxi": { day: 3000, night: 2000, short: 2000 },
    "Coaster": { day: 4000, night: 2000, short: 3000 },
    "Boda-boda": { day: 2000, night: 2000, short: 1000 }
  };
  
  const vehicleRates = rates[vehicleType] || rates["Personal Car"];
  
  // Apply short-term rate if less than 3 hours
  if (durationHours < 3) {
    return vehicleRates.short;
  }
  
  // Apply day or night rate
  return isDay ? vehicleRates.day : vehicleRates.night;
}

module.exports = calculateFee;

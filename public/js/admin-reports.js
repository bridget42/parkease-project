document.addEventListener("DOMContentLoaded", () => {
  // const reports = JSON.parse(localStorage.getItem("reports")) || [];
  // const vehicles = JSON.parse(localStorage.getItem("vehicles")) || [];

  const totalRevenue = reports.reduce((sum, r) => sum + r.amount, 0);
  const totalVehicles = vehicles.length;

  const serviceCount = {};
  reports.forEach(r => {
    serviceCount[r.service] = (serviceCount[r.service] || 0) + 1;
  });

  let mostUsedService = "N/A";
  let max = 0;
  for (const service in serviceCount) {
    if (serviceCount[service] > max) {
      max = serviceCount[service];
      mostUsedService = service;
    }
  }

  const headings = document.querySelectorAll("h1");

  if (headings.length >= 3) {
    headings[0].textContent = `UGX ${totalRevenue.toLocaleString()}`;
    headings[1].textContent = totalVehicles;
    headings[2].textContent = mostUsedService;
  }

  const tbody = document.querySelector("tbody");
  if (tbody) {
    const parking = reports.filter(r => r.service === "Parking").reduce((s, r) => s + r.amount, 0);
    const tyre = reports.filter(r => ["Tyre Inflation", "Puncture Repair", "Tyre Change", "Wheel Balancing"].includes(r.service)).reduce((s, r) => s + r.amount, 0);
    const battery = reports.filter(r => ["Battery Charging", "Battery Replacement", "Battery Testing"].includes(r.service)).reduce((s, r) => s + r.amount, 0);

    tbody.innerHTML = `
      <tr><td>Parking</td><td>UGX ${parking.toLocaleString()}</td></tr>
      <tr><td>Tyre Clinic</td><td>UGX ${tyre.toLocaleString()}</td></tr>
      <tr><td>Battery Section</td><td>UGX ${battery.toLocaleString()}</td></tr>
    `;
  }
});
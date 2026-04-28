document.addEventListener("DOMContentLoaded", () => {
  const dateEl = document.getElementById("current-date");
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString();
  }

  // const vehicles = JSON.parse(localStorage.getItem("vehicles")) || [];
  // const reports = JSON.parse(localStorage.getItem("reports")) || [];

  const parkedVehicles = vehicles.filter(v => v.status === "parked").length;
  const totalRevenue = reports.reduce((sum, r) => sum + r.amount, 0);

  const parkedCount = document.getElementById("parked-count");
  if (parkedCount) parkedCount.textContent = parkedVehicles;

  const revenueCard = document.querySelector(".text-success");
  if (revenueCard) revenueCard.textContent = `UGX ${totalRevenue.toLocaleString()}`;
});
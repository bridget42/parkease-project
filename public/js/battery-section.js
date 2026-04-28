document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  if (!form) return;

  const prices = {
    "Battery Charging": 25000,
    "Battery Replacement": 180000,
    "Battery Testing": 10000
  };

  const select = document.querySelector("select");
  const alertBox = document.querySelector(".alert-warning");

  function updatePrice() {
    const service = select.value;
    alertBox.innerHTML = `<strong>Service Price:</strong> UGX ${(prices[service] || 0).toLocaleString()}`;
  }

  updatePrice();
  select.addEventListener("change", updatePrice);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const plate = document.querySelector("input").value.trim().toUpperCase();
    const service = select.value;
    const amount = prices[service] || 0;

    if (!plate) {
      alert("Enter vehicle plate number.");
      return;
    }

    // const reports = JSON.parse(localStorage.getItem("reports")) || [];

    reports.push({
      date: new Date().toLocaleDateString(),
      plateNumber: plate,
      service,
      amount
    });

    // localStorage.setItem("reports", JSON.stringify(reports));

    alert("Battery service saved successfully!");
    form.reset();
    updatePrice();
  });
});
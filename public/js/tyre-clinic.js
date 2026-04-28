document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  if (!form) return;

  const prices = {
    "Pressure Check": 500,
    "Puncture Fix": 5000,
    "Valve Replacement": 5000,
  };

  const select = document.querySelector("select");
  const alertBox = document.querySelector(".alert-success");

  function updatePrice() {
    const service = select.value;
    const price = prices[service] || 0;
    alertBox.innerHTML = `<strong>Service Price:</strong> UGX ${price.toLocaleString()}`;
    document.getElementById("amountField").value = price;
  }

  updatePrice();
  select.addEventListener("change", updatePrice);
});

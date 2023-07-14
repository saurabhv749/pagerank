const submitBtn = document.querySelector("#submit");
const form = document.querySelector("#rank__form");
const resultsContainer = document.querySelector("#results__container");
submitBtn.onclick = submitForm;

async function submitForm(e) {
  e.preventDefault();

  const url = document.getElementById("url").value;
  const query = document.getElementById("query").value;

  if (!url) {
    alert("url is required");
    return;
  } else if (!query) {
    alert("must provide a query");
    return;
  }

  document.body.classList.add("loading");
  resultsContainer.innerHTML = `<b>Getting search results....(about 01:30 min)</b>`;

  const actionUrl = `/rank?url=${encodeURIComponent(
    url
  )}&query=${encodeURIComponent(query)}`;

  try {
    const serverRes = await fetch(actionUrl);
    const results = await serverRes.json();
    ShowResults(results);
  } catch (error) {
    console.log(error);
  }

  document.body.classList.remove("loading");
}

function ShowResults(results) {
  resultsContainer.innerHTML = "";

  const sorted = results.sort((a, b) => a.rank - b.rank);
  const table = document.createElement("table");
  table.classList.add("pure-table", "pure-table-horizontal");
  // Create the table header row
  const headerRow = table.insertRow();
  const nameHeader = headerRow.insertCell();
  nameHeader.textContent = "SEARCH ENGINE";
  const rankHeader = headerRow.insertCell();
  rankHeader.textContent = "Rank";
  const urlHeader = headerRow.insertCell();
  urlHeader.textContent = "URL";

  sorted.forEach((item) => {
    const row = table.insertRow();
    const nameCell = row.insertCell();
    nameCell.textContent = item.searchEngine;
    const rankCell = row.insertCell();
    rankCell.textContent = item.rank;
    const urlCell = row.insertCell();
    urlCell.innerHTML = `<a href="${item.url}">${item.url}</a>`;
  });

  resultsContainer.appendChild(table);
}

function resetForm() {
  form.reset();
}

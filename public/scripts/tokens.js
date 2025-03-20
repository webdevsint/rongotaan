let approvedTokens = [];

function renderToken(arr, parent) {
  arr.forEach((token) => {
    const container = document.querySelector(parent);
    const div = document.createElement("div");
    div.className = "token";
    div.innerHTML = `<p>Token ID: ${token.id}</p><p>name: ${token.name}</p><p>Email: ${token.email}</p><p>Contact: ${token.contact}</p><p>Date Valid: ${token.day}</p><p>Transaction ID: ${token.transactionID}</p><h3>Token Approved: ${token.approved}</h3>`;

    const verifyButton = document.createElement("button");
    verifyButton.className = "verify-button";
    verifyButton.innerHTML = "Approve Token";
    verifyButton.onclick = () => {
      id = token.id;

      fetch(`/api/approve/${id}?key=nPmk2cLB`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((responseData) => {
          console.log(responseData);
          window.location.reload();
        })
        .catch((error) => {
          console.error(error);
        });
    };

    if (token.approved === false) {
      div.appendChild(verifyButton);
    }

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.innerHTML = "Revoke Token";
    deleteButton.ondblclick = () => {
      id = token.id;

      fetch(`/api/token/${id}?key=nPmk2cLB`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((responseData) => {
          console.log(responseData);
          window.location.reload();
        })
        .catch((error) => {
          console.error(error);
        });
    };

    div.appendChild(deleteButton);
    container.appendChild(div);
  });
}

function renderTokens(data) {
  const tokens = data;

  approvedTokens = data.filter((token) => token.approved === true);
  const pendingTokens = data.filter((token) => token.approved === false);

  if (pendingTokens.length === 0) {
    document.querySelector(".pending-tokens").innerHTML = "No pending tokens.";
  }

  if (approvedTokens.length === 0) {
    document.querySelector(".approved-tokens").innerHTML =
      "No approved tokens.";
  }

  renderToken(approvedTokens, ".approved-tokens");
  renderToken(pendingTokens, ".pending-tokens");
}

fetch("/api/tokens?key=nPmk2cLB")
  .then((response) => response.json())
  .then((data) => renderTokens(data))
  .catch((error) => console.error("Error:", error));

function search() {
  document.querySelector(".search-result").style.display = "block";
  document.querySelector(".search-result").innerHTML = "";

  const searchKey = document.querySelector(".searchbox").value.trim();

  if (searchKey === "") {
    document.querySelector(".search-result").innerHTML =
      "Please enter a Token ID!";
  } else {
    const searchResult = approvedTokens.filter(
      (token) => token.id === searchKey
    );

    if (searchResult.length > 0) {
      renderToken(searchResult, ".search-result");
    } else
      document.querySelector(".search-result").innerHTML =
        "Token not found / approved!";
  }

  document.querySelector(".searchbox").value = "";
}

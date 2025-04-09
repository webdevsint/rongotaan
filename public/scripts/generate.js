let params = new URLSearchParams(document.location.search);

if (params.get("token")) {
  document.getElementById("barcodeValue").value = params.get("token");

  generateBarcode();
}

function generateBarcode() {
  const barcodeValueInput = document.getElementById("barcodeValue");
  const barcodeCanvas = document.getElementById("barcodeCanvas");
  const barcodeValue = barcodeValueInput.value.trim();

  if (barcodeValue === "") {
    const ctx = barcodeCanvas.getContext("2d");
    ctx.clearRect(0, 0, barcodeCanvas.width, barcodeCanvas.height);
    document.querySelector("#ticket").style.display = "none";
    document.querySelector(".download-btn").style.display = "none";

    alert("Input field is empty!");
  } else {
    fetch(`/api/token/${barcodeValue}?key=nPmk2cLB`)
      .then((response) => response.json())
      .then((data) => {
        if (data.approved) {
          if (data.name) {
            if (data.day === "15th April, 2025") {
              document.querySelector(".ticket-bg").src = "/assets/day1_bg.png";
              document.querySelector(".ticket-hero").src =
                "/assets/day1_ticket.png";
            } else {
              document.querySelector(".ticket-bg").src = "/assets/day2_bg.png";
              document.querySelector(".ticket-hero").src =
                "/assets/day2_ticket.png";
            }

            JsBarcode(barcodeCanvas, barcodeValue, {
              format: "CODE128",
              lineColor: "#000",
              background: "transparent",
              width: 2,
              height: 100,
              displayValue: false,
            });

            document.querySelector(".greeting-name").innerHTML = data.name;

            document.querySelector("#barcode-preview-1").src =
              canvasToBase64("barcodeCanvas");
            document.querySelector("#barcode-preview-2").src =
              canvasToBase64("barcodeCanvas");

            document.querySelector("#ticket").style.display = "block";
            document.querySelector(".download-btn").style.display = "block";
          } else {
            const ctx = barcodeCanvas.getContext("2d");
            ctx.clearRect(0, 0, barcodeCanvas.width, barcodeCanvas.height);
            document.querySelector("#ticket").style.display = "none";
            document.querySelector(".download-btn").style.display = "none";
            alert(data.message);
          }
        } else {
          alert("Token not approved!");
        }
      })
      .catch((error) => console.error("Error:", error));
  }
}

function canvasToBase64(canvasId, mimeType = "image/png", quality = 1) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error(`Canvas element with ID "${canvasId}" not found.`);
    return null;
  }

  try {
    const base64String = canvas.toDataURL(mimeType, quality);
    return base64String;
  } catch (error) {
    console.error("Error converting canvas to Base64:", error);
    return null;
  }
}

async function captureScreenshot(elementId) {
  const element = document.getElementById(elementId);

  if (!element) {
    console.error(`Element with ID "${elementId}" not found.`);
    return null;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 4,
    });

    const dataURL = canvas.toDataURL();
    return dataURL;
  } catch (error) {
    console.error("Error capturing element:", error);
    return null;
  }
}

async function downloadScreenshot(elementId, filename) {
  const imageDataURL = await captureScreenshot(elementId);

  if (imageDataURL) {
    const link = document.createElement("a");
    link.href = imageDataURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

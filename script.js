const IMGBB_API_KEY = "0bf75dea880937d78cf5e554ed16a2e1";
let uploadedImageUrls = [];

const imageInput = document.getElementById("imageInput");
const statusDiv = document.getElementById("status");
const previewContainer = document.getElementById("previewContainer");
const resultText = document.getElementById("resultText");

// =========================================================
// Barcha input/select/textarea o'zgarganda postni yangilash
// =========================================================
document.querySelectorAll("input, select, textarea").forEach((el) => {
  if (el.id === "resultText" || el.id === "imageInput") return;
  el.addEventListener("input", updatePostText);
  el.addEventListener("change", updatePostText);
});

// =========================================================
// Rasmlar tanlanganda ishga tushish
// =========================================================
imageInput.addEventListener("change", async (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  statusDiv.innerText = "Rasmlar .webp ga o'tkazilib yuklanmoqda...";

  for (const file of files) {
    try {
      // 1. Rasmni brauzerda .webp formatiga o'tkazish
      const webpBlob = await convertToWebp(file);

      // 2. ImgBB ga yuklash
      const formData = new FormData();
      formData.append("image", webpBlob, "car.webp");

      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        const url = data.data.url;
        uploadedImageUrls.push(url);
        addPreview(url, uploadedImageUrls.length);
      } else {
        console.error("ImgBB xatolik qaytardi:", data);
      }
    } catch (err) {
      console.error("Xatolik:", err);
    }
  }

  const minWarning =
    uploadedImageUrls.length < 4
      ? ` (kamida 4 ta tavsiya etiladi, hozir: ${uploadedImageUrls.length})`
      : "";
  statusDiv.innerText = "✅ Rasmlar muvaffaqiyatli yuklandi!" + minWarning;
  updatePostText();

  // Inputni tozalash — bir xil faylni qayta tanlash imkoni uchun
  imageInput.value = "";
});

// =========================================================
// Preview elementini raqami bilan qo'shish
// =========================================================
function addPreview(url, index) {
  const wrap = document.createElement("div");
  wrap.className = "preview-item";

  const img = document.createElement("img");
  img.src = url;

  const label = document.createElement("span");
  label.className = "preview-label";
  label.innerText = "Rasm" + index;

  wrap.appendChild(img);
  wrap.appendChild(label);
  previewContainer.appendChild(wrap);
}

// =========================================================
// Canvas orqali rasmni WEBP formatiga o'tkazish funksiyasi
// =========================================================
function convertToWebp(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const maxWidth = 1080;
        let scale = 1;
        if (img.width > maxWidth) {
          scale = maxWidth / img.width;
        }

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/webp",
          0.8
        );
      };
    };
  });
}

// =========================================================
// Telegram post matnini shakllantirish
// =========================================================
function updatePostText() {
  const name = document.getElementById("carName").value.trim();
  const price = document.getElementById("carPrice").value.trim();
  const year = document.getElementById("carYear").value.trim();
  const mileage = document.getElementById("carMileage").value.trim();
  const location = document.getElementById("carLocation").value.trim();
  const gearbox = document.getElementById("carGearbox").value.trim();
  const color = document.getElementById("carColor").value.trim();
  const engine = document.getElementById("carEngine").value.trim();
  const fuel = document.getElementById("carFuel").value.trim();
  const instagram = document.getElementById("carInstagram").value.trim();
  const youtube = document.getElementById("carYoutube").value.trim();
  const description = document.getElementById("carDescription").value.trim();
  const date = new Date().toLocaleDateString("ru-RU");

  const lines = [];

  lines.push(`Nomi: ${name}`);
  lines.push(`Narxi: ${price}`);
  lines.push(`Yili: ${year}`);
  lines.push(`Probeg: ${mileage}`);
  if (gearbox) lines.push(`Korobka: ${gearbox}`);
  if (color) lines.push(`Rangi: ${color}`);
  if (engine) lines.push(`Motor: ${engine}`);
  if (fuel) lines.push(`Yoqilgi: ${fuel}`);
  lines.push(`Joy: ${location}`);
  lines.push(`Sana: ${date}`);
  if (instagram) lines.push(`Instagram: ${instagram}`);
  if (youtube) lines.push(`Youtube: ${youtube}`);
  if (description) lines.push(`Tavsif: ${description}`);

  uploadedImageUrls.forEach((url, i) => {
    lines.push(`Rasm${i + 1}: ${url}`);
  });

  resultText.value = lines.join("\n");
}

// =========================================================
// Nusxalash
// =========================================================
function copyPost() {
  resultText.select();
  document.execCommand("copy");
  const copyBtn = document.getElementById("copyBtn");
  copyBtn.innerText = "✅ Nusxalandi!";
  setTimeout(() => {
    copyBtn.innerText = "📋 Postni Nusxalash";
  }, 2000);
}

// =========================================================
// Hammasini tozalash (Reset)
// =========================================================
function resetForm() {
  document
    .querySelectorAll("input[type=text], input[type=number], textarea")
    .forEach((el) => {
      if (el.id === "carLocation") {
        el.value = "Toshkent sh.";
      } else if (el.id !== "resultText") {
        el.value = "";
      } else {
        el.value = "";
      }
    });

  document.querySelectorAll("select").forEach((el) => {
    el.selectedIndex = 0;
  });

  uploadedImageUrls = [];
  previewContainer.innerHTML = "";
  statusDiv.innerText = "";
  resultText.value = "";
  imageInput.value = "";
}

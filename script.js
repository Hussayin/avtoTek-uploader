const IMGBB_API_KEY = "0bf75dea880937d78cf5e554ed16a2e1";
let uploadedImageUrls = [];

const imageInput = document.getElementById("imageInput");
const statusDiv = document.getElementById("status");
const previewContainer = document.getElementById("previewContainer");
const resultText = document.getElementById("resultText");

// Inputlar o'zgarganda matnni yangilash
document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("input", updatePostText);
});

// Rasmlar tanlanganda ishga tushish
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

        // Previyu ko'rsatish
        const img = document.createElement("img");
        img.src = url;
        previewContainer.appendChild(img);
      }
    } catch (err) {
      console.error("Xatolik:", err);
    }
  }

  statusDiv.innerText = "✅ Rasmlar muvaffaqiyatli yuklandi!";
  updatePostText();
});

// Canvas orqali rasmni WEBP formatiga o'tkazish funksiyasi
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

// Telegram post matnini shakllantirish
function updatePostText() {
  const name = document.getElementById("carName").value;
  const price = document.getElementById("carPrice").value;
  const year = document.getElementById("carYear").value;
  const mileage = document.getElementById("carMileage").value;
  const location = document.getElementById("carLocation").value;
  const date = new Date().toLocaleDateString("ru-RU");

  let imgLines = uploadedImageUrls
    .map((url, i) => `Rasm${i + 1}: ${url}`)
    .join("\n");

  const post = `Nomi: ${name}\nNarxi: ${price}\nYili: ${year}\nProbeg: ${mileage}\nJoy: ${location}\nSana: ${date}${
    imgLines ? "\n" + imgLines : ""
  }`;

  resultText.value = post;
}

// Nusxalash
function copyPost() {
  resultText.select();
  document.execCommand("copy");
  const copyBtn = document.getElementById("copyBtn");
  copyBtn.innerText = "✅ Nusxalandi!";
  setTimeout(() => {
    copyBtn.innerText = "📋 Postni Nusxalash";
  }, 2000);
}

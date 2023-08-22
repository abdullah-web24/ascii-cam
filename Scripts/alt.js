myFont = new FontFace(
  "Roboto-Mono",
  "url(https://fonts.gstatic.com/s/robotomono/v22/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_7Pq_ROW4.woff2) format('woff2')",
  {
    weight: 500,
    display: "swap",
  }
);

const readyFont = async () => {
  try {
    await myFont.load();
    document.fonts.add(myFont);
  } catch (err) {
    console.log("Font err", err);
  }
};
readyFont();

// " _.,-=+:;cba!?0123456789$W#@Ñ";
// " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@"
// "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:," + '"' + "^`'. "

const getImg = () => {
  const file = imgUpload.files[0];

  console.log(file);

  srcObj.srcEl.src = URL.createObjectURL(file);
};

imgUpload.onchange = () => {
  getImg();
};

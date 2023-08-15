// Define Elements
const canvas = document.querySelector("#main-canvas"),
  invertBtn = document.querySelector("#invert-btn"),
  colorSelect = document.querySelector("#color-select"),
  downloadBtn = document.querySelector("#download-btn"),
  scaleRange = document.querySelector("#scale-range");

const ctx = canvas.getContext("2d", { willReadFrequently: true }),
  frame = {
    x: undefined,
    y: undefined,
    width: undefined,
    height: undefined,
    ratio: undefined,
  },
  gridObj = {
    maxBoxNum: scaleRange.value * 1,
    boxSize: undefined,
    rows: undefined,
    cols: undefined,
    boxes: [],
  };

const srcObj = {
    srcEl: document.createElement("video"),
  },
  myFont = new FontFace(
    "Roboto-Mono",
    "url(https://fonts.gstatic.com/s/robotomono/v22/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_7Pq_ROW4.woff2) format('woff2')",
    {
      weight: 500,
      display: "swap",
    }
  );

let charDencity = " _.,-=+:;cba!?0123456789$W#@Ñ";
// " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@"
// "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:," + '"' + "^`'. "

// srcObj.srcEl.src = "./bashar.mp4";

const readyCamera = async () => {
  try {
    const media = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    srcObj.srcEl.srcObject = media;
    srcObj.srcEl.play();
  } catch (err) {
    console.log("Camera err", err);
  }
};
readyCamera();

const readyFont = async () => {
  try {
    await myFont.load();
    document.fonts.add(myFont);
  } catch (err) {
    console.log("Font err", err);
  }
};
readyFont();

const initGridObj = () => {
  gridObj.boxSize = Math.max(frame.width, frame.height) / gridObj.maxBoxNum;
  gridObj.rows = Math.floor(frame.height / gridObj.boxSize);
  gridObj.cols = Math.floor(frame.width / gridObj.boxSize);

  gridObj.extraHeight =
    (frame.height - gridObj.rows * gridObj.boxSize) / gridObj.rows;
  gridObj.extraWidth =
    (frame.width - gridObj.cols * gridObj.boxSize) / gridObj.cols;
};

const initFrame = () => {
  srcObj.width = srcObj.srcEl.videoWidth;
  srcObj.height = srcObj.srcEl.videoHeight;

  frame.ratio = Math.min(
    canvas.width / srcObj.width,
    canvas.height / srcObj.height
  );
  frame.width = srcObj.width * frame.ratio;
  frame.height = srcObj.height * frame.ratio;
  frame.x = canvas.width / 2 - frame.width / 2;
  frame.y = canvas.height / 2 - frame.height / 2;
};

const initGridBoxPos = (thebox) => {
  thebox.height = gridObj.boxSize + gridObj.extraHeight;
  thebox.width = gridObj.boxSize + gridObj.extraWidth;

  thebox.x = frame.x + thebox.colIndx * thebox.width;
  thebox.y = frame.y + thebox.rowIndx * thebox.height;
};

class GridBox {
  constructor(rowIndx, colIndx) {
    this.rowIndx = rowIndx;
    this.colIndx = colIndx;

    initGridBoxPos(this);
  }

  getData(ctx) {
    const centerPopint = {
        x: this.x + gridObj.boxSize / 2,
        y: this.y + gridObj.boxSize / 2,
      },
      imgData = ctx.getImageData(centerPopint.x, centerPopint.y, 1, 1).data,
      grayValue = (imgData[0] + imgData[1] + imgData[2]) / 3;

    if (colorSelect.value === "colorfull") {
      this.color = `rgb(${imgData[0]},${imgData[1]},${imgData[2]})`;
    } else if (colorSelect.value === "grayscale") {
      this.color = `rgb(${grayValue},${grayValue},${grayValue})`;
    } else {
      this.color = `rgb(253, 253, 253)`;
    }

    this.charIndx = Math.floor((grayValue / 255) * (charDencity.length - 1));
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    // ctx.strokeStyle = this.color;

    ctx.font = `500 ${gridObj.boxSize}px "Roboto-Mono"`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
      charDencity[this.charIndx],
      this.x + this.width / 2,
      this.y + this.height / 2
    );

    // ctx.rect(this.x, this.y, this.width, this.height);
    // ctx.stroke();
    ctx.closePath();
  }
}

const initGridBoxes = () => {
  gridObj.boxes = [];

  for (i = 0; i < gridObj.rows; i++) {
    for (j = 0; j < gridObj.cols; j++) {
      gridObj.boxes.push(new GridBox(i, j));
    }
  }
};

const resizer = () => {
  canvas.height = innerHeight;
  canvas.width = innerWidth;

  initFrame();
  initGridObj();

  gridObj.boxes.forEach((box) => {
    initGridBoxPos(box);
  });
};
resizer();

const updateCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(srcObj.srcEl, frame.x, frame.y, frame.width, frame.height);

  gridObj.boxes.forEach((box) => {
    box.getData(ctx);
  });

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  gridObj.boxes.forEach((box) => {
    box.draw(ctx);
  });

  // ctx.beginPath();
  // ctx.strokeStyle = "red";

  // ctx.rect(frame.x, frame.y, frame.width, frame.height);
  // ctx.stroke();
  // ctx.closePath();

  requestAnimationFrame(updateCanvas);
};

srcObj.srcEl.onloadeddata = () => {
  initFrame();
  initGridObj();
  initGridBoxes();
  updateCanvas();
};

// Dom Interactions
invertBtn.onclick = () => {
  charDencity = charDencity.split("").reverse().join("");
};

scaleRange.oninput = () => {
  gridObj.maxBoxNum = scaleRange.value * 1;

  initGridObj();
  initGridBoxes();
};

onresize = resizer;
downloadBtn.onclick = () => {
  setTimeout;
  const imageLink = canvas.toDataURL("image/png", 1.0);
  downloadBtn.href = imageLink;
};

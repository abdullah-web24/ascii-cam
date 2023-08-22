// Define Elements
const canvas = document.querySelector("#main-canvas"),
  invertBtn = document.querySelector("#invert-btn"),
  colorSelect = document.querySelector("#color-select"),
  downloadBtn = document.querySelector("#download-btn"),
  coppyBtn = document.querySelector("#coppy-btn"),
  scaleRange = document.querySelector("#scale-range"),
  colorRange = document.querySelector("#color-range"),
  modeBtn = document.querySelector("#mode-btn"),
  picCanvas = document.createElement("canvas");

// Define Main Objects
const ctx = canvas.getContext("2d", { willReadFrequently: true }),
  picCtx = picCanvas.getContext("2d"),
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

// Define Source Objects
const srcObj = {
    srcEl: document.createElement("video"),
    width: undefined,
    height: undefined,
    cameraMode: "environment",
    src: undefined,

    handleSize() {
      this.height = this.srcEl.videoHeight;
      this.width = this.srcEl.videoWidth;
    },
  },
  charObj = {
    mainChars: " .:-=+*#%@",
    activeChars: "",

    init() {
      const val = this.mainChars.length - 1;
      colorRange.min = -val;
      colorRange.max = val;
    },
    adjBrightness(initVal) {
      const val = Math.abs(initVal);
      let charArr = this.mainChars.split("");
      if (initVal < 0) charArr = charArr.reverse();

      for (i = 0; i < val; i++) {
        const char = charArr[i];
        for (j = val - i; j > 0; j--) {
          charArr[i] += char;
        }
      }

      if (initVal < 0) charArr = charArr.reverse();
      this.activeChars = charArr.join("");
    },
  },
  colorObj = {
    background: "rgb(15, 15, 15)",
    main: "rgb(253, 253, 253)",
  };

charObj.init();
charObj.adjBrightness(colorRange.value);

const getCamera = async () => {
  try {
    console.log("hi");
    if (srcObj.src) {
      srcObj.src.getTracks().forEach(function (track) {
        track.stop();
      });
    }
    srcObj.src = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: srcObj.cameraMode,
      },
    });

    console.log(srcObj.src);

    srcObj.srcEl.srcObject = srcObj.src;
    srcObj.srcEl.play();
  } catch (err) {
    console.log("Camera err", err);
  }
};
getCamera();

const copyTxt = async (txt) => {
  try {
    await navigator.clipboard.writeText(txt);
  } catch (err) {
    console.log("Clipboard err", err);
  }
};

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
  srcObj.handleSize();

  frame.ratio = Math.min(
    canvas.width / srcObj.width,
    canvas.height / srcObj.height
  );
  frame.width = srcObj.width * frame.ratio;
  frame.height = srcObj.height * frame.ratio;
  frame.x = canvas.width / 2 - frame.width / 2;
  frame.y = canvas.height / 2 - frame.height / 2;

  // Pic canvas
  picCanvas.width = frame.width;
  picCanvas.height = frame.height;
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
      this.color = colorObj.main;
    }

    const charIndx = Math.floor(
      (grayValue / 255) * (charObj.activeChars.length - 1)
    );
    this.char = charObj.activeChars[charIndx];
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    // ctx.strokeStyle = this.color;

    ctx.font = `500 ${gridObj.boxSize * 1.3}px "Roboto Mono"`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(this.char, this.x + this.width / 2, this.y + this.height / 2);

    // ctx.fillRect(this.x, this.y, this.width, this.height);
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
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  initFrame();
  initGridObj();

  gridObj.boxes.forEach((box) => {
    initGridBoxPos(box);
  });
};
resizer();

const updateCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(srcObj.srcEl, frame.x, frame.y, frame.width, frame.height);

  gridObj.boxes.forEach((box) => {
    box.getData(ctx);
  });

  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.fillStyle = colorObj.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.closePath();

  gridObj.boxes.forEach((box) => {
    box.draw(ctx);
  });

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
  charObj.mainChars = charObj.mainChars.split("").reverse().join("");
  charObj.adjBrightness(colorRange.value);

  const color = colorObj.main;
  colorObj.main = colorObj.background;
  colorObj.background = color;
};

scaleRange.oninput = () => {
  gridObj.maxBoxNum = scaleRange.value * 1;

  initGridObj();
  initGridBoxes();
};

onresize = resizer;

downloadBtn.onclick = () => {
  picCtx.drawImage(
    canvas,
    frame.x,
    frame.y,
    frame.width,
    frame.height,
    0,
    0,
    frame.width,
    frame.height
  );
  const imageLink = picCanvas.toDataURL("image/png", 1.0);
  downloadBtn.href = imageLink;
};

coppyBtn.onclick = () => {
  let theText = ``;

  gridObj.boxes.forEach((box) => {
    theText += box.char;

    if (box.colIndx === gridObj.cols - 1) {
      theText += "\n";
    }
  });

  copyTxt(theText);
};

colorRange.oninput = () => {
  charObj.adjBrightness(colorRange.value);
};

modeBtn.onclick = () => {
  srcObj.cameraMode = srcObj.cameraMode === "user" ? "environment" : "user";

  getCamera();
};

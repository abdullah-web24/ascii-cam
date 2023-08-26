const svgImporter = () => {
  const svgObjects = document.querySelectorAll("object.svg");

  svgObjects.forEach((theObj) => {
    const svgDocument = theObj.contentDocument;

    const parentElement = theObj.parentElement;
    const styleClass = theObj.dataset.class || "svg";

    if (svgDocument?.isConnected) {
      const mainSvg = svgDocument.querySelector("svg");
      mainSvg.classList.add(styleClass);
      parentElement.replaceChild(mainSvg, theObj);
    }
  });
};

onload = svgImporter;

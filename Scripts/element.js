const slideEls = document.querySelectorAll(".slide-cont"),
  settingsBtn = document.querySelector("#settings-btn"),
  settingsTab = document.querySelector(".settings-tab"),
  backBtn = document.querySelector("#back-btn");

slideEls.forEach((el) => {
  const button = el.querySelector("button");

  button.onclick = () => {
    slideEls.forEach((el2) => {
      if (el2 !== el) el2.classList.remove("active");
    });

    el.classList.toggle("active");
  };
});

settingsBtn.onclick = () => {
  settingsTab.classList.add("active");
};
backBtn.onclick = () => {
  settingsTab.classList.remove("active");
};

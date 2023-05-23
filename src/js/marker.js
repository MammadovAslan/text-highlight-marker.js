//DATA
const data = JSON.parse(localStorage.getItem("highlights-data")) || [];
let markCounter = data?.at(-1)?.counter + 1 || 1;

//*Add font-awesome CDN
const fontAwesome = document.createElement("link");
fontAwesome.rel = "stylesheet";
fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
fontAwesome.crossorigin = "anonymous";
fontAwesome.referrerpolicy = "no-referrer";
document.head.append(fontAwesome);

//*Add CSS in head
const cssFile = document.createElement("link");
cssFile.rel = "stylesheet";
cssFile.href = "./src/css/style.css";
document.head.append(cssFile);

//* Add Toolsbar in HTML body
const toolsbar = document.createElement("div");
toolsbar.setAttribute("id", "toolbar");
toolsbar.classList.add("toolsbar");

//*Disables UNDO mark button if there is no marks on the page
let disableUndo = data.length > 0 ? "" : "disabled";


//*TOOLBAR
toolsbar.innerHTML = `
    <div class="highlight-mark-tools">
      <input type="color" class="color-input toolbar-element" value="#ffee00" />
      <input type="checkbox" class="color-checkbox toolbar-element" value="#ffee00" id="color-checkbox"/>
      <label for="color-checkbox" class="color-label toolbar-element"><i class="fa-solid fa-marker "></i></label>
      <button ${disableUndo} class="undo-marker-button toolbar-element"><i class="fa-solid fa-rotate-left"></i></button>
      <input type="checkbox" class="add-comment-checkbox toolbar-element" value="#ffee00" id="add-comment-checkbox"/>
      <label for="add-comment-checkbox" class="add-comment-label toolbar-element"><i class="fa-solid fa-plus"></i></label>

    <div/>
      `;
document.body.prepend(toolsbar);

//* Set initial color value
let color = "rgba(255, 238, 0, 0.5)";
const transparency = 0.5; //set highligh transparancy

//* Handle color change event
const colorInput = document.querySelector(".color-input");
colorInput.addEventListener("change", (e) => {
  color = hexToRgba(e.target.value, transparency);
});

//*Event listeners for 2 checkboxes:add mark and comment. Is any of them is cheched, the other one will be uncheched

const colorCheckbox = document.querySelector("#color-checkbox");//sets commentCheckbox to not-checked
colorCheckbox.addEventListener("change", () => {
  commentCheckbox.checked = false;
});

const commentCheckbox = document.querySelector("#add-comment-checkbox");//sets colorCheckbox to not-checked
commentCheckbox.addEventListener("change", () => {
  colorCheckbox.checked = false;
});

//* Convert Hex color from input:color to RGBA
const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

//*This function define if the event.target belongs to toolbar(true/false)
const excludeToolbar = (event) => {
  const classNames = [
    "toolsbar",
    "toolbar-element",
    "color-label",
    "highlight-mark-tools",
    "fa-solid",
    "fa-marker",
    "fa-plus",
    "modal-form",
    "comment-modal",
    "comment-input",
    "submit-comment-button",
    "color-input"
  ];
  const isToolbar = classNames.some((className) => event.target.classList.contains(className));

  return isToolbar;
};

function undoMark() {
  const markInstance = new Mark(document.body);

  if (markCounter > 0) {
    markCounter--;
    markInstance.unmark({
      className: `highlight-${markCounter}`,
    });
    data.pop();
    localStorage.setItem("highlights-data", JSON.stringify(data));
  }

  if (data.length === 0) {
    this.disabled = true;
  }
}
//*-----------------Add highilighing mark(mark.js)-----------------
const highlight = (start, length, counter, color) => {
  const markInstance = new Mark(document.body);
  markInstance.markRanges([{ start, length }], {
    acrossElements: false,
    wildcards: "disabled",
    element: "mark",
    esclude: ["style", "iframe"],
    each: (element) => {
      element.classList.add(`highlight-${counter}`);
      element.style.backgroundColor = color;
    },
  });
};

//! ------------------Highlight selected text------------------
//here we call highlight and undoMark functions
const highlightSelectedText = (e) => {
  const range = getSelectionStartAndLength(document.body);

  const start = range.start;
  const length = range.length;
  const undoButton = document.querySelector(".undo-marker-button");
  undoButton.addEventListener("click", undoMark);

  const isToolbar = excludeToolbar(e);
  if (
    !!start &&
    !!length &&
    !isToolbar &&
    colorCheckbox.checked
  ) {
    //IMPORTANT: mark will be added only if conditions above are true
    highlight(start, length, markCounter, color);
    data.push({ start, length, color, counter: markCounter }); 
    localStorage.setItem("highlights-data", JSON.stringify(data));
    markCounter++;
    undoButton.disabled = false;
  }
};



//*-----------Render highlighting marks from server/storage-----------
const renderHighlightings = () => {
  const storeData = JSON.parse(localStorage.getItem("highlights-data"));

  if (storeData?.length > 0) {
    storeData.forEach((el) => {
      highlight(el.start, el.length, el.counter, el.color);
    });
  }
};


//*--------Get starting position and length of selected area--------
const getSelectionStartAndLength = (element) => {
  let start = 0;
  let length = 0;
  let sel, range, priorRange;

  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0).cloneRange();
      if (element.contains(range.startContainer)) {
        priorRange = document.createRange();
        priorRange.setStartBefore(element);
        priorRange.setEnd(range.startContainer, range.startOffset);
        start = priorRange.toString().length;
        length = range.toString().length;
      }
    }
  } else if (document.selection && (sel = document.selection).type) {
    range = sel.createRange();
    priorRange = document.body.createTextRange();
    priorRange.moveToElementText(element);
    priorRange.setEndPoint("EndToStart", range);
    start = priorRange.text.length;
    length = range.text.length;
  }

  return {
    start,
    length,
  };
};

//*------------Cut all style tags from body and paste them in head------------
function removeAllStyleTags() {
  const styleTags = document.body.querySelectorAll("style");
  styleTags.forEach((styleTag) => {
    const styleTagPrime = styleTag.cloneNode(true);
    document.head.append(styleTagPrime);
  });

  const tagsToRemove = document.body.querySelectorAll("style");
  tagsToRemove.forEach((styleTag) => {
    styleTag.remove();
  });
}



document.addEventListener("mouseup", highlightSelectedText);
renderHighlightings();
removeAllStyleTags();

//TODO------------Adding comments---------------
// let commentCount = 1;
// const addComment = (e) => {
//   e.stopPropagation();
//   const isToolbar = excludeToolbar(e);

//   if (commentCheckbox.checked && !isToolbar) {
//     const range = getSelectionStartAndLength(document.body);
//     const start = range.start;

//     const markInstance = new Mark(document.body);
//     markInstance.markRanges([{ start, length: 1 }], {
//       acrossElements: false,
//       wildcards: "disabled",
//       element: "mark",
//       esclude: ["style"],
//       each: (element) => {
//         element.classList.add(`comment-${commentCount}`);
//         element.classList.add(`comment`);

//       },
//     });
//     const div = document.createElement("div");
//     div.style.width = "200px";
//     div.style.height = "200px";
//     div.style.backgroundColor = "rgba(0,0,0,0.5)";
//     div.style.position = "absolute";
//     div.style.top = offsetObj.top + "px";
//     div.style.left = offsetObj.left + "px";
//     e.target.append(div);
//   }
// };
//document.addEventListener("click", addComment);
// const offsetObj = {};
// document.addEventListener("mouseover", (e) => {
//   let k = e.target;

//   const div = document.createElement("div");
  // div.classList.add("selected-element-line");
  // div.style.width = "100%";
  // div.style.height = "100%";
  // div.style.backgroundColor = "rgba(1,1,1,0.3)";
  // div.style.position = "absolute";
  // div.style.top = k.offsetTop;
  // div.style.left = k.offsetLeft;
//   k.append(div);
//   offsetObj.top = k.offsetTop;
//   offsetObj.left = k.offsetLeft;
// });

// document.addEventListener("mouseout", (e) => {
//   let k = e.target;
//   const line = document.querySelector(".selected-element-line");
//   line.remove();
// });

// <!-- Main JS -->
// <script src="https://cdn.jsdelivr.net/npm/mark.js"></script>
// <script type="module" src="./src/js/marker.js"></script>

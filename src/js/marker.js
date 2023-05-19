const toolsbar = document.createElement("div");
toolsbar.setAttribute("id", "toolbar");
toolsbar.innerHTML = `
    <div>
      <input type="color" class="color-input" value="#ffee00" />
      <input type="checkbox" class="color-checkbox" value="#ffee00" id="color-checkbox"/>
      <label for="color-checkbox">Highilight</label>
    <div/>

      `;
document.body.prepend(toolsbar);

// Set initial color value
let color = "rgba(255, 238, 0, 0.5)";
const transparency = 0.5; //set highligh transparancy

// Handle color change event
const colorInput = document.querySelector(".color-input");
colorInput.addEventListener("change", (e) => {
  color = hexToRgba(e.target.value, transparency);
});

// Convert Hex to RGBA
const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

let markCounter = 1;
//DATA
const data = JSON.parse(localStorage.getItem("highlights-data")) || [];

// Highlight selected text
const highlightSelectedText = (e) => {
  const checkbox = document.querySelector('#color-checkbox')
  const range = getSelectionStartAndLength(document.body);
  const start = range.start;
  const length = range.length;

  checkbox.checked && highlight(start, length, markCounter, color);

  if (!!start && !!length && !e.target.classList.contains("color-input")) {
    data.push({ start, length, color, counter: markCounter }); //sending data object
    localStorage.setItem("highlights-data", JSON.stringify(data));
  }

  markCounter++;
};

//Render highlighting marks from server/storage
const renderHighlightings = () => {
  const storeData = JSON.parse(localStorage.getItem("highlights-data"));

  if (storeData?.length > 0) {
    storeData.forEach((el) => {
      highlight(el.start, el.length, el.counter, el.color);
    });
  }
};

//Add highilighing mark
const highlight = (start, length, counter, color) => {
  const markInstance = new Mark(document.body);

  markInstance.markRanges([{ start, length }], {
    acrossElements: false,
    wildcards: "disabled",
    element: "mark",
    each: (element) => {
      element.classList.add(`highlight-${counter}`);
      element.style.backgroundColor = color;
    },
  });
};

//Get starting position and length of selected area
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

document.addEventListener("mouseup", highlightSelectedText);
renderHighlightings();

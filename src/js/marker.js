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
const data = []; //!This data should be sent to the server

// Highlight selected text
const highlightSelectedText = (e) => {
  const markInstance = new Mark(document.body);

  const range = getSelectionStartAndLength(document.body);
  const start = range.start; // || data.range.start
  const length = range.length; // || data.range.length

  markInstance.markRanges([range], {
    acrossElements: false,
    wildcards: "disabled",
    element: "mark",
    each: (element) => {
      element.classList.add(`highlight-${markCounter}`);
      element.style.backgroundColor = color;
    },
  });

  if (!!start && !!length && !e.target.classList.contains("color-input"))
    data.push({ start, length, color, counter: markCounter }); //sending data object

  markCounter++;
};

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

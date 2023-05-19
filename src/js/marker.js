// Set initial color value
let color = "";
const transparency = 0.5;//set highligh transparancy

// Handle color change event
const colorInput = document.querySelector(".color-input");
colorInput.addEventListener("change", (e) => {
  color = hexToRgba(e.target.value, transparency);
});

// Convert Hex to RGBA
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

let counter = 1;

// Highlight selected text
function highlightSelectedText() {
  const markInstance = new Mark(document.body);

  const range = getSelectionStartAndLength(document.body);
  const start = range.start;
  const length = range.end;

  markInstance.markRanges([{ start, length }], {
    acrossElements: false,
    wildcards: "disabled",
    element: "mark",
    each: (element) => {
      element.classList.add(`highlight-${counter}`);
      element.style.backgroundColor = color;
    },
  });

  counter += 1;
}

function getSelectionStartAndLength(element) {
  let start = 0,
    length = 0;
  let sel, range, priorRange;

  if (typeof window.getSelection !== "undefined") {
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
  } else if (
    typeof document.selection !== "undefined" &&
    (sel = document.selection).type !== "Control"
  ) {
    range = sel.createRange();
    priorRange = document.body.createTextRange();
    priorRange.moveToElementText(element);
    priorRange.setEndPoint("EndToStart", range);
    start = priorRange.text.length;
    length = range.text.length;
  }

  return {
    start,
    end:length,
  };
}

document.addEventListener("mouseup", highlightSelectedText);

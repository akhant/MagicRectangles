//create and delete connection by double click on rectangle

(function() {
  let canv = document.getElementById("canvas");
  ctx = canv.getContext("2d");
  canv.width = window.innerWidth;
  canv.height = window.innerHeight;

  let mouse = {
    x: 0,
    y: 0
  };
  let allRect = [];
  let selected = false;
  let boxes = [];

  const rectWidth = 100;
  const rectHeight = 50;

  let Rect = function(x, y, w, h, colorRGB) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.colorRGB = colorRGB;
    this.line = false;
  };

  Rect.prototype = {
    draw: function() {
      ctx.fillRect(this.x, this.y, this.w, this.h);
    },
    stroke: function() {
      ctx.strokeRect(this.x, this.y, this.w, this.h);
    },
    color: function() {
      ctx.fillStyle = this.colorRGB;
    }
  };

  //helpers --------------------------------------------------------------
  isCursorInRect = rect =>
    mouse.x > rect.x &&
    mouse.x < rect.x + rect.w &&
    mouse.y > rect.y &&
    mouse.y < rect.y + rect.h;

  isCursorCloseRect = rect =>
    mouse.x > rect.x - rect.w / 2 &&
    mouse.x < rect.x + rect.w * 1.5 &&
    mouse.y > rect.y - rect.h / 2 &&
    mouse.y < rect.y + rect.h * 1.5;

  isCursorCloseBorder = rect =>
    mouse.x > canv.width - rect.w / 2 ||
    mouse.x < rect.w / 2 ||
    mouse.y > canv.height - rect.h / 2 ||
    mouse.y < rect.h / 2;

  setSelectedRectOut = rect => {
    if (mouse.x < rect.x + rect.w / 2) {
      selected.x = rect.x - rect.w;
      selected.y = mouse.y - selected.h / 2;
    }
    if (mouse.x >= rect.x + rect.w / 2) {
      selected.x = rect.x + rect.w;
      selected.y = mouse.y - selected.h / 2;
    }
    if (mouse.y <= rect.y + rect.h / 2) {
      selected.y = rect.y - rect.h;
      selected.x = mouse.x - selected.w / 2;
    }
    if (mouse.y > rect.y + rect.h / 2) {
      selected.y = rect.y + rect.h;
      selected.x = mouse.x - selected.w / 2;
    }
  };

  drawLine = (rect1, rect2) => {
    ctx.beginPath();
    ctx.moveTo(rect1.x + rect1.w / 2, rect1.y + rect1.h / 2);
    ctx.lineTo(rect2.x + rect2.w / 2, rect2.y + rect2.h / 2);
    ctx.stroke();
  };

  clearLine = rect => {
    //delete line from link
    for (let i in allRect) {
      if (allRect[i] === rect) {
        allRect[i].line = false;
      }
      //delete record from boxes
      boxes.map(box => {
        if (
          (box.rect1 === allRect[i] && box.rect2 === rect) ||
          (box.rect2 === allRect[i] && box.rect1 === rect)
        ) {
          boxes.splice(boxes.indexOf(box), 1);
        }
      });
    }
  };

  //Listeners -------------------------------------------------------------------------
  canv.addEventListener("dblclick", e => {
    for (let i in allRect) {
      let rect = allRect[i];

      //delete line
      if (rect.line && isCursorInRect(rect)) {
        clearLine(rect.line);
        rect.line = false;
        return;
      }

	  //add record to boxes and if there are 2 records in boxes object add line
      if (!rect.line && isCursorInRect(rect)) {
        if (boxes.every(box => box.rect2) || boxes.length === 0) {
          boxes.push({ rect1: rect });
        }
        boxes.map(box => {
          if (box.rect1 && !box.rect2 && box.rect1 !== rect) {
            box.rect2 = rect;
            box.rect2.line = box.rect1;
            box.rect1.line = box.rect2;
          }
        });
      }

	  //don't make rectangle if too close to each other or border
      if (isCursorCloseRect(rect) || isCursorCloseBorder(rect)) {
        return;
      }
    }

    //random color
    let newColor = "rgb(" + Math.random() * 255 + "," + Math.random() * 255 + "," + Math.random() * 255 + ")";
	  //make rectangle
    let newRect = new Rect( e.clientX - rectWidth / 2, e.clientY - rectHeight / 2, rectWidth, rectHeight, newColor);
    newRect.draw();
    allRect.push(newRect);
  });

  canv.addEventListener("mousemove", e => {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
  });

  canv.addEventListener("mousedown", e => {
    //set selected
    if (!selected) {
      for (let i in allRect) {
        if (isCursorInRect(allRect[i])) {
          selected = allRect[i];
        }
      }
    }
  });

  canv.addEventListener("mouseup", e => {
    //set selected rectangle out of exists rectangle
    for (let i in allRect) {
      let rect = allRect[i];

      if (selected && isCursorCloseRect(rect) && selected !== rect) {
        setSelectedRectOut(rect);
      }
    }

    //drop rectangle
    selected = false;
  });

  //animate -------------------------------------------------------------
  animate = () => {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canv.width, canv.height);
    for (let i in allRect) {
      let rect = allRect[i];
      rect.color();
      rect.draw();

      //add border
      if (isCursorInRect(rect)) {
        rect.stroke();
      }

      //draw line between selected rectangles if they have link
      if (rect.line) {
        drawLine(rect, rect.line);
      }

      //drag rectangle
      if (selected) {
        if (allRect.some(newRect => selected !== newRect && isCursorCloseRect(newRect))) {
          if (isCursorCloseRect(rect)) setSelectedRectOut(rect);
          
        } else {
          selected.x = mouse.x - selected.w / 2;
          selected.y = mouse.y - selected.h / 2;
        }
      }
    }
  };

  animate();
})();

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let ctx = canvas.getContext('2d');
let width = 69420;
let height = 69420;
let panX = 0;
let panY = 0;
let zoomScale = 1;
let currentFloor = 1;
class Piece {
    constructor() {
        this.vertices = [];
        this.color = "black"
        this.type = "generic"
        this.rotation = 0
        this.jumpPositions = [];
        this.filled = false;
        this.stroked = true;
        this.fillColor = "black"
        this.floor = currentFloor
        this.width = genericWidth;
        this.height = genericHeight;
    }
}
let pieces = [];
let wallVertices = [];
const rotationSlider = document.getElementById('rotationSlider');
rotationSlider.addEventListener('input', (e) => {
    const angleInDegrees = parseFloat(e.target.value);
    spawnRotation = angleInDegrees * (Math.PI / 180);
});
function loop() {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(zoomScale, 0, 0, zoomScale, panX, panY)
    drawCanvas()
    if (lastVertex && makingWall) {
        ctx.setLineDash([5, 5]);
        drawLine(mouseX, mouseY)
        ctx.setLineDash([]);
    }
    drawGrid()
    if (makingWall) {
        drawMouseCoords(mouseX, mouseY)
    }
    drawWalls(wallVertices)
    ctx.globalAlpha = 1
    drawPieces()
    drawDraggedItem()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    drawSidebar()
    ctx.setTransform(zoomScale, 0, 0, zoomScale, panX, panY)
    ctx.globalAlpha = 1
    drawRotationIndicator()
    requestAnimationFrame(loop)
}
function drawRotationIndicator() {
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.font = "16px arial"
    ctx.fillStyle = "pink"
    ctx.fillText(`Rotation: ${Math.round(spawnRotation * (180 / Math.PI))}°`, 60, 125)
    ctx.beginPath()
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2
    ctx.fillStyle = "pink"
    ctx.translate(25, 125)
    ctx.rotate(spawnRotation)
    ctx.translate(-50, -50)
    ctx.arc(50, 50, 25, 0, Math.PI * 2)
    ctx.fill()
    ctx.moveTo(50, 50)
    ctx.lineTo(50, 25)
    ctx.stroke()
    ctx.restore()
}
function drawDraggedItem() {
    if (dragging && draggedItem) {
        if (draggedItem === 'generic') {
            ctx.fillStyle = "grey"
            ctx.fillRect(mouseX - 25, mouseY - 25, 50, 50)
            return;
        }
        ctx.beginPath()
        ctx.strokeStyle = "grey"
        ctx.save();
        let vertices = null
        switch (draggedItem) {
            case 'door':
            case 'door2':
                vertices = doorVertices;
                break;
            case 'window':
                vertices = windowVertices;
                break;
            case 'bed':
                vertices = bedVertices;
                break;
            case 'table':
                vertices = tableVertices;
                break;
            case 'chair':
                vertices = chairVertices;
                break;
            case 'square':
                vertices = [0, 0, genericWidth, 0, genericWidth, genericHeight, 0, genericHeight, 0, 0];
                break;
            case 'circle':
                vertices = generateEllipseVertices(mouseX + (genericWidth / 2), mouseY + (genericHeight / 2), genericWidth / 2, genericHeight / 2, 36, spawnRotation);
                break;
            case 'stair':
                vertices = stairVertices;
                break;
        }
        for (let i = 0; i < vertices.length; i += 2) {
            const x = vertices[i] + mouseX;
            const y = vertices[i + 1] + mouseY;
            const rotatedX = Math.cos(spawnRotation) * (x - mouseX) - Math.sin(spawnRotation) * (y - mouseY) + mouseX;
            const rotatedY = Math.sin(spawnRotation) * (x - mouseX) + Math.cos(spawnRotation) * (y - mouseY) + mouseY;

            if (i === 0) {
                ctx.moveTo(rotatedX, rotatedY);
            } else {
                ctx.lineTo(rotatedX, rotatedY);
            }
        }
        for (let i = 0; i < vertices.length; i += 2) {
            const x = vertices[i];
            const y = vertices[i + 1];
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.lineWidth = 1;
        if (draggedItem === "window") {
            ctx.lineWidth = 3
        }
        ctx.stroke();
        ctx.restore();
        if (draggedItem === 'door' || draggedItem === 'door2') {
            ctx.save();
            const x = doorVertices[0] + mouseX;
            const y = doorVertices[1] + mouseY;
            ctx.translate(x, y);
            ctx.rotate(spawnRotation);
            ctx.translate(-x, -y);
            ctx.beginPath();
            ctx.lineWidth = 0.75;
            if (draggedItem === 'door') {
                ctx.arc(x, y + 30, 30, Math.PI, Math.PI * 1.5);
            } else if (draggedItem === 'door2') {
                ctx.arc(x, y + 30, 30, Math.PI * 1.5, 0);
            }
            ctx.stroke();
            ctx.restore();
        }
    }
}
function drawCanvas() {
    ctx.fillStyle = "#111111"
    ctx.fillRect(0, 0, width, height)
}
function drawSidebar() {
    ctx.fillStyle = "rgb(84, 84, 84)"
    ctx.fillRect(0, 0, width, 75)
}
let rotation = 0;
let genericStroked = true;
let genericFilled = true;
const genericStrokedCheckbox = document.getElementById('genericStroked');
genericStrokedCheckbox.addEventListener('change', (e) => {
    genericStroked = e.target.checked;
})
const genericFilledCheckbox = document.getElementById('genericFilled');
genericFilledCheckbox.addEventListener('change', (e) => {
    genericFilled = e.target.checked;
})
function drawPieces() {
    ctx.fillStyle = "grey"
    for (let piece of pieces) {
        ctx.beginPath();
        ctx.strokeStyle = piece.color
        ctx.fillStyle = piece.fillColor
        if (piece.floor !== currentFloor) {
            if (piece.floor < currentFloor) {
                ctx.globalAlpha = 0.25;
                if (piece.type === 'stair') {
                    ctx.globalAlpha = 0.4;
                }
                if (piece.floor < currentFloor - 1) {
                    continue
                }
            } else {
                continue;
            }
        } else {
            ctx.globalAlpha = 1;
        }
        for (let i = 0; i < piece.vertices.length; i += 2) {
            const x = piece.vertices[i];
            const y = piece.vertices[i + 1];
            if (piece.jumpPositions.includes(i / 2)) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.lineWidth = 1;
        if (piece.type === "window") {
            ctx.lineWidth = 3
        }
        if (piece.stroked) {
            ctx.stroke()
        }
        if (piece.filled) {
            ctx.fill()
        }
        ctx.save()
        ctx.setLineDash([2, 2]);
        ctx.translate(piece.vertices[0], piece.vertices[1]);
        ctx.rotate(piece.rotation);
        ctx.translate(-piece.vertices[0], -(piece.vertices[1]));
        ctx.beginPath()
        if (piece.type === "door") {
            ctx.arc(piece.vertices[0], piece.vertices[1] + 30, 30, Math.PI, Math.PI * 1.5);
        } else if (piece.type === "door2") {
            ctx.arc(piece.vertices[0], piece.vertices[1] + 30, 30, Math.PI * 1.5, 0);
        }
        ctx.strokeStyle = piece.color
        ctx.lineWidth = 0.75
        ctx.stroke();
        ctx.restore();
    }
    ctx.globalAlpha = 1
}
function drawGrid() {
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 0.25;
    ctx.beginPath();
    for (let x = 0; x < width; x += 10) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += 10) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
    }
    ctx.stroke();
}
function drawWalls(vertices) {
    for (let i = 0; i < vertices.length - 1; i++) {
        const [x1, y1, jump1, floor1] = vertices[i];
        const [x2, y2, jump2, floor2] = vertices[i + 1];

        if (floor1 !== currentFloor || floor2 !== currentFloor) {
            if (floor1 < currentFloor && floor2 < currentFloor) {
                ctx.globalAlpha = 0.4;
                if (floor1 < currentFloor - 1 && floor2 < currentFloor - 1) {
                    continue
                }
            } else {
                continue;
            }
        } else {
            ctx.globalAlpha = 1;
        }

        if (!jump1 && !jump2) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = "white";
            ctx.lineWidth = 1.75;
            ctx.stroke();
        }
    }
}
function drawLine(x, y) {
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.globalAlpha = 1
    ctx.lineWidth = 2
    ctx.moveTo(lastVertex.x, lastVertex.y);
    ctx.lineTo(x, y);
    ctx.stroke();
}
function drawMouseCoords(x, y) {
    ctx.fillStyle = "pink";
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
}
let mouseX = 0
let mouseY = 0
let gridEnabled = true;
document.addEventListener('mousemove', (e) => {
    if (gridEnabled) {
        mouseX = (Math.round(getTransformedMouseCoords(e.clientX, e.clientY).x / 10)) * 10;
        mouseY = (Math.round(getTransformedMouseCoords(e.clientX, e.clientY).y / 10)) * 10;
    } else {
        mouseX = getTransformedMouseCoords(e.clientX, e.clientY).x;
        mouseY = getTransformedMouseCoords(e.clientX, e.clientY).y;
    }
});
let lastVertex = null;
let makingWall = true;
let hovering = false;
const UI = document.getElementById('UI');
UI.addEventListener('mouseenter', () => {
    hovering = true;
});
UI.addEventListener('mouseleave', () => {
    hovering = false;
});
document.addEventListener('mousedown', (e) => {
    if (hovering) return;
    if (e.button === 0) {
        if (!makingWall) return;
        if (lastVertex) {
            wallVertices.push([lastVertex.x, lastVertex.y, false, currentFloor]);
        }
        lastVertex = { x: mouseX, y: mouseY };
        wallVertices.push([lastVertex.x, lastVertex.y, newArea, currentFloor]);
        newArea = false;
    }
    if (e.button === 2) {
        e.preventDefault();
        let mouseCoords = getTransformedMouseCoords(e.clientX, e.clientY);
        if (removePiece(mouseCoords.x, mouseCoords.y)) return;
        removeWall(wallVertices, mouseCoords.x, mouseCoords.y)
    }
});
function removeWall(vertices, mx = 0, my = 0) {
    let points = [];
    for (let i = 0; i < vertices.length; i++) {
        if (vertices[i][3] !== currentFloor) {
            continue;
        }
        if (vertices[i][2] === false && vertices[(i + 1) % vertices.length][2] === false) {
            const [x1, y1] = vertices[i];
            const [x2, y2] = vertices[(i + 1) % vertices.length];
            const dx = x2 - x1;
            const dy = y2 - y1;
            const distance = Math.hypot(dx, dy);
            const steps = Math.ceil(distance / 5);
            for (let j = 0; j <= steps; j++) {
                const t = j / steps;
                const x = x1 + t * dx;
                const y = y1 + t * dy;
                points.push({ x, y, index1: i, index2: (i + 1) % vertices.length });
            }
        }
    }
    let closestPoint = null;
    let closestDistance = Infinity;
    for (const point of points) {
        const dx = point.x - mx;
        const dy = point.y - my;
        const distance = Math.hypot(dx, dy);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestPoint = point;
        }
    }
    if (!closestPoint) return;
    let biggestIndex = Math.max(closestPoint.index1, closestPoint.index2);
    let smallestIndex = Math.min(closestPoint.index1, closestPoint.index2);
    if (wallVertices[biggestIndex][2] === true) {
        wallVertices[smallestIndex][2] = true;
    } else {
        wallVertices[biggestIndex][2] = true;
    }
}

function removePiece(x, y) {
    let closestPiece = null;
    let closestDistance = Infinity;

    for (let piece of pieces) {
        if (piece.floor !== currentFloor) {
            continue;
        }

        let maxX = -Infinity;
        let maxY = -Infinity;
        let minX = Infinity;
        let minY = Infinity;

        for (let j = 0; j < piece.vertices.length; j += 2) {
            const px = piece.vertices[j];
            const py = piece.vertices[j + 1];
            maxX = Math.max(maxX, px);
            maxY = Math.max(maxY, py);
            minX = Math.min(minX, px);
            minY = Math.min(minY, py);
        }

        if (x >= minX - 5 && x <= maxX + 5 && y >= minY - 5 && y <= maxY + 5) {
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            const distance = Math.hypot(centerX - x, centerY - y);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestPiece = piece;
            }
        }
    }

    if (closestPiece) {
        const index = pieces.indexOf(closestPiece);
        if (index !== -1) {
            pieces.splice(index, 1);
            return true;
        }
    }

    return false;
}
function recenterCanvas() {
    const totalWidth = width;
    const totalHeight = height;
    const scaleX = window.innerWidth / totalWidth;
    const scaleY = window.innerHeight / totalHeight;
    zoomScale = 1;
    panX = (window.innerWidth - totalWidth * zoomScale) / 2;
    panY = (window.innerHeight - totalHeight * zoomScale) / 2;
}
function getTransformedMouseCoords(mouseX, mouseY) {
    const inverseZoom = 1 / zoomScale;
    const transformedX = (mouseX - panX) * inverseZoom;
    const transformedY = (mouseY - panY) * inverseZoom;
    return {
        x: transformedX,
        y: transformedY
    };
}
document.addEventListener("wheel", function (e) {
    if (hovering) return;
    let t = Math.pow(1.005, e.deltaY);
    zoomOriginX = e.clientX;
    zoomOriginY = e.clientY;
    panX -= (zoomOriginX - panX) * (t - 1);
    panY -= (zoomOriginY - panY) * (t - 1);
    zoomScale *= t;
});
let newArea = false;
let spawnRotation = 0;
document.addEventListener("keydown", function (event) {
    switch (event.key) {
        case "Enter":
            lastVertex = null;
            newArea = true;
            break;
        case " ":
            makingWall = !makingWall;
            if (!makingWall) lastVertex = null;
            break;
        case "w":
            panY += 10;
            break
        case "s":
            panY -= 10;
            break
        case "a":
            panX += 10;
            break
        case "d":
            panX -= 10;
            break;
        case "r":
            spawnRotation += Math.PI / 360;
            break;
        case "g":
            gridEnabled = !gridEnabled;
            break;
        case "ArrowUp":
            currentFloor += 1;
            break;
        case "ArrowDown":
            currentFloor -= 1;
            break;
        case "c":
            copyMode = true;
            pasteMode = false;
            selectionStart = null;
            selectionEnd = null;
            makingWall = false;
            break;
        case "v":
            if (clipboard.walls.length > 0 || clipboard.pieces.length > 0) {
                pasteMode = true;
                copyMode = false;
            }
            break;

    }
})
let dragging = false
let draggedItem = 'generic';
const doorBtn = document.getElementById('doorBtn');
const doorBtn2 = document.getElementById('doorBtn2');
const windowBtn = document.getElementById('windowBtn')
const bedBtn = document.getElementById('bedBtn')
const tableBtn = document.getElementById('tableBtn')
const chairBtn = document.getElementById('chairBtn')
const squareBtn = document.getElementById('squareBtn')
const circleBtn = document.getElementById('circleBtn')
const stairBtn = document.getElementById('stairBtn')
stairBtn.onmousedown = function () {
    dragging = true;
    draggedItem = 'stair';
}
squareBtn.onmousedown = function () {
    dragging = true;
    draggedItem = 'square';
}
circleBtn.onmousedown = function () {
    dragging = true;
    draggedItem = 'circle';
}
chairBtn.onmousedown = function () {
    dragging = true;
    draggedItem = 'chair';
}
tableBtn.onmousedown = function () {
    dragging = true;
    draggedItem = 'table';
}
bedBtn.onmousedown = function () {
    dragging = true;
    draggedItem = 'bed';
}
doorBtn.onmousedown = function () {
    dragging = true;
    draggedItem = 'door';
}
doorBtn2.onmousedown = function () {
    dragging = true;
    draggedItem = 'door2';
}
windowBtn.onmousedown = function () {
    dragging = true;
    draggedItem = 'window';
}
let genericWidth = 10
let genericHeight = 10
const genericWidthInput = document.getElementById('genericWidth');
genericWidthInput.addEventListener('input', (e) => {
    genericWidth = parseFloat(e.target.value);
});
const genericHeightInput = document.getElementById('genericHeight');
genericHeightInput.addEventListener('input', (e) => {
    genericHeight = parseFloat(e.target.value);
});
let doorVertices = [0, 0, 0, 30];
let windowVertices = [0, 0, 0, 10];
let bedVertices = [0, 0, 30, 0, 30, 65, 0, 65, 0, 0, 0, 20, 30, 20, 30, 0, 0, 0, 5, 5, 5, 15, 25, 15, 25, 5, 5, 5];
let tableVertices = [0, 0, 50, 0, 50, 20, 0, 20, 0, 0];
let chairVertices = [1.5, 1, 18.5, 1, 20, 5, 0, 5, 1.5, 1, 0, 5, 0, 20, 2, 22.5, 18, 22.5, 20, 20, 20, 5, 22.5, 6.25, 22.5, 18.5, 20, 20, 18, 22.5, 2, 22.5, 0, 20, -2.5, 18.5, -2.5, 6.25, 0, 5];
let stairVertices = [0, 0, 30, 0, 30, 10, 0, 10, 0, 0];
function translateVerts(verts, x, y, rotation = 0) {
    let newverts = [];
    for (let i = 0; i < verts.length; i += 2) {
        const originalX = verts[i];
        const originalY = verts[i + 1];

        // Apply rotation
        const rotatedX = Math.cos(rotation) * originalX - Math.sin(rotation) * originalY;
        const rotatedY = Math.sin(rotation) * originalX + Math.cos(rotation) * originalY;

        // Translate
        newverts.push(rotatedX + x);
        newverts.push(rotatedY + y);
    }
    return newverts;
}
document.addEventListener('mouseup', (e) => {
    if (dragging && draggedItem) {
        if (draggedItem === 'door') {
            let door = new Piece()
            door.color = "rgb(157, 106, 208)"
            door.type = "door"
            door.rotation = spawnRotation
            door.vertices = translateVerts(doorVertices, mouseX, mouseY, spawnRotation);
            pieces.push(door);
        } else if (draggedItem === 'door2') {
            let door = new Piece()
            door.color = "rgb(157, 106, 208)"
            door.type = "door2"
            door.rotation = spawnRotation
            door.vertices = translateVerts(doorVertices, mouseX, mouseY, spawnRotation);
            pieces.push(door);
        } else if (draggedItem === 'generic') {
            let generic = new Piece()
            generic.color = "grey"
            generic.type = "generic"
            generic.rotation = 0
            generic.vertices = [mouseX - 25, mouseY - 25, mouseX + 25, mouseY - 25, mouseX + 25, mouseY + 25, mouseX - 25, mouseY + 25, mouseX - 25, mouseY - 25];
            pieces.push(generic);
        } else if (draggedItem === 'window') {
            let window = new Piece()
            window.color = "rgb(157, 106, 208)"
            window.type = "window"
            window.rotation = spawnRotation
            window.vertices = translateVerts(windowVertices, mouseX, mouseY, spawnRotation);
            pieces.push(window);
        } else if (draggedItem === 'bed') {
            let bed = new Piece()
            bed.color = "rgb(157, 106, 208)"
            bed.type = "bed"
            bed.rotation = spawnRotation
            bed.vertices = translateVerts(bedVertices, mouseX, mouseY, spawnRotation);
            bed.jumpPositions = [9]
            pieces.push(bed);
        } else if (draggedItem === 'table') {
            let table = new Piece()
            table.color = "rgb(157, 106, 208)"
            table.type = "table"
            table.filled = true;
            table.fillColor = "#111111"
            table.rotation = spawnRotation
            table.vertices = translateVerts(tableVertices, mouseX, mouseY, spawnRotation);
            pieces.push(table);
        } else if (draggedItem === 'chair') {
            let chair = new Piece()
            chair.color = "rgb(157, 106, 208)"
            chair.type = "chair"
            chair.rotation = spawnRotation
            chair.vertices = translateVerts(chairVertices, mouseX, mouseY, spawnRotation);
            pieces.push(chair);
        } else if (draggedItem === 'square') {
            let square = new Piece()
            square.color = "rgb(157, 106, 208)"
            square.type = "square"
            square.fillColor = "#111111"
            square.rotation = spawnRotation
            square.stroked = genericStroked;
            square.filled = genericFilled;
            square.vertices = [mouseX, mouseY, mouseX + genericWidth, mouseY, mouseX + genericWidth, mouseY + genericHeight, mouseX, mouseY + genericHeight, mouseX, mouseY];
            pieces.push(square);
        } else if (draggedItem === 'circle') {
            let circle = new Piece()
            circle.color = "rgb(157, 106, 208)"
            circle.type = "circle"
            circle.filled = genericFilled;
            circle.stroked = genericStroked;
            circle.fillColor = "#111111"
            circle.rotation = 0
            circle.width = genericWidth;
            circle.height = genericHeight;
            circle.vertices = generateEllipseVertices(mouseX + (genericWidth / 2), mouseY + (genericHeight / 2), genericWidth / 2, genericHeight / 2, 36, spawnRotation);
            pieces.push(circle);
        } else if (draggedItem === 'stair') {
            let stair = new Piece()
            stair.color = "white"
            stair.type = "stair"
            stair.rotation = spawnRotation
            stair.vertices = translateVerts(stairVertices, mouseX, mouseY, spawnRotation);
            pieces.push(stair);
        }
    }
    dragging = false;
    draggedItem = 'generic';
})
const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');
loadBtn.onclick = function () {
    loadData();
    loadBtn.blur()
}
saveBtn.onclick = function () {
    saveData();
    saveBtn.blur()
}
function saveData() {
    const data = {
        wallVertices: JSON.parse(JSON.stringify(wallVertices)),
        pieces: JSON.parse(JSON.stringify(pieces)),
        panX, panY, zoomScale, currentFloor
    }
    localStorage.setItem('floorplanData', JSON.stringify(data));
}
function loadData() {
    const data = JSON.parse(localStorage.getItem('floorplanData'));
    if (data) {
        wallVertices = JSON.parse(JSON.stringify(data.wallVertices));
        pieces = JSON.parse(JSON.stringify(data.pieces));
        panX = data.panX;
        panY = data.panY;
        zoomScale = data.zoomScale;
        currentFloor = data.currentFloor;
    }
}
recenterCanvas()
window.onresize = function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    recenterCanvas();
}
requestAnimationFrame(loop)

let copyMode = false;
let pasteMode = false;
let selectionStart = null;
let selectionEnd = null;
let clipboard = { walls: [], pieces: [] };

function drawSelectionRectangle() {
    if (selectionStart && selectionEnd) {
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'cyan';
        ctx.strokeRect(
            Math.min(selectionStart.x, selectionEnd.x),
            Math.min(selectionStart.y, selectionEnd.y),
            Math.abs(selectionEnd.x - selectionStart.x),
            Math.abs(selectionEnd.y - selectionStart.y)
        );
        ctx.restore();
    }
}

document.addEventListener('mousedown', (e) => {
    if (copyMode && e.button === 0) {
        selectionStart = getTransformedMouseCoords(e.clientX, e.clientY);
        selectionEnd = null;
    }
});

document.addEventListener('mousemove', (e) => {
    if (copyMode && selectionStart) {
        selectionEnd = getTransformedMouseCoords(e.clientX, e.clientY);
    }
});

document.addEventListener('mouseup', (e) => {
    if (copyMode && selectionStart && selectionEnd) {
        const x1 = Math.min(selectionStart.x, selectionEnd.x);
        const y1 = Math.min(selectionStart.y, selectionEnd.y);
        const x2 = Math.max(selectionStart.x, selectionEnd.x);
        const y2 = Math.max(selectionStart.y, selectionEnd.y);

        clipboard.walls = wallVertices.filter(([x, y]) => x >= x1 && x <= x2 && y >= y1 && y <= y2);
        clipboard.pieces = pieces.filter(piece => {
            const [px, py] = piece.vertices;
            return px >= x1 && px <= x2 && py >= y1 && py <= y2;
        });

        selectionStart = null;
        selectionEnd = null;
        copyMode = false;
    }
});

function drawGhostPaste() {
    if (pasteMode) {
        const offsetX = mouseX - clipboard.walls[0][0];
        const offsetY = mouseY - clipboard.walls[0][1];

        ctx.save();
        ctx.globalAlpha = 0.5;

        clipboard.walls.forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x + offsetX, y + offsetY, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'cyan';
            ctx.fill();
        });

        clipboard.pieces.forEach(piece => {
            ctx.beginPath();
            ctx.strokeStyle = 'cyan';
            ctx.moveTo(piece.vertices[0] + offsetX, piece.vertices[1] + offsetY);
            for (let i = 2; i < piece.vertices.length; i += 2) {
                ctx.lineTo(piece.vertices[i] + offsetX, piece.vertices[i + 1] + offsetY);
            }
            ctx.closePath();
            ctx.stroke();
        });

        ctx.restore();
    }
}

document.addEventListener('mousedown', (e) => {
    if (pasteMode && e.button === 0) {
        const offsetX = mouseX - clipboard.walls[0][0];
        const offsetY = mouseY - clipboard.walls[0][1];

        clipboard.walls.forEach(([x, y, jump], index) => {
            wallVertices.push([x + offsetX, y + offsetY, index === 0 || jump, currentFloor]);
        });

        clipboard.pieces.forEach(piece => {
            const newPiece = { ...piece, vertices: piece.vertices.map((v, i) => v + (i % 2 === 0 ? offsetX : offsetY)) };
            newPiece.floor = currentFloor;
            pieces.push(newPiece);
        });

        pasteMode = false;
    }
});

const originalLoop = loop;
loop = function () {
    originalLoop();
    drawSelectionRectangle();
    drawGhostPaste();
};
function generateEllipseVertices(centerX, centerY, radiusX, radiusY, segments = 36, rotation = 0) {
    const vertices = [];
    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = radiusX * Math.cos(angle);
        const y = radiusY * Math.sin(angle);
        const rotatedX = Math.cos(rotation) * x - Math.sin(rotation) * y;
        const rotatedY = Math.sin(rotation) * x + Math.cos(rotation) * y;
        vertices.push(centerX + rotatedX, centerY + rotatedY);
    }
    vertices.push(vertices[0], vertices[1]);
    return vertices;
}
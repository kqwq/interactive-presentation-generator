



/* Constants */
const ipInfoElement = document.getElementById("ip-info")
const ipAddress = location.hostname
const websocketPort = 9999 // Recommended WS port is 9999


// Helper functions
const $ = (x) => document.querySelector(x)
const $$ = (x) => document.querySelectorAll(x)

function getWordFrequencyBreakdown(xs) {
  // Debug data
  // const a = [{ word: "paris", width: 10 }];
  // for (let i = 0; i < Math.random() * 20; i++) {
  //   a.push({ word: `word${i}`, width: 1 + ~~(Math.random() * 2) });
  // }
  // return a;

  const freqs = {}
  for (let x of xs) {
    x = x.trim().toLowerCase()
    freqs[x] = (freqs[x] || 0) + 1
  }
  const freqsSorted = []
  for (const [key, value] of Object.entries(freqs)) {
    freqsSorted.push({ word: key, width: value })
  }
  freqsSorted.sort((a, b) => b.width - a.width)
  return freqsSorted
}
function randint(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function randfloat(min, max) {
  return Math.random() * (max - min) + min
}
function getTrueRandomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`
}



function cageOfPlatforms(x, y, w, h, thickness, color) {
  new Platform(x - thickness, y - thickness, w + 2 * thickness, thickness, color) // Top
  new Platform(x - thickness, y - thickness, thickness, h + 2 * thickness, color) // Left
  new Platform(x + w, y - thickness, thickness, h + 2 * thickness, color) // Right
  new Platform(x - thickness, y + h, w + 2 * thickness, thickness, color) // Bottom
}

// Constants
const WIDTH = 1920
const HEIGHT = 1080
const aiResponses = [
  `1,paris,0.4168
2,lille,0.0714
3,lyon,0.0634
4,marseille,0.0444
5,tours,0.0303
6,toulouse,0.0288
7,orleans,0.0254
8,nantes,0.0228`,
  `1,book,0.0425
2,bottle,0.0414
3,glass,0.0406
4,newspaper,0.0400
5,plate,0.0374
6,beer,0.0276
7,drink,0.0266
8,pen,0.0258`,
  `1,diploma,0.6592
2,degree,0.1680
3,certificate,0.0541
4,commission,0.0442
5,scholarship,0.0244
6,fellowship,0.0119
7,doctorate,0.0113
8,certification,0.0020`,
  `1,elephant,0.1980
2,deer,0.0725
3,lion,0.0564
4,bear,0.0402
5,tiger,0.0296
6,wolf,0.0267
7,beaver,0.0264
8,bison,0.0222`,
]
  .map((x) => x.split("\n").map((y) => y.split(",")))
  .map((x) =>
    x.map((y) => {
      return { word: y[1], width: parseFloat(y[2]) }
    })
  )

// Classes
class DecorativeBox {
  constructor(x, y, width, height, color = "gray") {
    objs.unshift(this)
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.color = color === "random" ? getTrueRandomColor() : color
  }
  draw() {
    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }
}
class Platform {
  constructor(x, y, width, height, color = "gray", colorable = false) {
    objs.push(this)
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.color = color === "random" ? getTrueRandomColor() : color
    this.colorable = colorable
  }

  draw() {
    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }
}
class Coin {
  constructor(x, y, radius = 10, color = "gold") {
    objs.push(this)
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.animationStep = 0
  }

  intersects(other) {
    if (this === other) return false
    if (other instanceof Platform) {
      return (
        this.x + this.radius > other.x &&
        this.x - this.radius < other.x + other.width &&
        this.y + this.radius > other.y &&
        this.y - this.radius < other.y + other.height
      )
    }
    if (other instanceof Coin) {
      return Math.hypot(this.x - other.x, this.y - other.y) < this.radius + other.radius
    }
    return false
  }

  spawn() {
    // Attempt to spawn on top of a random platform. If that intersects with another platform or coin, try again. Try 3 times before spawning at (width/2, height/2-20)
    let attempts = 0
    while (attempts < 3) {
      const platforms = objs.filter((o) => o instanceof Platform)
      const platform = platforms[randint(0, platforms.length - 1)]
      this.x = platform.x + randint(0, platform.width)
      this.y = platform.y - this.radius * 2
      const otherPlatform = objs.find((o) => o instanceof Platform && this.intersects(o))
      if (otherPlatform) {
        attempts++
        continue
      }
      const coin = objs.find((o) => o instanceof Coin && this.intersects(o))
      if (coin) {
        attempts++
        continue
      }
      // If spawns within 10 units of out of bounds, try again
      if (this.x < 10 || this.x > WIDTH - 10 || this.y < 10 || this.y > HEIGHT - 10) {
        attempts++
        continue
      }
      break
    }
  }

  draw() {
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.ellipse(
      this.x,
      this.y - Math.sin(this.animationStep / 10) * 1,
      this.radius * Math.abs(Math.sin(this.animationStep / 10) / 2),
      this.radius * 0.6,
      0,
      0,
      Math.PI * 2
    )
    ctx.fill()
    this.animationStep += 0.2
  }
}
class Text {
  constructor(
    text,
    x,
    y,
    font = "100px Arial",
    color = "black",
    textAlign = "center",
    lineHeightMultiplier = 1
  ) {
    objs.push(this)
    this.text = text
    this.x = x
    this.y = y
    this.font = font
    this.color = color
    this.textAlign = textAlign
    this.lines = this.text.split("\n")
    const fontSizeMatch = this.font.match(/(\d+)px/)
    const fontSize = fontSizeMatch ? parseInt(fontSizeMatch[1], 10) : 100
    this.lineHeight = fontSize * 1.2 * lineHeightMultiplier
  }

  draw() {
    ctx.fillStyle = this.color
    ctx.font = this.font
    ctx.textAlign = this.textAlign
    ctx.textBaseline = "middle"
    this.lines.forEach((line, index) => {
      ctx.fillText(line, this.x, this.y + index * this.lineHeight)
    })
  }
}
class Bloby {
  constructor(
    x = WIDTH / 2,
    y = HEIGHT / 2,
    radius = 20,
    color = "white",
    name = ""
  ) {
    objs.push(this)
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.name = name
    this.vertices = []
    this.nVertices = 12
    for (let i = 0; i < this.nVertices; i++) {
      const angle = (i / this.nVertices) * Math.PI * 2
      const r = radius
      this.vertices.push([x + Math.cos(angle) * r, y + Math.sin(angle) * r, 0, 0])
    }
    this.springJoints = []
    this.inFreefall = false
    this.jumpCountdown = 0
    for (let i = 0; i < this.nVertices - 1; i++) {
      for (let j = i + 1; j < this.nVertices; j++) {
        const dist = Math.hypot(
          this.vertices[i][0] - this.vertices[j][0],
          this.vertices[i][1] - this.vertices[j][1]
        )
        this.springJoints.push([i, j, dist])
      }
    }
    this.moveForce = 0.2
    this.jumpForce = 10
    this.faceX = 0
    this.forceX = 0
    this.forceY = 0
    this.isJumping = false
    this.visible = true
    this.kahootAnswer = ""
    this.kahootPoints = 0
    this.kahootTotalDelay = 0
    this.coins = 0
  }

  jump() {
    this.isJumping = true
  }
  unjump() {
    this.isJumping = false
  }

  // dx, dy should be between -1 and 1
  move(dx, dy) {
    this.forceX = dx
    if (dy < 0) dy /= 5
    this.forceY = dy
  }

  setNewPos(nx, ny) {
    const dx = this.x - nx
    const dy = this.y - ny
    this.vertices.forEach((vertex) => {
      vertex[0] -= dx
      vertex[1] -= dy
    })
    this.x = nx
    this.y = ny
  }

  draw() {
    // If jumping, apply force
    if (this.isJumping && this.jumpCountdown === 0 && !this.inFreefall) {
      this.vertices.forEach((vertex) => {
        vertex[3] -= this.jumpForce
      })
      this.jumpCountdown = 10
    }

    // Apply force to blob
    if (this.forceX !== 0 || this.forceY !== 0) {
      this.vertices.forEach((vertex) => {
        vertex[2] += this.forceX * this.moveForce
        vertex[3] += this.forceY * this.moveForce
      })
    }
    this.faceX = this.forceX * this.moveForce

    // Apply gravity to each vertex
    for (const vertex of this.vertices) {
      vertex[3] += 0.1
    }

    // Jump counter update
    if (this.jumpCountdown > 0) {
      this.jumpCountdown--
    }

    // Apply spring forces
    for (const [i, j, dist] of this.springJoints) {
      const [x1, y1, vx1, vy1] = this.vertices[i]
      const [x2, y2, vx2, vy2] = this.vertices[j]
      const dx = x2 - x1
      const dy = y2 - y1
      let d = Math.hypot(dx, dy)
      if (d === 0) d = 0.0001
      const f = (d - dist) * 0.01
      const fx = (dx / d) * f
      const fy = (dy / d) * f
      this.vertices[i][2] += fx
      this.vertices[i][3] += fy
      this.vertices[j][2] -= fx
      this.vertices[j][3] -= fy
    }

    // Apply dampening to forces
    const dampening = 0.98
    for (const vertex of this.vertices) {
      vertex[2] *= dampening
      vertex[3] *= dampening
    }

    // Apply velocity to position
    for (const vertex of this.vertices) {
      vertex[0] += vertex[2]
      vertex[1] += vertex[3]
    }

    // Collision with platforms
    this.inFreefall = true
    for (const obj of objs) {
      if (obj instanceof Platform) {
        const { x, y, width, height, colorable } = obj
        for (const vertex of this.vertices) {
          if (vertex[0] > x && vertex[0] < x + width && vertex[1] > y && vertex[1] < y + height) {
            const dx = Math.min(vertex[0] - x, x + width - vertex[0])
            const dy = Math.min(vertex[1] - y, y + height - vertex[1])
            if (dx < dy) {
              if (vertex[0] < x + width / 2) {
                vertex[0] = x
              } else {
                vertex[0] = x + width
              }
              vertex[2] = 0
            } else {
              if (vertex[1] < y + height / 2) {
                vertex[1] = y
                vertex[3] = 0
                this.inFreefall = false
              } else {
                vertex[1] = y + height
                vertex[3] = 0
              }
            }
            if (colorable) {
              obj.color = this.color
            }
          }
        }
      }
    }

    // Collision with other blobs (not perfect but good enough to sell the illusion)
    for (const obj of objs) {
      if (obj instanceof Bloby && obj !== this) {
        const dist = Math.hypot(this.x - obj.x, this.y - obj.y)
        if (dist < this.radius + obj.radius) {
          const angle = Math.atan2(this.y - obj.y, this.x - obj.x)
          const overlap = (this.radius + obj.radius - dist) / 2
          const offsetX = Math.cos(angle) * overlap
          const offsetY = Math.sin(angle) * overlap
          this.setNewPos(this.x + offsetX, this.y + offsetY)
          obj.setNewPos(obj.x - offsetX, obj.y - offsetY)
          // If you are above the other blob, you are not in freefall
          if (this.y < obj.y) {
            this.inFreefall = false
          }
        }
      }
    }

    // Collision with coins
    for (const obj of objs) {
      if (obj instanceof Coin) {
        const dist = Math.hypot(this.x - obj.x, this.y - obj.y)
        if (dist < this.radius + obj.radius) {
          obj.spawn()
          this.coins++
        }
      }
    }

    // Find x and y based on average of vertices
    this.x = this.vertices.reduce((acc, [x]) => acc + x, 0) / this.vertices.length
    this.y = this.vertices.reduce((acc, [, y]) => acc + y, 0) / this.vertices.length

    // Prevent blob from getting completely flattened
    if (this.vertices.every(([, y]) => y === this.y)) {
      this.vertices.forEach((vertex) => {
        vertex[1] += Math.random() - 0.5
      })
    } else if (this.vertices.every(([x]) => x === this.x)) {
      this.vertices.forEach((vertex) => {
        vertex[0] += Math.random() - 0.5
      })
    }

    // If blob is completely off-screen, reset it to the center
    if (this.x < -this.radius || this.x > WIDTH + this.radius || this.y > HEIGHT + this.radius) {
      const { x: sx, y: sy } = layout?.blobSpawnCoordinates?.find(c => c.slide === slide.value) ?? {
        x: WIDTH / 2,
        y: HEIGHT / 2
      }
      this.vertices.forEach(([x, y], i) => {
        this.vertices[i][0] = sx + Math.random()
        this.vertices[i][1] = sy + Math.random()
      })
    }

    // Sort vertices in clockwise order around the center point
    this.vertices.sort(([x1, y1], [x2, y2]) => {
      const angle1 = Math.atan2(y1 - this.y, x1 - this.x)
      const angle2 = Math.atan2(y2 - this.y, x2 - this.x)
      return angle1 - angle2
    })

    // Draw the blob, skipping vertices that are concave
    if (!drawBlobs || !this.visible) return
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.moveTo(this.vertices[0][0], this.vertices[0][1])
    for (let i = 1; i < this.vertices.length; i++) {
      const [x, y] = this.vertices[i]
      const [prevX, prevY] = this.vertices[i - 1]
      const [nextX, nextY] = this.vertices[(i + 1) % this.vertices.length]
      const crossProduct = (x - prevX) * (nextY - y) - (y - prevY) * (nextX - x)
      if (crossProduct >= 0) {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.fill()
    ctx.lineWidth = 5
    ctx.strokeStyle = this.color
    ctx.stroke()

    // Draw 2 eyes on the blob
    const erx = this.radius / 5
    const ery = this.radius / 3
    const eo = this.radius / 3
    const vx = Math.abs(this.faceX) > 0.01 ? Math.sign(this.faceX) * 5 : 0
    const showEyes = this.vertices.some(([, y]) => y < this.y - eo)
    if (showEyes) {
      ctx.fillStyle = "black"
      ctx.beginPath()
      ctx.ellipse(this.x - eo + vx, this.y - eo, erx / 2, ery / 2, 0, 0, Math.PI * 2)
      ctx.ellipse(this.x + eo + vx, this.y - eo, erx / 2, ery / 2, 0, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw name above blob
    if (this.name && showEyes) {
      ctx.fillStyle = "black"
      ctx.font = "15px Fira Sans"
      ctx.textAlign = "center"
      const displayName = this.coins > 0 ? `${this.name} (${this.coins})` : this.name
      ctx.fillText(displayName, this.x, this.y - this.radius - 12)
    }
  }
}

function drawSingleResponseSlide2Elements() {
  const responsesTxt = objs.find((o) => o.text?.toLowerCase()?.includes("responses"))
  if (responsesTxt) objs.splice(objs.indexOf(responsesTxt), 1)
  drawBlobs = true
  const font = "italic 40px Arial"
  new Text("BERT", WIDTH / 4, HEIGHT / 2 - 80, font, "#444", "center")
  new Text("AI Club Responses", (WIDTH * 3) / 4, HEIGHT / 2 - 80, font, "#444", "center")
  new Platform(WIDTH * 0.25, HEIGHT - 10, WIDTH / 2, 50)

  const aiClubResponses = getWordFrequencyBreakdown(userResponses.maskedWord)
  const bertResponses = aiResponses[(slide.value + 1) / 2 - 3]
  const bothRes = [bertResponses, aiClubResponses]

  for (let x = 0; x < 2; x++) {
    const res = bothRes[x]
    const color = ["#0097a7", "#ffab40"][x]
    let maxBarWidth = -1
    for (let i = 0; i < res.length; i++) {
      maxBarWidth = Math.max(maxBarWidth, res[i].width)
    }
    const chartArea = {
      x: 0,
      y: HEIGHT / 2 - 20,
      width: (WIDTH / 4) * 0.8,
      height: HEIGHT / 2 - 50,
      font: "30px Arial",
    }
    if (res.length > 30) {
      chartArea.font = "15px Arial"
    } else if (res.length > 20) {
      chartArea.font = "20px Arial"
    }
    const barWidthMultiplier = chartArea.width / maxBarWidth
    const itemsForAlignment = Math.max(5, res.length)
    for (let i = 0; i < res.length; i++) {
      chartArea.x = x * (WIDTH / 2) + WIDTH * 0.25
      const { word, width } = res[i]
      // Label left of bar
      console.log("hi", word, width)
      new Text(
        word,
        chartArea.x - 10,
        chartArea.y +
        (i / itemsForAlignment) * chartArea.height +
        chartArea.height / itemsForAlignment / 4,
        chartArea.font,
        "black",
        "right"
      )
      // Colored bar
      new Platform(
        chartArea.x,
        chartArea.y + (i / itemsForAlignment) * chartArea.height,
        width * barWidthMultiplier,
        chartArea.height / itemsForAlignment / 2,
        color,
        true
      )
      // Probability/amount right of bar
      new Text(
        width.toString(),
        chartArea.x + width * barWidthMultiplier + 10,
        chartArea.y +
        (i / itemsForAlignment) * chartArea.height +
        chartArea.height / itemsForAlignment / 4,
        chartArea.font,
        "black",
        "left"
      )
    }
  }
}
function drawKahootQuestionSlideElements1(qq) {
  new Text("Test your knowledge", 80, 170, "80px Arial", "black", "left")
  // const qq = quizQuestions[(slide.value - 15) / 2]
  new Text("Q: " + qq.question, 80, 370, "50px Arial", "#444", "left")
  new Text(
    "Vote on your device!",
    WIDTH / 2,
    HEIGHT / 2 - 10,
    "50px Fira Sans",
    "#444",
    "center"
  )
  const xy = [
    [WIDTH * 0.15, HEIGHT * 0.6],
    [WIDTH * 0.55, HEIGHT * 0.6],
    [WIDTH * 0.15, HEIGHT * 0.8],
    [WIDTH * 0.55, HEIGHT * 0.8],
  ]
  const o = 4
  const dx = WIDTH * 0.3
  const dy = HEIGHT * 0.1
  for (let i = 0; i < qq.answers.length; i++) {
    new DecorativeBox(xy[i][0], xy[i][1], dx, dy, "lightgray")
    new DecorativeBox(xy[i][0] - o, xy[i][1] - o, dx + o * 2, dy + o * 2, "gray")
    cageOfPlatforms(xy[i][0], xy[i][1], dx, dy, HEIGHT * 0.1, "#ff00ff00")
    new Text(
      qq.answers[i],
      xy[i][0] + dx / 2,
      xy[i][1] + dy / 2,
      "30px Fira Sans",
      "black",
      "center"
    )
  }
  // Didn't vote box
  cageOfPlatforms((WIDTH * 5) / 8, 0, WIDTH / 4, HEIGHT / 4 - 10, 15, "gray")
  new Text(
    "Box of shame\n(didn't vote)",
    (WIDTH * 3) / 4,
    HEIGHT / 8,
    "30px Fira Sans",
    "black",
    "center"
  )
}
function drawKahootQuestionSlideElements2(qq) {

  objs.filter((o) => o instanceof Bloby).forEach((o) => (o.visible = true))
  // Show check box emoji if correct, cross if incorrect
  // const qq = quizQuestions[(slide.value - 16) / 2]
  const xy = [
    [WIDTH * 0.15, HEIGHT * 0.6],
    [WIDTH * 0.55, HEIGHT * 0.6],
    [WIDTH * 0.15, HEIGHT * 0.8],
    [WIDTH * 0.55, HEIGHT * 0.8],
  ]
  const dx = WIDTH * 0.3
  const dy = HEIGHT * 0.1
  const correctIndex = qq.answers.indexOf(qq.correctAnswer)
  for (let i = 0; i < qq.answers.length; i++) {
    let emoji = i === correctIndex ? "✅" : "❌"
    if (qq.correctAnswer === "<all>") {
      emoji = "✅"
    }
    new Text(emoji, xy[i][0] + dx, xy[i][1], "50px Arial", "black", "center")
  }
  // For every blob, check if they got it right and update points
  for (const obj of objs) {
    if (obj instanceof Bloby) {
      const answer = obj.kahootAnswer
      if (answer === qq.correctAnswer || qq.correctAnswer === "<all>") {
        obj.kahootPoints += 1
      }
    }
  }

}
function drawKahootFinalStandingsElements() {

  new Text("Results", WIDTH / 2, 100, "80px Arial", "black", "center")
  // Display results as a list
  const sortedBlobs = objs
    .filter((o) => o instanceof Bloby)
    .sort((a, b) => b.kahootPoints - a.kahootPoints || a.kahootTotalDelay - b.kahootTotalDelay)
  const top3Texts = sortedBlobs.map(
    (b, i) => `${b.name}\n${b.kahootPoints} pts\n${(b.kahootTotalDelay / 1000).toFixed(1)} s`
  )

  // Platforms
  new Platform(WIDTH / 2 - 200, HEIGHT * 0.4, 400, 20, "gray")
  // Podiums
  const podiumWidth = 180
  const makePodium = (blX, blY, type, text, blob) => {
    const c = {
      gold: "#ffd700",
      silver: "#c0c0c0",
      bronze: "#cd7f32",
    }[type]
    const h = {
      gold: 350,
      silver: 280,
      bronze: 200,
    }[type]
    new Platform(blX, blY - h, podiumWidth, h, c)
    new Text(text, blX + podiumWidth / 2, blY - h + 20, "30px Arial", "black", "center")
    blob.setNewPos(blX + podiumWidth / 2, blY - h - 12)
  }
  const podiumGap = 20
  const x = WIDTH / 4
  const y = HEIGHT * 0.9
  if (top3Texts.length >= 2)
    makePodium(x - podiumWidth - podiumGap, y, "silver", top3Texts[1], sortedBlobs[1])
  if (top3Texts.length >= 1) makePodium(x, y, "gold", top3Texts[0], sortedBlobs[0])
  if (top3Texts.length >= 3)
    makePodium(x + podiumWidth + podiumGap, y, "bronze", top3Texts[2], sortedBlobs[2])

  // Small podiums on the right side
  for (let i = 3; i < Math.min(sortedBlobs.length, 10); i++) {
    new Platform(WIDTH / 2 + 100 + i * 90, HEIGHT * 0.75, 50, HEIGHT * 0.15, "gray", true)
    sortedBlobs[i].setNewPos(WIDTH / 2 + 100 + i * 90 + 25, HEIGHT * 0.75 - 12)
  }

  // Any other blobs not in the top 10, spawn on platform at top
  for (let i = 10; i < sortedBlobs.length; i++) {
    sortedBlobs[i].setNewPos(WIDTH / 2 + Math.random(), HEIGHT * 0.3 - 12)
  }
}

// Global vars
let layout // Presentation layout object
let canvas
let ctx
let objs = [] // List of objects to draw
let slide = { value: 1 } // Current slide
let keys = {} // Key states
let blobsById = {} // Blobs by ID
let userResponses = {
  maskedWord: [],
  kahooot: [],
} // User responses
let drawBlobs = true

// Expose variables to the window for page-script-networking.js
window.blobsById = blobsById
window.Bloby = Bloby
window.objs = objs
window.slide = slide
window.userResponses = userResponses

// Loaders
function loadSlide() {

  // Clear objects
  const blobSpawns = layout?.blobSpawnCoordinates?.find(c => c.slide === slide.value) ?? {
    x: WIDTH / 2,
    y: HEIGHT / 2
  }
  for (let i = 0; i < objs.length; i++) {
    if (objs[i] instanceof Bloby) {
      objs[i].setNewPos(blobSpawns.x + Math.random(), blobSpawns.y + Math.random())
      objs[i].visible = true
    } else {
      objs.splice(i, 1)
      i--
    }
  }
  drawBlobs = true

  /* Add elements to the screen */
  if (!layout?.numSlides) {
    console.error("No layout or slide data found for slide", slide.value)
    return
  }

  // Add text boxes
  const textBoxes = layout.textBoxes.filter((tb) => tb[0] === slide.value)
  console.log(textBoxes)
  for (const textBox of textBoxes) {
    new Text(...textBox.slice(1))
  }

  // Add platforms
  const platforms = layout.platforms.filter((p) => p[0] === slide.value)
  for (const platform of platforms) {
    new Platform(...platform.slice(1))
  }

  // SINGLE RESPONSE SLIDE 1
  const srQuestion = layout?.singleResponseSlides?.find((s) => s.slide === slide.value)
  if (srQuestion) {
    new Text(srQuestion.prompt, 80, 310, "50px Arial", "#444", "left")
    new Text("Responses: 0", WIDTH / 2 + 10, HEIGHT / 2, "40px Arial", "black", "center")
  }

  // SINGLE RESPONSE SLIDE 2
  const srQuestion2 = layout?.singleResponseSlides?.find((s) => s.slide === slide.value - 1)
  if (srQuestion2) {
    drawSingleResponseSlide2Elements()
  }

  // KAHOOT SLIDE 1
  const kahootQuestion = layout?.kahootQuestions?.find((s) => s.slide === slide.value)
  if (kahootQuestion) {
    // Shuffle answers
    kahootQuestion.answers = kahootQuestion.answers.sort(() => Math.random() - 0.5)
    // Draw boxes/text
    drawKahootQuestionSlideElements1(kahootQuestion)
    // Populate options to clients
    window.wss.send(
      JSON.stringify({
        type: "kahoot-populate-options",
        question: kahootQuestion.question,
        options: kahootQuestion.answers, // Importantly, we are not sending the correct answer to the client
      })
    )
    // Move blobs to cage in top right corner
    for (const blob of objs.filter((o) => o instanceof Bloby)) {
      blob.setNewPos((WIDTH * 3) / 4 + Math.random(), HEIGHT * 0.05)
    }
  }

  // KAHOOT SLIDE 2
  const kahootQuestion2 = layout?.kahootQuestions?.find((s) => s.slide === slide.value - 1)
  if (kahootQuestion2) {
    drawKahootQuestionSlideElements1(kahootQuestion2)
    drawKahootQuestionSlideElements2(kahootQuestion2)
    // Put blobs inside of the option they chose
    for (const blob of objs.filter((o) => o instanceof Bloby)) {
      if (!blob.kahootAnswer) {
        // If blob has no answer, put it in the top right corner
        blob.setNewPos((WIDTH * 3) / 4 + Math.random(), HEIGHT * 0.05)
      } else {
        // If blob has an answer, put it in the option they chose
        const optionsTxt = objs.find(o => o.text === blob.kahootAnswer)
        if (!optionsTxt) continue
        const offsetX = Math.random() * 100 - 50
        blob.setNewPos(optionsTxt.x + offsetX, optionsTxt.y)
      }
    }
  }

  // KAHOOT FINAL STANDINGS
  if (slide.value === layout?.kahootFinalStandingsSlide) {
    drawKahootFinalStandingsElements()
  }

  // Draw blobs last while also drawing decorative boxes first
  for (let i = objs.length - 1; i >= 0; i--) {
    if (objs[i] instanceof Bloby) {
      const o = objs.splice(i, 1)
      objs.push(o[0])
    }
  }
  // Set coins to 0
  objs.filter((o) => o instanceof Bloby).forEach((o) => (o.coins = 0))
}

// Expose this one, too
window.loadSlide = loadSlide

function init() {
  // Create canvas
  canvas = $("#canvas-2d")
  ctx = canvas.getContext("2d")
  // Set to HD dimensions (1920x1080)
  canvas.width = WIDTH
  canvas.height = HEIGHT

  // // Test
  // ctx.fillStyle = "red"
  // // Fill background green
  // ctx.fillStyle = "green"
  // ctx.fillRect(0, 0, WIDTH, HEIGHT)

  // Create one presenter bloby
  blobsById["presenter"] = new Bloby()
  blobsById["presenter"].color = "lightcoral"
  blobsById["presenter"].name = "Kyle"
}

function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, WIDTH, HEIGHT)

  // // Grid lines for debugging
  // ctx.fillStyle = "#dde";
  // ctx.fillRect(0, 0, WIDTH, HEIGHT);
  // ctx.fillStyle = "red";
  // for (let i = 1; i < 4; i++) {
  //   ctx.fillRect((i * WIDTH) / 4, 0, 1, HEIGHT);
  //   ctx.fillRect(0, (i * HEIGHT) / 4, WIDTH, 1);
  // }

  // Slide number in bottom left corner
  ctx.fillStyle = "black"
  ctx.font = "20px Arial"
  ctx.textAlign = "left"
  ctx.fillText(`Slide ${slide.value}`, 20, HEIGHT - 20)

  // Presenter controls
  if (blobsById["presenter"]) {
    const presenter = blobsById["presenter"]
    let dx = 0
    let dy = 0
    if (keys["a"]) dx -= 1
    if (keys["d"]) dx += 1
    if (keys["s"]) dy += 1
    presenter.move(dx, dy)
  }

  // Draw
  for (const obj of objs) {
    obj.draw()
  }

  switch (slide.value) {
    case 1: {
      break
    }
  }

  // If layout is undefined, show a message in the center of the screen "loading..."
  if (!layout) {
    ctx.fillStyle = "black"
    ctx.font = "50px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Loading presentation layout...", WIDTH / 2, HEIGHT / 2)
  }

  // Request next frame
  requestAnimationFrame(draw)
}

// Event listeners
window.addEventListener("keydown", (e) => {
  keys[e.key] = true
  const presenter = blobsById["presenter"]
  if (e.key === "w" && presenter) presenter.jump()
})
window.addEventListener("keyup", (e) => {
  keys[e.key] = false
  const presenter = blobsById["presenter"]
  if (e.key === "w" && presenter) presenter.unjump()
})

// Main
init()
draw()


/* Websocket setup */
const wss = new WebSocket(`ws://${ipAddress}:${websocketPort}/manage`)
wss.onopen = () => {
  displayQRCode()
  console.log("Connected to WebSocket server")
  wss.send(JSON.stringify({ type: "get-current-layout" }))
}
wss.onerror = (err) => {
  console.error("WebSocket error:", err)
  ipInfoElement.style.color = "red"
  ipInfoElement.innerText = `Error connecting to server, see logs for details`
}
wss.onmessage = (msg) => {
  console.log(msg)
  const data = JSON.parse(msg.data)
  const { id } = data
  switch (data.type) {
    // Set presentation layout
    case "set-layout": {
      console.log(data.layout)
      layout = data.layout
      loadSlide()
      break
    }
    // Create new blob
    case "player-join": {
      blobsById[id] = new Bloby()
      break
    }
    // Destroy a blob
    case "player-leave": {
      console.log("Player left:", id)
      const b = blobsById[id]
      if (objs.includes(b)) objs.splice(objs.indexOf(b), 1)
      delete blobsById[id]
      break
    }
    // Update blob name
    case "change-name": {
      blobsById[id].name = data.name.slice(0, 31)
      break
    }
    // Update blob color
    case "change-color": {
      blobsById[id].color = data.color
      break
    }
    // On user joystick/A/B input
    case "j": {
      const { x, y } = data
      const dx = x / 100
      const dy = -y / 100
      blobsById[id].move(dx, dy)
      break
    }
    case "a": {
      blobsById[id].jump()
      break
    }
    case "b": {
      blobsById[id].jump()
      break
    }
    case "a-up": {
      blobsById[id].unjump()
      break
    }
    case "b-up": {
      blobsById[id].unjump()
      break
    }
    // Update presentation slide
    case "pres-change-slide": {
      slide.value = data.slide
      loadSlide()
      break
    }
    // User submitted a response
    case "masked-word-response": {
      console.log("Masked word response:", data.word, objs)
      const responsesTxt = objs.find((o) => o.text?.toLowerCase()?.includes("responses"))
      if (responsesTxt) {
        const numRes = parseInt(responsesTxt.lines[0].split(":")[1], 10)
        responsesTxt.lines = [`Responses: ${numRes + 1}`]
        userResponses.maskedWord.push(data.word)
      }
      break
    }
    // User chose a Kahoot answer choice
    case "kahoot-choose-option": {
      const optionsTxt = objs.find((o) => o.text === data.option)
      console.log("Kahoot choose option:", data.option, optionsTxt)
      if (optionsTxt) {
        const b = blobsById[id]
        b.visible = false // Hide in the options
        b.kahootAnswer = data.option
        b.kahootTotalDelay += data.delay
      }
      break
    }
    default: {
      console.log("Unknown message type:", data)
    }
  }
}

// On arrow left/right keys, request to change slide
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    wss.send(JSON.stringify({ type: "pres-change-slide", slide: slide.value + 1 }))
  } else if (e.key === "ArrowLeft") {
    wss.send(JSON.stringify({ type: "pres-change-slide", slide: slide.value - 1 }))
  }
})

// Expose wss to the global scope for debugging
window.wss = wss

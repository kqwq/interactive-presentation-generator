import { App } from "uWebSockets.js"
import fs from "fs"

// Websocket port - recemmended to be 9999
const WS_PORT = 9999

// Keep track of the current slide
let managerSlide = 1
let manager = null

/** Send JSON data to a WebSocket client */
function send(ws, data) {
  ws.send(JSON.stringify(data))
}

/** Return layout (default.json) */
function getCurrentLayout(asJSON = false) {
  const filePath = "./save/default.json"
  if (fs.existsSync(filePath)) {
    const fileContents = fs.readFileSync(filePath, "utf8")
    return asJSON ? JSON.parse(fileContents) : fileContents
  }
  return {
    error: "Layout not found",
    filePath
  }
}

/** Handle messages from users */
function onPeerMessage(ws, data) {
  // Client -> ws server -> manager
  if (!manager) {
    console.log("No manager connected, discarding message", data)
    return
  }
  const { id } = ws
  switch (data.type) {

    // When the user requests the current layout
    case "get-current-layout": {
      send(ws, { type: "set-layout", layout: getCurrentLayout(true) })
    }

    // When a user requests to change their blob name
    case "change-name": {
      send(manager, { type: "change-name", id, name: data.name })
      break
    }

    // When a user requests to change their blob color
    case "change-color": {
      send(manager, { type: "change-color", id, color: data.color })
      break
    }

    // When a user moves their joystick
    case "j": {
      const [x, y] = data.p.split(" ").map(Number)
      send(manager, { type: "j", id, x, y })
      break
    }

    // When a user presses/releases the A or B buttons 
    case "a":
    case "b":
    case "a-up":
    case "b-up": {
      send(manager, { type: data.type, id })
      break
    }

    // When the user submits a response to the "Guess the masked word" prompt
    case "masked-word-response": {
      send(manager, { type: "masked-word-response", id, word: data.word })
      break
    }

    // When the user submits a responase to the Kahoot game
    case "kahoot-choose-option": {
      send(manager, { type: "kahoot-choose-option", id, option: data.option, delay: data.delay })
      break
    }

    default: {
      console.log("Unknown message type", data.type)
      break
    }
  }
  // Log all data for debugging purposes
  console.log(data)
}

/** Handles messages from the presentation manager */
function onManagerMessage(ws, data, app) {
  // Mangager -> ws server -> client
  // Manager is short for presentation manager
  switch (data.type) {
    // When the manager requests the current layout
    case "get-current-layout": {
      send(ws, { type: "set-layout", layout: getCurrentLayout(true) })
      break
    }

    // When the manager changes the current slide
    case "pres-change-slide": {
      managerSlide = data.slide
      app.publish("ai-pres", JSON.stringify({ type: "pres-change-slide", slide: managerSlide }))
      break
    }

    // When the manager sends a list of Kahoot answer choices to the client
    case "kahoot-populate-options": {
      app.publish(
        "ai-pres",
        JSON.stringify({
          type: "kahoot-populate-options",
          options: data.options,
          question: data.question,
        })
      )
      break
    }
    default: {
      console.log("Unknown message type", data.type)
      break
    }
  }
  console.log(data)
}

/** Starts the WebSocket server */
async function startWsServer(port) {
  const app = new App()

  app
    .ws("/interact", {
      // I don't know what these options do, but they seem important
      compression: 0,
      maxPayloadLength: 16 * 1024 * 1024,
      idleTimeout: 10,

      open: (ws) => {
        // Discard users who try to connect before the manager is online
        if (!manager) {
          console.log("No manager connected, discarding peer connection")
          ws.close()
          return
        }
        ws.subscribe("ai-pres")
        ws.id = Math.random()
        console.log(
          "A WebSocket peer connected",
          Buffer.from(ws.getRemoteAddressAsText()).toString(),
          ws.id
        )
        setTimeout(() => {
          // Tell the user to change their slide to `managerSlide`
          send(ws, { type: "pres-change-slide", slide: managerSlide })
          // Tell the manager that a player joined with the ID `ws.id`
          send(manager, { type: "player-join", id: ws.id })
        }, 500)
      },
      message: (ws, message, isBinary) => {
        const str = Buffer.from(message).toString()
        const data = JSON.parse(str)
        onPeerMessage(ws, data)
      },
      close: (ws, code, message) => {
        if (!manager) {
          return
        }
        send(manager, { type: "player-leave", id: ws.id })
        console.log("A WebSocket peer disconnected", ws.id)
      },
    })
    .listen(port, (listenSocket) => {
      if (listenSocket) {
        console.log(`Started WebSocket server on port ${port}`)
      } else {
        console.error(`Failed to listen to websocket server on port ${port}`)
      }
    })
    .ws("/manage", {
      compression: 0,
      maxPayloadLength: 16 * 1024 * 1024,
      idleTimeout: 10,

      open: (ws) => {
        console.log(
          "A WebSocket manager connected",
          Buffer.from(ws.getRemoteAddressAsText()).toString()
        )
        ws.subscribe("ai-pres")
        manager = ws
      },
      message: (ws, message, isBinary) => {
        const str = Buffer.from(message).toString()
        const data = JSON.parse(str)
        onManagerMessage(ws, data, app)
      },
      close: (ws, code, message) => {
        manager = null
      },
    })
    .get("/*", (res, req) => {
      res.end("No HTTP endpoint at this location")
    })
    .get("/layout", (res, req) => {
      res.writeHeader("Content-Type", "application/json")
      res.end(getCurrentLayout())
    })

  return app
}

async function main() {
  try {
    const app = await startWsServer(WS_PORT)
  } catch (error) {
    console.error("Error starting servers:", error)
  }
}

main()

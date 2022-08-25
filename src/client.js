import WebSocket from 'ws';
import got from 'got';

// the backend sends pings every 30s
const KEEPALIVE_TIMEOUT = 40 * 1000;

let workServer;
let hiveSocket;
let pawAddress;
let ws;

let connected = false;
let timeoutId = 0;
let retryAttempt = 0;

export default function clientHandler(options) {
  pawAddress = options.pawAddress;
  hiveSocket = options.hiveSocket;

  if(options.wsUrl) {
    workServer = options.wsUrl
  } else {
    workServer = `http://localhost:${options.wsPort}/`
  }

  connect()

  process.stdout.write(`Reward address set to ${pawAddress}\n`);
  process.stdout.write(`Connecting to Hive DPoW at ${hiveSocket}\n`);
  process.stdout.write(`Forwarding PoW requests to work-server at ${workServer}\n`);
}

function connect() {
  ws = new WebSocket(hiveSocket);

  ws.on('open', function open() {
    connected = true
    retryAttempt = 0
    heartbeat()
    ws.send(JSON.stringify({action: "work_subscribe"}));
  });

  ws.on('ping', () => {
    heartbeat()
  })

  ws.on('message', function message(msg) {
    try {
      const data = JSON.parse(msg)
      const action = data.action

      handleEvent(action, data)
    } catch(e) {
      console.error(e)
    }
  });

  ws.on('error', (err) => {
    if(err.code === 'ECONNREFUSED') {
      console.warn('Host refused connection. Hive may be down.')
    } else {
      console.warn('Connection failed.', err.message || err)
    }
  })

  ws.on('close', () => {
    const delay = Math.min(120000, Math.pow(2, Math.floor(retryAttempt / 2)) * 5000)
    const seconds = Math.floor(delay / 1000)

    clearTimeout(timeoutId);

    if(connected) {
      console.log('Connection was closed.')
      terminate()
    }

    console.info(`Retrying connection in ${seconds} seconds.`)

    timeoutId = setTimeout(() => {
      connect()
      retryAttempt++
    }, delay - 500 + Math.random() * 1000)
  })
}

function terminate() {
  connected = false
  ws.terminate()
}

function heartbeat() {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    terminate()
  }, KEEPALIVE_TIMEOUT)
}

function handleEvent(action, data) {
  switch (action) {
    case "work_subscribe":
      return handleSubscribe(data);
    case "work_generate":
      return handleWorkGenerate(data);
    case "work_accept":
      return handleWorkAccept(data);
    case "work_reject":
      return handleWorkAccept(data);
    case "work_cancel":
      return handleWorkCancel(data)
    default:
      console.info('unhandled socket event', action, data)
  }
}

function handleSubscribe(data) {
  process.stdout.write(`Successfully joined the hive 🐝\n`);
  data.queue.forEach(requestWork)
}

function handleWorkGenerate(data) {
  requestWork(data)
}

function handleWorkAccept(data) {
  const date = new Date()
  const dateStr = date.toLocaleTimeString('en-GB', {
    timeZone: 'UTC'
  })

  console.log(`[${dateStr}] Work accepted. Reward: ${data.reward} ${data.rewardUnit}`)
}

function handleWorkReject(data) {
}

function handleWorkCancel(data) {
  const req = got.post(workServer, {
    json: {
      action: 'work_cancel',
      hash: data.hash
    }
  }).json()
}

async function requestWork(data) {
  const req = got.post(workServer, {
    json: {
      action: 'work_generate',
      hash: data.hash,
      difficulty: data.difficulty
    }
  }).json()
  const res = await req;

  if(res.error) {
    if(res.error !== 'Cancelled') {
      console.error(res.error);
    }

    return;
  }

  ws.send(JSON.stringify({
    action: "work_complete",
    address: pawAddress,
    hash: data.hash,
    ...res
  }))
}

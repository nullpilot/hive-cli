import WebSocket from 'ws';
import got from 'got';

let workServer;
let hiveEndpoint;
let pawAddress;
let ws;

export default function clientHandler(options) {
  pawAddress = options.pawAddress;
  workServer = options.workServer;
  hiveEndpoint = options.hiveEndpoint;

  ws = new WebSocket(hiveEndpoint);

  ws.on('open', function open() {
    const init = {action: "work_subscribe"}

    ws.send(JSON.stringify(init));
  });

  ws.on('message', function message(msg) {
    try {
      const data = JSON.parse(msg)
      const action = data.action

      handleEvent(action, data)
    } catch(e) {
      console.error(e)
    }
  });

  process.stdout.write(`Connecting to Hive DPoW as ${pawAddress}\n`);
}

function handleEvent(action, data) {
  switch (action) {
    case "work_subscribe":
      return handleSubscribe(data);
    case "work_generate":
      return handleWorkGenerate(data);
    case "work_cancel":
      return handleWorkCancel(data)
    default:
      console.info('unhandled socket event', action, data)
  }
}

function handleSubscribe(data) {
  data.queue.forEach(requestWork)
}

function handleWorkGenerate(data) {
  requestWork(data)
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

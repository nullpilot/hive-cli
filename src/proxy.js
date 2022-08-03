import Fastify from 'fastify'
import got from 'got';
import blake2 from 'blake2';

let serviceId;
let apiKey;
let hiveEndpoint;
let fastify;

export default function proxyHandler(options) {
  serviceId = options.service;
  apiKey = options.apiKey;
  hiveEndpoint = options.hiveEndpoint;
  fastify = startServer(options.proxyPort);

  process.stdout.write(`Service ID set to ${serviceId}\n`);
  process.stdout.write(`Forwarding requests to Hive DPoW at ${hiveEndpoint}\n`);
}

function startServer(port) {
  fastify = Fastify({
    logger: false
  })

  fastify.addContentTypeParser(/.*/, { parseAs: 'string' }, fastify.getDefaultJsonParser('ignore', 'ignore'))

  // Declare a route
  fastify.post('/', (request, reply) => {
    switch(request.body.action) {
      case "work_generate":
      case "work_cancel":
        return forwardRequest(request.body, reply);
      case "work_validate":
        return handleWorkValidate(request.body, reply);
      default:
        return reply.send({
          error: "Unknown command",
          hint: "Supported commands: work_generate, work_cancel, work_validate"
        })
    }
  })

  fastify.listen({ port: port }, (err, address) => {
    if (err) throw err

    // Server is now listening on ${address}
    process.stdout.write(`Proxy server listening at ${address}/\n`);
    process.stdout.write(`Ready to send work requests to the hive 🐝\n`);
  })

  return fastify;
}

async function forwardRequest(data, reply) {
  const payload = {
    user: serviceId,
    api_key: apiKey,
    ...data
  }

  const req = got.post(hiveEndpoint, {
    json: payload,
    responseType: 'json'
  })

  try {
    const res = await req;
    reply.code(res.statusCode).send(res.body)
  } catch(e) {
    console.error(e)

    reply.code(400).send({
      error: "Request Failed",
      hint: e.message || e
    })
  }
}

function handleWorkValidate(data, reply) {
  const baseDifficulty =    BigInt("0xfffffff800000000")
  const receiveDifficulty = BigInt("0xfffffe0000000000")
  const hash = Buffer.from(data.hash, 'hex')
  const work = Buffer.from(data.work, 'hex')
  const difficulty = workDifficulty(hash, work)
  const multiplier = workMultiplier(difficulty, baseDifficulty)
  const payload = {
    valid_receive: isWorkValid(difficulty, receiveDifficulty),
    valid_all: isWorkValid(difficulty, baseDifficulty),
    multiplier: multiplier.toString(),
    difficulty: difficulty.toString('hex'),
  }

  if(data.difficulty) {
    payload.valid = isWorkValid(difficulty, BigInt(`0x${workdata.difficulty}`))
  }

  reply.send(payload)
}

function workDifficulty(hash, work) {
  return blake2.createHash('blake2b', {digestLength: 8})
  .update(work.reverse())
  .update(hash)
  .digest()
  .reverse()
  .toString('hex')
}

function workMultiplier(workDifficulty, baseDifficulty) {
  const exp = 0x10000000000000000n;
  const diffn = BigInt(`0x${workDifficulty}`);
  const eb = Number(exp - baseDifficulty)
  const ed = Number(exp - diffn)
  return eb / ed;
}

function isWorkValid(workDifficulty, baseDifficulty) {
  const diffn = BigInt(`0x${workDifficulty}`);
  return (diffn > baseDifficulty) ? "1" : "0";
}

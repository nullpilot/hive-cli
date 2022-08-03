import Fastify from 'fastify'
import got from 'got';

let serviceId;
let apiKey;
let hiveEndpoint;
let fastify;

export default function proxyHandler(options) {
  serviceId = options.service;
  apiKey = options.apiKey;
  hiveEndpoint = options.hiveEndpoint;
  fastify = startServer();

  process.stdout.write(`Forwarding to Hive DPoW as ${serviceId}\n`);
}

function startServer(port = 4501) {
  fastify = Fastify({
    logger: true
  })

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

function handleWorkValidate(data) {

}

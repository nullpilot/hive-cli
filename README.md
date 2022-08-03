# hive-cli

Hive is a platform to distribute proof-of-work for [PAW](https://paw.digital/). It enables service providers to outsource proof-of-work and share resources, and allows clients to earn PAW by generating proof-of-work.

`hive-cli` acts as a bridge between Hive and services that implement the Nano RPC protocol. It can act as a work-server compatible proxy to allow services and nodes to easily use the Hive platform.

It also acts as a bridge between Hive and [nano-work-server](https://github.com/nanocurrency/nano-work-server/), to make contributing resources to the network as simple as possible.

## Installation

The current version of `hive-cli` is built with node, which has to be installed first. Follow the installation instructions on the [node website](https://nodejs.org/en/), or use a version manager like [asdf](https://asdf-vm.com/) or [nvm](https://github.com/nvm-sh/nvm).

Once installed you can use `npm` to install `hive-cli`:

```bash
npm install -g nullpilot/hive-cli
```

## Running

### Proxy mode

In proxy mode, `hive-cli` starts a lean HTTP server that mirrors the interface of a nano-work-server, accepts `work_generate` RPC calls and forwards them to the Hive network using your service credentials:

```bash
# start proxy server on port 4501 (default)
hive-cli proxy -s <service_id> -k <api_key> -p 4501
```
Use `hive-cli help proxy` for more info on the options and environment variables they can be substituted with.

If you want to use Hive and have not received access yet, please drop a message in the [PAW Discord server](https://chat.paw.digital/).

### Client mode

In client mode, `hive-cli` connects to the Hive backend via websocket, and forwards incoming `work_generate` requests to a nano-work-server that runs locally. A PAW address needs to be provided. By default, the work-server is assumed to run on port 4500, but can be changed. If the work-server is not running on `localhost` a full URL can be provided via the `-w` option instead:

```bash
# example with nano-work-server running on localhost port 4500
hive-cli client -a <paw_address> -p 4500

# example with nano-work-server running in a different location
hive-cli client -a <paw_address> -w http://host.docker.internal:4500/
```

Use `hive-cli help client` for more info on the options and environment variables they can be substituted with.

## Earning PAW

**Note:** Rewards do get tracked, but payouts are not implemented yet 👀 Soon™️

A client that is the first to submit valid proof-of-work will receive PAW as a reward. The size of the reward depends on the requested difficulty/multiplier. The base difficulty (`FFFFFFF800000000`) has a multiplier of `1` and will result in a `50 PAW` reward. Solving `receive` blocks with a multiplier of `1/64` will result in a reward of `50/64 = 0.78125 PAW`.  
Only the first solution is rewarded, and all other connected workers will be notified to drop that request and move on to the next one.

**Another note:** Hive is brand new and much like every other aspect of the platform, the rewards can (and probably will) still change as feedback comes in, so do let me know what you think! One possible scenario is that `precache` and `ondemand` work could be rewarded differently in the future.

## Credits

Important projects:

- [Nano](https://nano.org/)
- [BoomPOW](https://bpow.banano.cc/)
- [Nano DPoW](https://github.com/guilhermelawless/nano-dpow)
- [ApolloNano DPoW](https://github.com/ApolloNano/nano-dpow/)
- [nano-work-server](https://github.com/nanocurrency/nano-work-server/)

Many thanks to everyone involved with these projects, the Nano Discord server and the PAW community!

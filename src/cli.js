#!/usr/bin/env node

import { Command, Option } from 'commander';
const program = new Command();

import clientHandler from './client.js';
import proxyHandler from './proxy.js';

program
  .name('hive-cli')
  .description('Proxy service to interface between nodes, services, work-servers and Hive DPoW')
  .version('0.1.0');

program.command('client')
  .description('Connect a local work-server to Hive DPoW')
  .addOption(new Option('-a, --paw-address <address>', 'PAW address that rewards will be paid to').env('HIVE_PAW_ADDRESS').makeOptionMandatory())
  .addOption(new Option('-p, --ws-port [port]', 'port of the work-server').default('4500').env('HIVE_WS_PORT'))
  .addOption(new Option('-w, --ws-url [url]', 'overwrite location of the work-server').env('HIVE_WS_URL').conflicts('wsPort'))
  .addOption(new Option('--hive-socket [url]').default('wss://dpow.pawmon.live/websocket').hideHelp())
  .action(clientHandler);

program.command('proxy')
  .description('Server that accepts RPC work requests and forwards them to Hive DPoW')
  .addOption(new Option('--service <id>', 'Hive service ID').env('HIVE_SERVICE_ID'))
  .addOption(new Option('--api-key <key>', 'Hive API key').env('HIVE_API_KEY'))
  .option('--hive-endpoint [url]', 'endpoint of the target Hive instance', 'https://dpow.pawmon.live/service')
  .action(proxyHandler);

program.parse();

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
  .addOption(new Option('--paw-address <address>', 'PAW address that rewards will be paid to').env('HIVE_CLIENT_ADDRESS'))
  .option('--work-server [url]', 'location of the work server', 'http://localhost:4500/')
  .option('--hive-endpoint [url]', 'endpoint of the target Hive instance', 'wss://dpow.pawmon.live/websocket')
  .action(clientHandler);

program.command('proxy')
  .description('Server that accepts RPC work requests and forwards them to Hive DPoW')
  .addOption(new Option('--service <id>', 'Hive service ID').env('HIVE_SERVICE_ID'))
  .addOption(new Option('--api-key <key>', 'Hive API key').env('HIVE_API_KEY'))
  .option('--hive-endpoint [url]', 'endpoint of the target Hive instance', 'https://dpow.pawmon.live/service')
  .action(proxyHandler);

program.parse();

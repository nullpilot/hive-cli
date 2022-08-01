import { Command, Option } from 'commander';
const program = new Command();

import clientHandler from './client.js';

program
  .name('hive-cli')
  .description('Proxy service to interface between nodes, services, work-servers and Hive DPoW')
  .version('0.1.0');

program.command('client')
  .description('Connect a local work-server to Hive DPoW')
  .addOption(new Option('--address <paw_address>', 'PAW address that rewards will be paid to').env('HIVE_CLIENT_ADDRESS'))
  .option('--ws-host [url]', 'host of the work server', 'http://localhost:4500/')
  .option('--hive-host [url]', 'host of the Hive DPoW instance', 'https://dpow.pawmon.live/')
  .action(clientHandler);

program.parse();

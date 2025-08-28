#!/usr/bin/env node

const { Command } = require('commander');
const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
const Btc = require("@ledgerhq/hw-app-btc").default;

const program = new Command();

function getFormat(path) {
  const formatMap = {
    "44'": 'legacy',
    "49'": 'p2sh',
    "84'": 'bech32',
    "86'": 'bech32m',
  }
  const purpose = path.split('/')[0];
  return formatMap[purpose];
}

program
.name('midnight')
.description('CLI for Midnight GlacierDrop Claims with Bitcoin Addresses using the Ledger device')
.version('0.1.0');

program
  .command('check')
  .description('Check each address in the given derivation path for eligibility')
  .argument('<path>', "Derivation path (first 3 levels), e.g. \"49'/0'/0'\"")
  .option('-l, --limit <value>', 'Amount of addresses to return', '20')
  .option('-s, --skip', 'Just list addresses without eligibility check')
  .action(async (path, { limit, skip = false }) => {
    const formatMap = {
      "44'": 'legacy',
      "49'": 'p2sh',
      "84'": 'bech32',
      "86'": 'bech32m',
    }
    const format = getFormat(path);
    console.log(`Getting ${limit} ${format} addresses from ${path}...\n`);
    const transport = await TransportNodeHid.create();
    const btc = new Btc({ transport, currency: "bitcoin" });

    for (let i = 0; i < limit; i++) {
      for (let j = 0; j < 2; j++)  {
        const fullPath = `${path}/${j}/${i}`;
        const address = await btc.getWalletPublicKey(`${fullPath}`, { format }).then(o => o.bitcoinAddress);
        let value;
        if (!skip) {
          const url = `https://proof.provtree-midnight.com/check/bitcoin/${address}`;
          try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`Response status: ${response.status}`);
            }

            value = await response.json().then(o => o.value);
          } catch (error) {
            if (!error.message.includes('Response status: 404')) {
              console.error(error.message);
            }
          }
        }
        console.log(`${fullPath}\t${address}${value ? `\t${value / 10 ** 6}` : ''}`);
      }
    }

    transport.close();
  });

program
  .command('sign')
  .description('Sign the given message for the given derivation path using the Ledger device')
  .argument('<message>', "Message to sign, e.g. 'Hello World'")
  .argument('<path>', "Full derivation path, e.g. \"84'/0'/0'/1/9\"")
  .action(async (message, path) => {
    const format = getFormat(path);
    console.info(`Signing message for ${path} (${format})...`);

    const transport = await TransportNodeHid.create();
    const btc = new Btc({ transport, currency: "bitcoin" });
    const messageHex = Buffer.from(message).toString("hex");
    const address = await btc.getWalletPublicKey(path, { format }).then(o => o.bitcoinAddress);
    const xPub = await btc.getWalletXpub({ path, xpubVersion: 0x0488B21E });

    console.info('xPub:', xPub);
    console.info('Address:', address);
    console.info('Message:', message);
    console.debug('HexMessage:', messageHex);
    console.info('-----------------------Waiting for Ledger Signing---------------------');
    const { v, r, s } = await btc.signMessage(path, messageHex);
    console.debug('v:', v);
    console.debug('r:', r);
    console.debug('s:', s);
    console.log();
    const signature = Buffer.from((v + 27 + 4).toString(16) + r + s, 'hex').toString('base64');
    console.log("Signed base64 signature:", signature);

    transport.close();
  });

program.parse();

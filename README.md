Midnight GlacierDrop Check (for Bitcoin on Ledger devices)
==========================================================

This is a Node.js based CLI that helps claiming the Midnight GlacierDrop.
Why is this relevant? Because the claim interface https://claim.midnight.gd/
- doesn't deal with historic balances at the time of the snapshot
- doesn't take certain Ledger Setups into account

The `check` command finds eligible addresses in the given derivation path
The `sign` command signs the message (copied from the Midnight claim portal) for the given derivation path

Please note that this CLI is for the Bitcoin network only and doesn't automate the claim itself! You need to manually use the address and signed message signature in the Midnight claim portal.

## Setup

```shell
git clone https://github.com/kwizzn/midnight-glacier-drop.git
cd midnight-glacier-drop/
npm install
npm link
```

## Usage

```
Usage: midnight [options] [command]

CLI for Midnight GlacierDrop Claims with Bitcoin Addresses using the Ledger device

Options:
  -V, --version           output the version number
  -h, --help              display help for command

Commands:
  check [options] <path>  Check each address in the given derivation path for eligibility
  sign <message> <path>   Sign the given message for the given derivation path using the Ledger device
  help [command]          display help for command
```

1. Get the derivation path of your wallet in Ledger Live (wrench icon > Advanced) and paste the first 3 levels, e.g. `84'/0'/0'` 
   
2. Check 100 (internal & external) addresses of a given derivation path for eligibility: 

```shell
midnight check "84'/0'/0'" -l 100
```
```
Getting 100 bech32 addresses from 84'/0'/0'...

84'/0'/0'/0/0	bc1q3zzkl8leqlessgu56lvyxf6e8dyw5z0lgku43z
84'/0'/0'/1/0	bc1qkndqz5n4mcpuy448evzq5j3nxyenpxy6xg788n
84'/0'/0'/0/1	bc1qxdse6exageka5g4mlxwtagewg6pmtkgv3r8wp6
84'/0'/0'/1/1	bc1qzj2v7vc9neg8rmxsjgg42xsq4hqa9wjghq6yaw
84'/0'/0'/0/2	bc1qnth6zmcqyn6md2d8hqy8s3r2w2md332glg8rtl
84'/0'/0'/1/2	bc1q8np8ufa7qc77jqygk7p4jqez6wsnx6juxwerj3
84'/0'/0'/0/3	bc1qlfkdplhfmqsnd5c0zk5ztdchtrtcuss30q7mp9	1234.56789
84'/0'/0'/1/3	bc1qjc55ase2e5zcerh9afddh7q0xg43vx3gceaglq
84'/0'/0'/0/4	bc1qvgk9upt2lejzggtu6p7pxvrlw9mrk74w8yfctg
84'/0'/0'/1/4	bc1q2afumam56rxa0qyw27rppqxm6f06cm584scevk
```

In this example result, 1234.56789 $NIGHT can be claimed for `bc1qlfkdplhfmqsnd5c0zk5ztdchtrtcuss30q7mp9`

3. Initiate the claim manually on https://claim.midnight.gd/ to get the message to sign

4. Sign the message for the derivation path

```shell
midnight sign "STAR <amount> to <ada_address> <hash>" "84'/0'/0'/0/3"
```
```
Signing message for 84'/0'/0'/0/3 (bech32)...
xPub: xpub123456789...
Address: bc1qlfkdplhfmqsnd5c0zk5ztdchtrtcuss30q7mp9
Message: midnight sign "STAR <amount> to <ada_address> <hash>
HexMessage: 6d69646e69676874207369676e202253544152203c616d6f756e743e20746f203c6164615f616464726573733e203c686173683e
-----------------------Waiting for Ledger Signing---------------------
v: 0
r: 2e32b98a70080f4dee01f268bd0af80002b690e2909320533f209bf890f9501f
s: 50ff0ab921fd677877ae01445fe01e4222cb548cfb0f692fc67b434150b26414

Signed base64 signature: Hy4yuYpwCA9N7gHyaL0K+AACtpDikJMgUz8gm/iQ+VAfUP8KuSH9Z3h3rgFEX+AeQiLLVIz7D2kvxntDQVCyZBQ=
```

5. Enter the base64 signature manually on https://claim.midnight.gd/

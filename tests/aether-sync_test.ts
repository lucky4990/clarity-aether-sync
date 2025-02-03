import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Ensure can create new sync channel",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet_1 = accounts.get("wallet_1")!;
    const wallet_2 = accounts.get("wallet_2")!;
    
    let block = chain.mineBlock([
      Tx.contractCall(
        "aether-sync",
        "create-channel",
        [types.principal(wallet_2.address)],
        wallet_1.address
      )
    ]);
    
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 2);
    block.receipts[0].result.expectOk().expectUint(1);
  },
});

Clarinet.test({
  name: "Ensure can post update to channel",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet_1 = accounts.get("wallet_1")!;
    const wallet_2 = accounts.get("wallet_2")!;
    
    let block = chain.mineBlock([
      Tx.contractCall(
        "aether-sync",
        "create-channel", 
        [types.principal(wallet_2.address)],
        wallet_1.address
      ),
      Tx.contractCall(
        "aether-sync",
        "post-update",
        [
          types.uint(1),
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        ],
        wallet_1.address
      )
    ]);
    
    assertEquals(block.receipts.length, 2);
    block.receipts[1].result.expectOk().expectUint(1);
  },
});

Clarinet.test({
  name: "Ensure can close channel and prevent further updates",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet_1 = accounts.get("wallet_1")!;
    const wallet_2 = accounts.get("wallet_2")!;
    
    let block = chain.mineBlock([
      Tx.contractCall(
        "aether-sync",
        "create-channel",
        [types.principal(wallet_2.address)],
        wallet_1.address
      ),
      Tx.contractCall(
        "aether-sync", 
        "close-channel",
        [types.uint(1)],
        wallet_1.address
      ),
      Tx.contractCall(
        "aether-sync",
        "post-update",
        [
          types.uint(1),
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        ],
        wallet_1.address
      )
    ]);

    assertEquals(block.receipts.length, 3);
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectErr(100);
  },
});

Notes on correct implementation from Mastering Bitcoin
- Alice sends bitcoin to Bob
- In order to understand Alice's transaction, we need to retrieve the previous transaction referenced in input using a function{getTransaction(txid, voutIndex)} that retrieves previous transactions and UTXOs
- A user's bitcoin "balance" is the sum of all UTXO that users wallet can spend and which may be scatter among hudreds of transactions and hundreds of blocks
- Concept of balance is handled by the wallet because the wallet calculates the user's balance by scanning the blockchain and aggregating the value of any UTXO the wallet can spend with the keys it controls.
- Most wallets maintain a database or use a database service to store a quick reference set of all the UTXO they can spend with the keys they control
- Every validating node will need to retrieve the UTXO referenced in the transaction inputs in order to validate the transaction

```
{
    "vin" (input): [
        {
            "txid": pointer to transaction containing the UTXO to be spent
            "vout": 0 (pointer to UTXO (unspent output from bitcoin transaction))
            "scriptSig":
            "sequence"
        }
    ],
    "vout" (output): [
        {
            "value": 0.0150000,
            "scriptPubKey":
        },
        {
            "value": 0.08450000,
            "scriptPubKey":
        }
    ]
}
```
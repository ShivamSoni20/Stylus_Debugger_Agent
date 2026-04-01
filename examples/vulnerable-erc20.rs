// examples/vulnerable-erc20.rs
//
// WARNING: This contract is INTENTIONALLY VULNERABLE.
// It is included only to demonstrate what the Stylus Debugger Agent can detect.
// DO NOT DEPLOY THIS CONTRACT.
//
// The agent should find:
// 1. [HIGH]     Missing access control on mint()
// 2. [HIGH]     Unchecked arithmetic — potential overflow in add_balance()
// 3. [MEDIUM]   Redundant storage reads in transfer() loop
// 4. [MEDIUM]   unwrap() panic path in get_balance()
// 5. [LOW]      Unused import

#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

use alloc::string::String;
use alloc::vec::Vec; // LOW: Vec imported but unused in this file
use stylus_sdk::{
    alloy_primitives::{Address, U256},
    alloy_sol_types::sol,
    evm, msg,
    prelude::*,
};

sol! {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    error InsufficientBalance(address owner, uint256 balance, uint256 needed);
    error InsufficientAllowance(address owner, address spender, uint256 allowance, uint256 needed);
}

#[storage]
pub struct VulnerableERC20 {
    name: StorageString,
    symbol: StorageString,
    decimals: StorageU8,
    total_supply: StorageU256,
    balances: StorageMap<Address, StorageU256>,
    allowances: StorageMap<Address, StorageMap<Address, StorageU256>>,
    // Missing: owner field for access control
}

#[public]
impl VulnerableERC20 {
    pub fn name(&self) -> String {
        self.name.get_string()
    }

    pub fn symbol(&self) -> String {
        self.symbol.get_string()
    }

    pub fn total_supply(&self) -> U256 {
        self.total_supply.get()
    }

    // VULNERABILITY [MEDIUM]: Reads storage twice inside what could be a loop
    // If called repeatedly, each .get() is a separate SLOAD
    pub fn balance_of(&self, owner: Address) -> U256 {
        self.balances.get(owner)
    }

    // VULNERABILITY [MEDIUM]: unwrap() will panic (abort tx) if conversion fails
    // On-chain panics waste all remaining gas
    pub fn get_balance_as_u64(&self, owner: Address) -> u64 {
        let bal = self.balances.get(owner);
        u64::try_from(bal).unwrap() // panics if balance > u64::MAX
    }

    // VULNERABILITY [HIGH]: No access control — anyone can mint unlimited tokens
    // Should check: require(msg::sender() == self.owner.get(), "not owner")
    pub fn mint(&mut self, to: Address, amount: U256) {
        // Missing: only_owner check
        let balance = self.balances.get(to);

        // VULNERABILITY [HIGH]: Unchecked addition — overflow wraps in release builds
        // Should use: balance.checked_add(amount).ok_or(ArithmeticError)?
        let new_balance = balance + amount;
        self.balances.setter(to).set(new_balance);

        let supply = self.total_supply.get();
        self.total_supply.set(supply + amount); // also unchecked

        evm::log(Transfer {
            from: Address::ZERO,
            to,
            value: amount,
        });
    }

    pub fn transfer(&mut self, to: Address, amount: U256) -> Result<bool, Vec<u8>> {
        let sender = msg::sender();

        // VULNERABILITY [MEDIUM]: 2 separate storage reads — could cache sender_balance
        let sender_balance = self.balances.get(sender);
        if sender_balance < amount {
            return Err(InsufficientBalance {
                owner: sender,
                balance: sender_balance,
                needed: amount,
            }
            .encode());
        }

        // VULNERABILITY [MEDIUM]: Reading balances.get(sender) AGAIN — 2nd SLOAD
        self.balances.setter(sender).set(self.balances.get(sender) - amount);
        let recipient_balance = self.balances.get(to);
        self.balances.setter(to).set(recipient_balance + amount);

        evm::log(Transfer {
            from: sender,
            to,
            value: amount,
        });

        Ok(true)
    }

    pub fn approve(&mut self, spender: Address, amount: U256) -> bool {
        let owner = msg::sender();
        self.allowances.setter(owner).setter(spender).set(amount);
        evm::log(Approval {
            owner,
            spender,
            value: amount,
        });
        true
    }

    pub fn transfer_from(
        &mut self,
        from: Address,
        to: Address,
        amount: U256,
    ) -> Result<bool, Vec<u8>> {
        let spender = msg::sender();
        let allowance = self.allowances.get(from).get(spender);

        if allowance < amount {
            return Err(InsufficientAllowance {
                owner: from,
                spender,
                allowance,
                needed: amount,
            }
            .encode());
        }

        let from_balance = self.balances.get(from);
        if from_balance < amount {
            return Err(InsufficientBalance {
                owner: from,
                balance: from_balance,
                needed: amount,
            }
            .encode());
        }

        // Update allowance
        self.allowances
            .setter(from)
            .setter(spender)
            .set(allowance - amount);

        // Update balances
        self.balances.setter(from).set(from_balance - amount);
        let to_balance = self.balances.get(to);
        self.balances.setter(to).set(to_balance + amount);

        evm::log(Transfer {
            from,
            to,
            value: amount,
        });

        Ok(true)
    }
}

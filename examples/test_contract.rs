#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

// Arbitrum Stylus Rust Contract - Test Sample
// This contract contains a deliberate architectural flaw for the Auditor to detect.

use stylus_sdk::{alloy_primitives::{U256, Address}, msg, prelude::*};

sol_storage! {
    #[entrypoint]
    pub struct VaultManager {
        uint256 total_locked;
        mapping(address => uint256) balances;
        address protocol_admin;
    }
}

#[public]
impl VaultManager {
    /// Initializes the protocol admin. 
    /// Flaw: Can be called by anyone repeatedly to overwrite the admin.
    pub fn initialize(&mut self) {
        self.protocol_admin.set(msg::sender());
    }

    /// Deposits funds (assumed ETH sent in transaction)
    #[payable]
    pub fn deposit(&mut self) {
        let amount = msg::value();
        let user = msg::sender();
        
        let current_balance = self.balances.get(user);
        self.balances.setter(user).set(current_balance + amount);
        
        let current_total = self.total_locked.get();
        self.total_locked.set(current_total + amount);
    }

    /// Unsafe Arbitrary Withdrawal
    /// Flaw: Missing balance constraint check! A user can withdraw more than they deposited.
    pub fn emergency_withdraw(&mut self, amount: U256) {
        let user = msg::sender();
        
        // Logical flaw: We subtract total_locked but don't strictly check user bounds
        let current_total = self.total_locked.get();
        self.total_locked.set(current_total - amount);

        let current_balance = self.balances.get(user);
        self.balances.setter(user).set(current_balance - amount);
        
        // Note: Real ETH transfer logic would go here.
    }
}

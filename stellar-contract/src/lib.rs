#![no_std]

mod admin;
mod asset_registry;
mod blacklist;
mod contract;
mod scam_report;
mod storage_types;
mod whitelist;

pub use crate::contract::StellarSafeRegistryClient;
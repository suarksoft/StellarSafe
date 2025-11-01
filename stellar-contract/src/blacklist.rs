use crate::storage_types::{AddressType, BlacklistEntry, DataKey, Severity, INSTANCE_BUMP_AMOUNT, INSTANCE_LIFETIME_THRESHOLD};
use soroban_sdk::{Address, Env, String};

pub fn has_blacklist_entry(e: &Env, address: Address) -> bool {
    let key = DataKey::Blacklist(address);
    e.storage().persistent().has(&key)
}

pub fn read_blacklist_entry(e: &Env, address: Address) -> Option<BlacklistEntry> {
    let key = DataKey::Blacklist(address);
    if let Some(entry) = e.storage().persistent().get::<_, BlacklistEntry>(&key) {
        // Check if expired
        if let Some(expires_at) = entry.expires_at {
            if expires_at < e.ledger().sequence() {
                // Entry expired, remove it
                e.storage().persistent().remove(&key);
                return None;
            }
        }
        e.storage()
            .persistent()
            .extend_ttl(&key, INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
        Some(entry)
    } else {
        None
    }
}

pub fn write_blacklist_entry(e: &Env, entry: BlacklistEntry) {
    let address = entry.address.clone();
    let key = DataKey::Blacklist(address);
    e.storage().persistent().set(&key, &entry);
    e.storage()
        .persistent()
        .extend_ttl(&key, INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
}

pub fn add_to_blacklist(
    e: &Env,
    address: Address,
    reason: String,
    evidence_url: Option<String>,
    severity: Severity,
    admin: Address,
    expires_at: Option<u64>,
) {
    admin.require_auth();

    if has_blacklist_entry(e, address.clone()) {
        panic!("Address already in blacklist");
    }

    let entry = BlacklistEntry {
        address: address.clone(),
        address_type: AddressType::Issuer, // Default, can be updated
        reason,
        evidence_url,
        severity,
        added_at: e.ledger().sequence(),
        expires_at,
    };

    write_blacklist_entry(e, entry);
}

pub fn remove_from_blacklist(e: &Env, address: Address, admin: Address) {
    admin.require_auth();

    if !has_blacklist_entry(e, address.clone()) {
        panic!("Address not in blacklist");
    }

    let key = DataKey::Blacklist(address);
    e.storage().persistent().remove(&key);
}

pub fn is_blacklisted(e: &Env, address: Address) -> bool {
    has_blacklist_entry(e, address) && read_blacklist_entry(e, address).is_some()
}

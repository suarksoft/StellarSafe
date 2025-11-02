use crate::storage_types::{DataKey, WhitelistEntry, INSTANCE_BUMP_AMOUNT, INSTANCE_LIFETIME_THRESHOLD};
use soroban_sdk::{Address, Env, String};

pub fn has_whitelist_entry(e: &Env, issuer_address: Address) -> bool {
    let key = DataKey::Whitelist(issuer_address);
    e.storage().persistent().has(&key)
}

pub fn read_whitelist_entry(e: &Env, issuer_address: Address) -> Option<WhitelistEntry> {
    let key = DataKey::Whitelist(issuer_address);
    if let Some(entry) = e.storage().persistent().get::<_, WhitelistEntry>(&key) {
        e.storage()
            .persistent()
            .extend_ttl(&key, INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
        Some(entry)
    } else {
        None
    }
}

pub fn write_whitelist_entry(e: &Env, entry: WhitelistEntry) {
    let issuer_address = entry.issuer_address.clone();
    let key = DataKey::Whitelist(issuer_address);
    e.storage().persistent().set(&key, &entry);
    e.storage()
        .persistent()
        .extend_ttl(&key, INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
}

pub fn add_to_whitelist(
    e: &Env,
    issuer_address: Address,
    name: String,
    description: String,
    verifier: Address,
) {
    verifier.require_auth();

    if has_whitelist_entry(e, issuer_address.clone()) {
        panic!("Issuer already in whitelist");
    }

    let entry = WhitelistEntry {
        issuer_address: issuer_address.clone(),
        name,
        description,
        verified_by: verifier,
        added_at: e.ledger().sequence() as u64,
    };

    write_whitelist_entry(e, entry);
}

pub fn remove_from_whitelist(e: &Env, issuer_address: Address, admin: Address) {
    admin.require_auth();

    if !has_whitelist_entry(e, issuer_address.clone()) {
        panic!("Issuer not in whitelist");
    }

    let key = DataKey::Whitelist(issuer_address);
    e.storage().persistent().remove(&key);
}

pub fn is_whitelisted(e: &Env, issuer_address: Address) -> bool {
    has_whitelist_entry(e, issuer_address)
}

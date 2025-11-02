use crate::storage_types::{AssetInfo, AssetKey, DataKey, RiskLevel, INSTANCE_BUMP_AMOUNT, INSTANCE_LIFETIME_THRESHOLD};
use soroban_sdk::{Address, Env, String};

pub fn get_asset_key(asset_code: String, issuer_address: Address) -> AssetKey {
    AssetKey {
        asset_code,
        issuer_address,
    }
}

pub fn asset_exists(e: &Env, asset_code: String, issuer_address: Address) -> bool {
    let key = DataKey::Asset(get_asset_key(asset_code, issuer_address));
    e.storage().persistent().has(&key)
}

pub fn read_asset(
    e: &Env,
    asset_code: String,
    issuer_address: Address,
) -> Option<AssetInfo> {
    let key = DataKey::Asset(get_asset_key(asset_code.clone(), issuer_address.clone()));
    if let Some(asset) = e.storage().persistent().get::<_, AssetInfo>(&key) {
        e.storage()
            .persistent()
            .extend_ttl(&key, INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
        Some(asset)
    } else {
        None
    }
}

pub fn write_asset(e: &Env, asset: AssetInfo) {
    let asset_key = get_asset_key(asset.asset_code.clone(), asset.issuer_address.clone());
    let key = DataKey::Asset(asset_key);
    e.storage().persistent().set(&key, &asset);
    e.storage()
        .persistent()
        .extend_ttl(&key, INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
}

pub fn register_asset(
    e: &Env,
    asset_code: String,
    issuer_address: Address,
    risk_score: u32,
    risk_level: RiskLevel,
    home_domain: Option<String>,
) -> AssetInfo {
    if asset_exists(e, asset_code.clone(), issuer_address.clone()) {
        panic!("Asset already registered");
    }

    let current_ledger = e.ledger().sequence() as u64;
    let asset = AssetInfo {
        asset_code: asset_code.clone(),
        issuer_address: issuer_address.clone(),
        risk_level,
        risk_score,
        is_verified: false,
        trust_score: 0,
        home_domain,
        registered_at: current_ledger,
        updated_at: current_ledger,
    };

    write_asset(e, asset.clone());
    asset
}

pub fn update_asset_risk(
    e: &Env,
    asset_code: String,
    issuer_address: Address,
    risk_score: u32,
    risk_level: RiskLevel,
) {
    let mut asset = read_asset(e, asset_code.clone(), issuer_address.clone())
        .expect("Asset not found");
    
    asset.risk_score = risk_score;
    asset.risk_level = risk_level;
    asset.updated_at = e.ledger().sequence() as u64;

    write_asset(e, asset);
}

pub fn verify_asset(e: &Env, asset_code: String, issuer_address: Address) {
    let mut asset = read_asset(e, asset_code.clone(), issuer_address.clone())
        .expect("Asset not found");
    
    asset.is_verified = true;
    asset.trust_score = 100; // Verified assets get max trust
    asset.updated_at = e.ledger().sequence() as u64;

    write_asset(e, asset);
}

pub fn update_trust_score(
    e: &Env,
    asset_code: String,
    issuer_address: Address,
    trust_score: u32,
) {
    if trust_score > 100 {
        panic!("Trust score must be 0-100");
    }

    let mut asset = read_asset(e, asset_code.clone(), issuer_address.clone())
        .expect("Asset not found");
    
    asset.trust_score = trust_score;
    asset.updated_at = e.ledger().sequence() as u64;

    write_asset(e, asset);
}

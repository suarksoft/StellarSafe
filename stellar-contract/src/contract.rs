use crate::admin::{has_administrator, read_administrator, write_administrator};
use crate::asset_registry::{
    asset_exists, read_asset, register_asset, update_asset_risk, update_trust_score, verify_asset,
};
use crate::blacklist::{add_to_blacklist, is_blacklisted, read_blacklist_entry, remove_from_blacklist};
use crate::scam_report::{mark_report_spam, read_report, submit_report, verify_report};
use crate::storage_types::{
    AssetInfo, BlacklistEntry, ReportData, ReportStatus, ReportType, RiskLevel, Severity,
    WhitelistEntry, INSTANCE_BUMP_AMOUNT, INSTANCE_LIFETIME_THRESHOLD,
};
use crate::whitelist::{add_to_whitelist, is_whitelisted, read_whitelist_entry, remove_from_whitelist};
use soroban_sdk::{contract, contractimpl, Address, Env, String};

#[contract]
pub struct StellarSafeRegistry;

#[contractimpl]
impl StellarSafeRegistry {
    /// Initialize the contract with an admin address
    pub fn initialize(e: Env, admin: Address) {
        if has_administrator(&e) {
            panic!("already initialized");
        }
        write_administrator(&e, &admin);
        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
    }

    /// Set a new admin (only current admin can call)
    pub fn set_admin(e: Env, new_admin: Address) {
        let admin = read_administrator(&e).expect("Admin not found");
        admin.require_auth();

        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        write_administrator(&e, &new_admin);
    }

    // ========== Asset Registry Functions ==========

    /// Register a new asset with risk information
    pub fn register_asset(
        e: Env,
        asset_code: String,
        issuer_address: Address,
        risk_score: u32,
        risk_level: RiskLevel,
        home_domain: Option<String>,
    ) -> AssetInfo {
        if risk_score > 100 {
            panic!("Risk score must be 0-100");
        }
        register_asset(&e, asset_code, issuer_address, risk_score, risk_level, home_domain)
    }

    /// Get asset information
    pub fn get_asset(
        e: Env,
        asset_code: String,
        issuer_address: Address,
    ) -> Option<AssetInfo> {
        read_asset(&e, asset_code, issuer_address)
    }

    /// Check if asset exists
    pub fn has_asset(e: Env, asset_code: String, issuer_address: Address) -> bool {
        asset_exists(&e, asset_code, issuer_address)
    }

    /// Update asset risk score (admin only)
    pub fn update_asset_risk(
        e: Env,
        asset_code: String,
        issuer_address: Address,
        risk_score: u32,
        risk_level: RiskLevel,
    ) {
        let admin = read_administrator(&e).expect("Admin not found");
        admin.require_auth();

        if risk_score > 100 {
            panic!("Risk score must be 0-100");
        }

        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        update_asset_risk(&e, asset_code, issuer_address, risk_score, risk_level);
    }

    /// Verify an asset (mark as safe, admin only)
    pub fn verify_asset(e: Env, asset_code: String, issuer_address: Address) {
        let admin = read_administrator(&e).expect("Admin not found");
        admin.require_auth();

        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        verify_asset(&e, asset_code, issuer_address);
    }

    /// Update trust score (admin only)
    pub fn update_trust_score(
        e: Env,
        asset_code: String,
        issuer_address: Address,
        trust_score: u32,
    ) {
        let admin = read_administrator(&e).expect("Admin not found");
        admin.require_auth();

        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        update_trust_score(&e, asset_code, issuer_address, trust_score);
    }

    // ========== Scam Report Functions ==========

    /// Submit a scam report (anyone can submit)
    pub fn submit_report(
        e: Env,
        issuer_address: Address,
        asset_code: Option<String>,
        report_type: ReportType,
        description: String,
        evidence_url: Option<String>,
    ) -> u64 {
        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        let reporter = e.invoker();
        submit_report(
            &e,
            issuer_address,
            asset_code,
            reporter,
            report_type,
            description,
            evidence_url,
        )
    }

    /// Get a report by ID
    pub fn get_report(e: Env, report_id: u64) -> Option<ReportData> {
        read_report(&e, report_id)
    }

    /// Verify a report (admin only)
    pub fn verify_report(e: Env, report_id: u64, approved: bool) {
        let admin = read_administrator(&e).expect("Admin not found");
        admin.require_auth();

        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        verify_report(&e, report_id, admin, approved);
    }

    /// Mark a report as spam (admin only)
    pub fn mark_report_spam(e: Env, report_id: u64) {
        let admin = read_administrator(&e).expect("Admin not found");
        admin.require_auth();

        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        mark_report_spam(&e, report_id, admin);
    }

    // ========== Whitelist Functions ==========

    /// Add an issuer to whitelist (admin only)
    pub fn add_to_whitelist(
        e: Env,
        issuer_address: Address,
        name: String,
        description: String,
    ) {
        let admin = read_administrator(&e).expect("Admin not found");
        admin.require_auth();

        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        add_to_whitelist(&e, issuer_address, name, description, admin);
    }

    /// Remove an issuer from whitelist (admin only)
    pub fn remove_from_whitelist(e: Env, issuer_address: Address) {
        let admin = read_administrator(&e).expect("Admin not found");
        admin.require_auth();

        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        remove_from_whitelist(&e, issuer_address, admin);
    }

    /// Check if issuer is whitelisted
    pub fn is_whitelisted(e: Env, issuer_address: Address) -> bool {
        is_whitelisted(&e, issuer_address)
    }

    /// Get whitelist entry
    pub fn get_whitelist_entry(e: Env, issuer_address: Address) -> Option<WhitelistEntry> {
        read_whitelist_entry(&e, issuer_address)
    }

    // ========== Blacklist Functions ==========

    /// Add an address to blacklist (admin only)
    pub fn add_to_blacklist(
        e: Env,
        address: Address,
        reason: String,
        evidence_url: Option<String>,
        severity: Severity,
        expires_at: Option<u64>,
    ) {
        let admin = read_administrator(&e).expect("Admin not found");
        admin.require_auth();

        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        add_to_blacklist(&e, address, reason, evidence_url, severity, admin, expires_at);
    }

    /// Remove an address from blacklist (admin only)
    pub fn remove_from_blacklist(e: Env, address: Address) {
        let admin = read_administrator(&e).expect("Admin not found");
        admin.require_auth();

        e.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        remove_from_blacklist(&e, address, admin);
    }

    /// Check if address is blacklisted
    pub fn is_blacklisted(e: Env, address: Address) -> bool {
        is_blacklisted(&e, address)
    }

    /// Get blacklist entry
    pub fn get_blacklist_entry(e: Env, address: Address) -> Option<BlacklistEntry> {
        read_blacklist_entry(&e, address)
    }
}
use soroban_sdk::{contracttype, Address, String};

// Risk levels matching the frontend system
#[derive(Clone, Copy)]
#[contracttype]
pub enum RiskLevel {
    Safe = 0,
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4,
}

// Asset information stored on-chain
#[derive(Clone)]
#[contracttype]
pub struct AssetInfo {
    pub asset_code: String,
    pub issuer_address: Address,
    pub risk_level: RiskLevel,
    pub risk_score: u32, // 0-100
    pub is_verified: bool,
    pub trust_score: u32, // 0-100
    pub home_domain: Option<String>,
    pub registered_at: u64, // Ledger timestamp
    pub updated_at: u64,
}

// Scam report data
#[derive(Clone)]
#[contracttype]
pub enum ReportType {
    Phishing,
    FakeToken,
    RugPull,
    Honeypot,
    FrozenFunds,
    Other,
}

#[derive(Clone)]
#[contracttype]
pub enum ReportStatus {
    Pending,
    Verified,
    Rejected,
    Spam,
}

#[derive(Clone)]
#[contracttype]
pub struct ReportData {
    pub report_id: u64,
    pub issuer_address: Address,
    pub asset_code: Option<String>,
    pub reporter_address: Address,
    pub report_type: ReportType,
    pub description: String,
    pub evidence_url: Option<String>,
    pub status: ReportStatus,
    pub verified_by: Option<Address>,
    pub created_at: u64,
    pub verified_at: Option<u64>,
}

// Whitelist entry
#[derive(Clone)]
#[contracttype]
pub struct WhitelistEntry {
    pub issuer_address: Address,
    pub name: String,
    pub description: String,
    pub verified_by: Address,
    pub added_at: u64,
}

// Blacklist entry
#[derive(Clone)]
#[contracttype]
pub enum AddressType {
    Issuer,
    Recipient,
    Contract,
}

#[derive(Clone)]
#[contracttype]
pub enum Severity {
    Medium,
    High,
    Critical,
}

#[derive(Clone)]
#[contracttype]
pub struct BlacklistEntry {
    pub address: Address,
    pub address_type: AddressType,
    pub reason: String,
    pub evidence_url: Option<String>,
    pub severity: Severity,
    pub added_at: u64,
    pub expires_at: Option<u64>,
}

// Storage keys
#[derive(Clone)]
#[contracttype]
pub struct AssetKey {
    pub asset_code: String,
    pub issuer_address: Address,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    Asset(AssetKey),
    Report(u64), // report_id
    Whitelist(Address), // issuer_address
    Blacklist(Address), // address
    ReportCounter,
    LastReportId,
}

// TTL constants
pub const DAY_IN_LEDGERS: u32 = 17280;
pub const INSTANCE_BUMP_AMOUNT: u32 = 30 * DAY_IN_LEDGERS;
pub const INSTANCE_LIFETIME_THRESHOLD: u32 = INSTANCE_BUMP_AMOUNT - DAY_IN_LEDGERS;
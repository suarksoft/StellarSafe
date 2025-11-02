use crate::storage_types::{
    DataKey, ReportData, ReportStatus, ReportType, INSTANCE_BUMP_AMOUNT, INSTANCE_LIFETIME_THRESHOLD,
};
use soroban_sdk::{Address, Env, String};

pub fn get_report_counter(e: &Env) -> u64 {
    let key = DataKey::ReportCounter;
    if let Some(counter) = e.storage().instance().get::<_, u64>(&key) {
        counter
    } else {
        0
    }
}

pub fn increment_report_counter(e: &Env) -> u64 {
    let key = DataKey::ReportCounter;
    let counter = get_report_counter(e) + 1;
    e.storage().instance().set(&key, &counter);
    e.storage()
        .instance()
        .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
    counter
}

pub fn has_report(e: &Env, report_id: u64) -> bool {
    let key = DataKey::Report(report_id);
    e.storage().persistent().has(&key)
}

pub fn read_report(e: &Env, report_id: u64) -> Option<ReportData> {
    let key = DataKey::Report(report_id);
    if let Some(report) = e.storage().persistent().get::<_, ReportData>(&key) {
        e.storage()
            .persistent()
            .extend_ttl(&key, INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
        Some(report)
    } else {
        None
    }
}

pub fn write_report(e: &Env, report: ReportData) {
    let report_id = report.report_id;
    let key = DataKey::Report(report_id);
    e.storage().persistent().set(&key, &report);
    e.storage()
        .persistent()
        .extend_ttl(&key, INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
}

pub fn submit_report(
    e: &Env,
    issuer_address: Address,
    asset_code: Option<String>,
    reporter_address: Address,
    report_type: ReportType,
    description: String,
    evidence_url: Option<String>,
) -> u64 {
    reporter_address.require_auth();

    let report_id = increment_report_counter(e);
    let current_ledger = e.ledger().sequence() as u64;

    let report = ReportData {
        report_id,
        issuer_address,
        asset_code,
        reporter_address,
        report_type,
        description,
        evidence_url,
        status: ReportStatus::Pending,
        verified_by: None,
        created_at: current_ledger,
        verified_at: None,
    };

    write_report(e, report);
    report_id
}

pub fn verify_report(
    e: &Env,
    report_id: u64,
    verifier_address: Address,
    approved: bool,
) {
    verifier_address.require_auth();

    let mut report = read_report(e, report_id).expect("Report not found");

    // Can only verify pending reports
    match report.status {
        ReportStatus::Pending => {},
        _ => panic!("Can only verify pending reports"),
    }

    let current_ledger = e.ledger().sequence() as u64;
    
    if approved {
        report.status = ReportStatus::Verified;
        report.verified_by = Some(verifier_address.clone());
        report.verified_at = Some(current_ledger);
    } else {
        report.status = ReportStatus::Rejected;
        report.verified_by = Some(verifier_address);
        report.verified_at = Some(current_ledger);
    }

    write_report(e, report);
}

pub fn mark_report_spam(e: &Env, report_id: u64, moderator: Address) {
    moderator.require_auth();

    let mut report = read_report(e, report_id).expect("Report not found");
    
    if matches!(report.status, ReportStatus::Verified) {
        panic!("Cannot mark verified report as spam");
    }

    report.status = ReportStatus::Spam;
    report.verified_by = Some(moderator);
    report.verified_at = Some(e.ledger().sequence() as u64);

    write_report(e, report);
}

# Data Retention Policy (coverage context)

Retention period: 365 days.

Storage tiering:
- Hot: 0–30 days — low-latency block/SSD storage; frequent access for business and audit operations.
- Warm: 31–180 days — cost-optimized storage with moderate retrieval latency.
- Cold: 181–365 days — archival storage (immutable snapshots), retrieval may incur delay and cost.

Encryption and key management:
- All data at rest encrypted using KMS-managed keys.
- KMS key rotation: rotate primary key annually; maintain previous keys for decrypting older data for up to 2 years.
- Enforce least-privilege on KMS key usage via IAM roles.

Transmission and access:
- In-transit: enforce TLS 1.2+ (recommend TLS 1.3) for all endpoints.
- Use mutual TLS for internal service-to-service flows where possible.

Purge process:
- A daily job scans objects older than 365 days and marks them for secure deletion.
- Secure deletion: follow provider secure-delete API or overwrite-and-delete strategy where supported.
- All purge operations are logged with: object id, timestamp, initiating job id, and deletion proof (where provided).
- Retention job must produce verifiable audit artifacts stored in an append-only log for at least 2 years.

Compliance and verification:
- Periodic (monthly) verification to sample deletion proofs and storage snapshots.
- Keep changelog of retention policy updates and KMS rotations.

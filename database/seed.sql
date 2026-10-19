
-- Wilayah penjualan
INSERT INTO regions (name, code) VALUES
('Jakarta', 'JKT'),
('Bandung', 'BDG'),
('Surabaya', 'SBY'),
('Denpasar', 'DPS'),
('Yogyakarta', 'YGY')
ON CONFLICT DO NOTHING;

-- Sales representatives
INSERT INTO sales_reps (sales_code, name, email, region_id)
SELECT v.sales_code, v.name, v.email, r.id
FROM (
    VALUES
        ('SLS-001', 'Andi Saputra', 'andi@example.com', 'JKT'),
        ('SLS-002', 'Dewi Lestari', 'dewi@example.com', 'BDG'),
        ('SLS-003', 'Budi Santoso', 'budi@example.com', 'SBY'),
        ('SLS-004', 'Siti Rahma', 'siti@example.com', 'DPS'),
        ('SLS-005', 'Fajar Ardiansyah', 'fajar@example.com', 'YGY'),
        ('SLS-006', 'Nina Agustina', 'nina@example.com', 'JKT'),
        ('SLS-007', 'Rizky Ananda', 'rizky@example.com', 'BDG'),
        ('SLS-008', 'Dinda Putri', 'dinda@example.com', 'SBY'),
        ('SLS-009', 'Agus Setiawan', 'agus@example.com', 'DPS'),
        ('SLS-010', 'Lina Pratiwi', 'lina@example.com', 'YGY')
) AS v(sales_code, name, email, region_code)
JOIN regions r ON r.code = v.region_code
ON CONFLICT (sales_code) DO NOTHING;

-- Target penjualan Oktober 2026
INSERT INTO sales_targets (
    sales_rep_id,
    period_start,
    period_end,
    target_amount
)
SELECT
    s.id,
    DATE '2026-10-01',
    DATE '2026-10-31',
    v.target_amount
FROM (
    VALUES
        ('SLS-001', 200000000::NUMERIC),
        ('SLS-002', 160000000::NUMERIC),
        ('SLS-003', 200000000::NUMERIC),
        ('SLS-004', 150000000::NUMERIC),
        ('SLS-005', 150000000::NUMERIC),
        ('SLS-006', 150000000::NUMERIC),
        ('SLS-007', 180000000::NUMERIC),
        ('SLS-008', 150000000::NUMERIC),
        ('SLS-009', 150000000::NUMERIC),
        ('SLS-010', 150000000::NUMERIC)
) AS v(sales_code, target_amount)
JOIN sales_reps s ON s.sales_code = v.sales_code
ON CONFLICT (sales_rep_id, period_start, period_end) DO NOTHING;

-- Contoh transaksi penjualan
INSERT INTO sales_transactions (
    transaction_code,
    sales_rep_id,
    region_id,
    amount,
    status,
    transaction_date
)
SELECT
    v.transaction_code,
    s.id,
    s.region_id,
    v.amount,
    'completed',
    v.transaction_date
FROM (
    VALUES
        ('TRX-001', 'SLS-001', 185000000::NUMERIC, TIMESTAMPTZ '2026-10-05 10:00:00+07'),
        ('TRX-002', 'SLS-002', 172000000::NUMERIC, TIMESTAMPTZ '2026-10-06 11:00:00+07'),
        ('TRX-003', 'SLS-003', 143000000::NUMERIC, TIMESTAMPTZ '2026-10-07 12:00:00+07'),
        ('TRX-004', 'SLS-004', 126000000::NUMERIC, TIMESTAMPTZ '2026-10-08 13:00:00+07'),
        ('TRX-005', 'SLS-005', 98000000::NUMERIC, TIMESTAMPTZ '2026-10-09 14:00:00+07'),
        ('TRX-006', 'SLS-006', 112000000::NUMERIC, TIMESTAMPTZ '2026-10-10 10:30:00+07'),
        ('TRX-007', 'SLS-007', 190000000::NUMERIC, TIMESTAMPTZ '2026-10-11 09:30:00+07'),
        ('TRX-008', 'SLS-008', 87000000::NUMERIC, TIMESTAMPTZ '2026-10-12 15:00:00+07'),
        ('TRX-009', 'SLS-009', 160000000::NUMERIC, TIMESTAMPTZ '2026-10-13 11:30:00+07'),
        ('TRX-010', 'SLS-010', 104000000::NUMERIC, TIMESTAMPTZ '2026-10-14 14:30:00+07')
) AS v(transaction_code, sales_code, amount, transaction_date)
JOIN sales_reps s ON s.sales_code = v.sales_code
ON CONFLICT (transaction_code) DO NOTHING;

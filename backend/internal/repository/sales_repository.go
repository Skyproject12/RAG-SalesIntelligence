package repository

import (
	"context"
	"database/sql"
	"fmt"

	"sales-intelligence-backend/internal/model"
)

const salesSelectQuery = `
	SELECT
		sr.id,
		sr.sales_code,
		sr.name,
		sr.email,
		r.name AS region,
		r.code AS region_code,
		sr.is_active,
		COALESCE(st.target_amount, 0)::float8,
		COALESCE(performance.achieved_amount, 0)::float8,
		CASE
			WHEN COALESCE(st.target_amount, 0) > 0
			THEN ROUND(
				COALESCE(performance.achieved_amount, 0)
				/ st.target_amount * 100, 2
			)::float8
			ELSE 0
		END AS achievement_percent
	FROM sales_reps sr
	LEFT JOIN regions r ON r.id = sr.region_id
	LEFT JOIN LATERAL (
		SELECT SUM(target_amount) AS target_amount
		FROM sales_targets
		WHERE sales_rep_id = sr.id
			AND CURRENT_DATE BETWEEN period_start AND period_end
	) st ON TRUE
	LEFT JOIN LATERAL (
		SELECT SUM(t.amount) AS achieved_amount
		FROM sales_transactions t
		WHERE t.sales_rep_id = sr.id
			AND t.status = 'completed'
			AND EXISTS (
				SELECT 1
				FROM sales_targets target
				WHERE target.sales_rep_id = sr.id
					AND t.transaction_date::date
						BETWEEN target.period_start AND target.period_end
					AND CURRENT_DATE
						BETWEEN target.period_start AND target.period_end
			)
	) performance ON TRUE
`

const salesFilterClause = `
	WHERE (
		$1 = ''
		OR sales.name ILIKE '%' || $1 || '%'
		OR sales.sales_code ILIKE '%' || $1 || '%'
	)
	AND ($2 = '' OR sales.region_code = $2)
	AND (
		$3 = ''
		OR ($3 = 'on-track' AND sales.achievement_percent >= 75 AND sales.achievement_percent < 100)
		OR ($3 = 'over-target' AND sales.achievement_percent >= 100)
		OR ($3 = 'below-target' AND sales.achievement_percent < 75)
	)
	AND (
		$4 = ''
		OR ($4 = 'achieved' AND sales.achievement_percent >= 100)
		OR ($4 = 'not-achieved' AND sales.achievement_percent < 100)
	)
`

type SalesFilter struct {
	Search     string
	RegionCode string
	Status     string
	Target     string
	Limit      int
	Offset     int
}

type SalesRepository struct {
	db *sql.DB
}

func NewSalesRepository(db *sql.DB) *SalesRepository {
	return &SalesRepository{db: db}
}

func (r *SalesRepository) List(
	ctx context.Context,
	filter SalesFilter,
) ([]model.Sales, int, error) {
	total, err := r.count(ctx, filter)
	if err != nil {
		return nil, 0, err
	}

	query := `SELECT * FROM (` + salesSelectQuery + `) AS sales` + salesFilterClause + `
		ORDER BY sales.name ASC
		LIMIT $5 OFFSET $6
	`
	rows, err := r.db.QueryContext(
		ctx,
		query,
		filter.Search,
		filter.RegionCode,
		filter.Status,
		filter.Target,
		filter.Limit,
		filter.Offset,
	)
	if err != nil {
		return nil, 0, fmt.Errorf("gagal mengambil data sales: %w", err)
	}
	defer rows.Close()

	sales := make([]model.Sales, 0)
	for rows.Next() {
		item, err := scanSales(rows)
		if err != nil {
			return nil, 0, fmt.Errorf("gagal membaca data sales: %w", err)
		}
		sales = append(sales, item)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("terjadi kesalahan saat membaca data: %w", err)
	}

	return sales, total, nil
}

func (r *SalesRepository) FindByID(
	ctx context.Context,
	id int64,
) (model.Sales, error) {
	query := `SELECT * FROM (` + salesSelectQuery + `) AS sales WHERE sales.id = $1`
	item, err := scanSales(r.db.QueryRowContext(ctx, query, id))
	if err != nil {
		return model.Sales{}, err
	}

	return item, nil
}

func (r *SalesRepository) count(
	ctx context.Context,
	filter SalesFilter,
) (int, error) {
	query := `SELECT COUNT(*) FROM (` + salesSelectQuery + `) AS sales` + salesFilterClause

	var total int
	if err := r.db.QueryRowContext(
		ctx,
		query,
		filter.Search,
		filter.RegionCode,
		filter.Status,
		filter.Target,
	).Scan(&total); err != nil {
		return 0, fmt.Errorf("gagal menghitung data sales: %w", err)
	}

	return total, nil
}

type scanner interface {
	Scan(dest ...any) error
}

func scanSales(row scanner) (model.Sales, error) {
	var item model.Sales
	err := row.Scan(
		&item.ID,
		&item.SalesCode,
		&item.Name,
		&item.Email,
		&item.Region,
		&item.RegionCode,
		&item.IsActive,
		&item.TargetAmount,
		&item.AchievedAmount,
		&item.AchievementPercent,
	)

	return item, err
}

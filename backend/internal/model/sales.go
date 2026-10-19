package model

type Sales struct {
	ID                 int64   `json:"id"`
	SalesCode          string  `json:"sales_code"`
	Name               string  `json:"name"`
	Email              *string `json:"email"`
	Region             *string `json:"region"`
	RegionCode         *string `json:"region_code"`
	IsActive           bool    `json:"is_active"`
	TargetAmount       float64 `json:"target_amount"`
	AchievedAmount     float64 `json:"achieved_amount"`
	AchievementPercent float64 `json:"achievement_percent"`
}

type SalesSummary struct {
	Region                    string  `json:"region"`
	RegionCode                string  `json:"region_code"`
	TotalSalesReps            int     `json:"total_sales_reps"`
	BelowTargetCount          int     `json:"below_target_count"`
	OnTrackCount              int     `json:"on_track_count"`
	OverTargetCount           int     `json:"over_target_count"`
	NotAchievedCount          int     `json:"not_achieved_count"`
	TotalTargetAmount         float64 `json:"total_target_amount"`
	TotalAchievedAmount       float64 `json:"total_achieved_amount"`
	AverageAchievementPercent float64 `json:"average_achievement_percent"`
}

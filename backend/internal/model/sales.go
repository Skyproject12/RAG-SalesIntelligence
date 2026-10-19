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

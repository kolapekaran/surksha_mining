def get_dashboard_stats():
    """Return dashboard data without relying on deleted runtime log files."""
    return {
        "total_events": 0,
        "fire_alerts": 0,
        "status": "ACTIVE",
    }

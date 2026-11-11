
function calculateTaskStats(assignments) {
    const total = assignments.length;

    const completed = assignments.filter(
        task => task.completed === true
    ).length;

    const pending = total - completed;

    return {
        total,
        completed,
        pending
    };
}

module.exports = { calculateTaskStats };

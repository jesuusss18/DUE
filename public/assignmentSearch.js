function isOverdue(task, today = new Date().toLocaleDateString("sv-SE")) {
    return !task.completed && task.dueDate < today;
}

function filterAssignments(
    assignments,
    search = "",
    status = "All",
    priority = "All"
) {
    const query = search.trim().toLowerCase();

    return assignments.filter(task => {
        const title = (task.title || "").toLowerCase();
        const course = (task.course || "").toLowerCase();

        const matchesSearch =
            title.includes(query) ||
            course.includes(query);

        const matchesStatus =
            status === "All" ||
            (status === "Pending" && !task.completed) ||
            (status === "Completed" && task.completed) ||
            (status === "Overdue" && isOverdue(task));

        const matchesPriority =
            priority === "All" ||
            task.priority === priority;

        return matchesSearch && matchesStatus && matchesPriority;
    });
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = { filterAssignments, isOverdue };
}
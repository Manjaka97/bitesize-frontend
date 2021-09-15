const sorted = (items, order) => {
    // Sort the items by name
    if (order === 0) {
        return items.sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
    }
    // Sort the items by closest deadline with null deadline last
    else if (order === 1) {
        return items.sort((a, b) => {
            if (a.deadline === null || a.deadline === '') {
                return 1;
            }
            if (b.deadline === null || b.deadline === '') {
                return -1;
            }
            return a.deadline.localeCompare(b.deadline);
        });
    }
    // Sort the items by farthest deadline with null deadline first
    else if (order === 2) {
        return items.sort((a, b) => {
            if (a.deadline === null || a.deadline === '') {
                return -1;
            }
            if (b.deadline === null || b.deadline === '') {
                return 1;
            }
            return b.deadline.localeCompare(a.deadline);
        });
    }
    // Sort the items by most recently created
    else if (order === 3) {
        return items.sort((a, b) => {
            return b.created_at.localeCompare(a.created_at);
        });
    }
    // Sort the items by least recently created
    else if (order === 4) {
        return items.sort((a, b) => {
            return a.created_at.localeCompare(b.created_at);
        });
    }
    else return items;
}

export default sorted;
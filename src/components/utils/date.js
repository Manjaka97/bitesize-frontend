// Returns the date in a readable format
export const getUserFriendlyDate = (date) => {
    if (date === '' || date === null) {
        return 'No deadline set'
    }
    return new Date(date).toUTCString().substr(0,16)
}

// 86400000 ms = 1 day
// 172800000 = 2 days
// 604800000 ms = 1 week
// 2678400000 ms = 1 month
// 31536000000 ms = 1 year
// Returns the relative date in a readable format
export const getRelativeDate = (date) => {
    if (date === '' || date === null) {
        return ''
    }
    const now = new Date()
    const diff = now.getTime() - (new Date(date).getTime()  + new Date(date).getTimezoneOffset() * 60000)
    if (diff > 0) {
        if (diff < 86400000) {
            return 'Today'
        } else if (diff < 172800000) {
            return 'Yesterday'
        } else if (diff < 604800000) {
            return 'Less than a week ago'
        } else if (diff < 2678400000) {
            return 'Less than a month ago'
        } else if (diff < 31536000000) {
            return 'More than a month ago'
        } else {
            return 'More than a year ago'
        }
    } else {
        if (diff > -86400000) {
            return 'Tomorrow'
        } else if (diff > -172800000) {
            return 'In two days'
        } else if (diff > -604800000) {
            return 'In less than a week'
        } else if (diff > -604800000*2) {
            return 'In less than two weeks'
        } else if (diff > -2678400000) {
            return 'In less than a month'
        } else if (diff > -31536000000) {
            return 'In less than a year'
        } else {
            return 'In more than a year'
        }
    }
}

// Returns true if the date is in the past
export const missedDeadline = (deadline) => {
    if (deadline === '' || deadline === null) {
        return false
    }
    const now = new Date()
    const diff = now.getTime() - (new Date(deadline).getTime()  + new Date(deadline).getTimezoneOffset() * 60000)
    return diff > 86400000
}
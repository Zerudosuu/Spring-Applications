package com.taskmanager.taskmanager.shared.enums;

public enum ActionType {
    CREATED,        // ticket was created
    ASSIGNED,       // ticket was assigned on creation
    REASSIGNED,     // ticket was reassigned to different user
    STATUS_CHANGED, // ticket status was updated
    COMMENTED,      // comment was added
    CLOSED          // ticket was closed
}

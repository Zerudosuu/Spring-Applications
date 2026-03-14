package com.taskmanager.taskmanager.feature.task.dto;


import com.taskmanager.taskmanager.shared.enums.Priority;
import com.taskmanager.taskmanager.shared.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponseDTO {

    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private Priority priority;
    private LocalDateTime dueDate;
    private LocalDateTime createdDate;
    private Long userId;
    private String userName;
}

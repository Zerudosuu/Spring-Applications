package com.taskmanager.taskmanager.feature.task;


import com.taskmanager.taskmanager.feature.task.dto.TaskRequestDTO;
import com.taskmanager.taskmanager.feature.task.dto.TaskResponseDTO;
import com.taskmanager.taskmanager.shared.enums.Priority;
import com.taskmanager.taskmanager.shared.enums.TaskStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<TaskResponseDTO> create(@RequestBody @Valid TaskRequestDTO taskRequestDTO, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(taskRequestDTO, authentication));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> getById(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(taskService.getTaskById(id, authentication));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TaskResponseDTO>> getByUser(
            @PathVariable Long userId,
            Authentication authentication,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) Priority priority) {
        return ResponseEntity.ok(taskService.getTasksByUser(userId, status, priority, authentication));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> update(@PathVariable Long id, @RequestBody @Valid TaskRequestDTO taskRequestDTO, Authentication authentication) {
        return ResponseEntity.ok(taskService.updateTask(id, taskRequestDTO, authentication));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> delete(@PathVariable Long id, Authentication authentication) {
        taskService.deleteTasks(id, authentication);

        return ResponseEntity.noContent().build();
    }

}

package com.taskmanager.taskmanager.feature.task;

import com.taskmanager.taskmanager.feature.task.dto.TaskRequestDTO;
import com.taskmanager.taskmanager.feature.task.dto.TaskResponseDTO;
import com.taskmanager.taskmanager.feature.user.User;
import com.taskmanager.taskmanager.feature.user.UserRepository;
import com.taskmanager.taskmanager.shared.enums.Priority;
import com.taskmanager.taskmanager.shared.enums.TaskStatus;
import com.taskmanager.taskmanager.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    private TaskResponseDTO toResponseDto(Task task) {
        TaskResponseDTO taskResponseDTO = new TaskResponseDTO();
        taskResponseDTO.setId(task.getId());
        taskResponseDTO.setTitle(task.getTitle());
        taskResponseDTO.setDescription(task.getDescription());
        taskResponseDTO.setStatus(task.getStatus());
        taskResponseDTO.setPriority(task.getPriority());
        taskResponseDTO.setDueDate(task.getDueDate());
        taskResponseDTO.setCreatedDate(task.getCreatedAt());
        taskResponseDTO.setUserId(task.getUser().getId());
        taskResponseDTO.setUserName(task.getUser().getName());

        return taskResponseDTO;
    }

    private Task toEntity(TaskRequestDTO dto, User user) {
        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setStatus(dto.getStatus() != null ? dto.getStatus() : TaskStatus.TODO);
        task.setPriority(dto.getPriority() != null ? dto.getPriority() : Priority.MEDIUM);
        task.setDueDate(dto.getDueDate());
        task.setUser(user);

        return task;
    }

    public TaskResponseDTO createTask(TaskRequestDTO dto) {
        User user = userRepository.findById(dto.getUserId()).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Task saved = taskRepository.save(toEntity(dto, user));

        return toResponseDto(saved);
    }

    public TaskResponseDTO getTaskById(Long taskId) {
        Task task = taskRepository.findById(taskId).orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        return toResponseDto(task);
    }

    public List<TaskResponseDTO> getTasksByUser(Long userId, TaskStatus status, Priority priority) {
        List<Task> tasks;

        if (status != null && priority != null) {
            tasks = taskRepository.findByUserIdAndStatusAndPriority(userId, status, priority);
        } else if (status != null) {
            tasks = taskRepository.findByUserIdAndStatus(userId, status);
        } else if (priority != null) {
            tasks = taskRepository.findByUserIdAndPriority(userId, priority);
        } else {
            tasks = taskRepository.findByUserId(userId);
        }

        return tasks.stream().map(this::toResponseDto).collect(Collectors.toList());
    }

    public TaskResponseDTO updateTask(Long taskId, TaskRequestDTO dto) {
        Task task = taskRepository.findById(taskId).orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        if (dto.getStatus() != null) task.setStatus(dto.getStatus());
        if (dto.getPriority() != null) task.setPriority(dto.getPriority());
        if (dto.getDueDate() != null) task.setDueDate(dto.getDueDate());

        return toResponseDto(taskRepository.save(task));
    }

    public void deleteTasks(Long id) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        taskRepository.delete(task);

    }


}

package com.taskmanager.taskmanager.feature.activitylog;


import com.taskmanager.taskmanager.feature.activitylog.dto.ActivityLogResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/activity-logs")
public class ActivityLogController {
    private final ActivityLogService activityLogService;

    @GetMapping("/ticket/{id}")
    public ResponseEntity<List<ActivityLogResponseDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(activityLogService.getActivityLogsForTicket(id));
    }
}

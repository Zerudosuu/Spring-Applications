package com.taskmanager.taskmanager.feature.activitylog;


import com.taskmanager.taskmanager.feature.activitylog.dto.ActivityLogResponseDTO;
import com.taskmanager.taskmanager.feature.ticket.Ticket;
import com.taskmanager.taskmanager.feature.user.User;
import com.taskmanager.taskmanager.shared.enums.ActionType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public void log(
            Ticket ticket,
            User performedBy,
            ActionType action,
            String oldValue,
            String newValue
    ) {
        ActivityLog log = ActivityLog.builder()
                .ticket(ticket)
                .performedBy(performedBy)
                .actionType(action)
                .oldValue(oldValue)
                .newValue(newValue)
                .build();

        activityLogRepository.save(log);
    }

    public List<ActivityLogResponseDTO> getActivityLogsForTicket(Long ticketId) {
        return activityLogRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(this::responseDTO)
                .collect(Collectors.toList());
    }


    //Mapper
    public ActivityLogResponseDTO responseDTO (ActivityLog log) {
        return ActivityLogResponseDTO.builder()
                .id(log.getId())
                .ticketId(log.getTicket().getId())
                .performedById(log.getPerformedBy().getId())
                .performedByName(log.getPerformedBy().getName())
                .action(log.getActionType())
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .createdAt(log.getCreatedAt())
                .build();
    }
}

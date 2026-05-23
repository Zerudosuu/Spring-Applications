package com.taskmanager.taskmanager.feature.user.dto;


import com.taskmanager.taskmanager.shared.enums.Role;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Data
public class UserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private Boolean emailVerified;
    private LocalDateTime emailVerifiedAt;
    private LocalDateTime createdDate;
}

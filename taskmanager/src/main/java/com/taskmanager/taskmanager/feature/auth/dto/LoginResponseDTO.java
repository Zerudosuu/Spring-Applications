package com.taskmanager.taskmanager.feature.auth.dto;

import com.taskmanager.taskmanager.shared.enums.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {
    private long id;
    private String name;
    private String email;
    private Role role;
    private String message;
}

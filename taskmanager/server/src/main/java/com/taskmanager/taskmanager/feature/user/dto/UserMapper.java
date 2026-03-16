package com.taskmanager.taskmanager.feature.user.dto;

import com.taskmanager.taskmanager.feature.user.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponseDTO toDTo(User user);
    User toEntity(UserRequestDTO userRequestDTO);
}

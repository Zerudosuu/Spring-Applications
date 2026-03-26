package com.taskmanager.taskmanager.feature.user;


import com.taskmanager.taskmanager.feature.user.dto.UserMapper;
import com.taskmanager.taskmanager.feature.user.dto.UserRequestDTO;
import com.taskmanager.taskmanager.feature.user.dto.UserResponseDTO;
import com.taskmanager.taskmanager.shared.enums.Role;
import com.taskmanager.taskmanager.shared.exception.DuplicateResourceException;
import com.taskmanager.taskmanager.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    // Convert Entity → ResponseDTO
    private UserResponseDTO toResponseDTO(User user) {
        UserResponseDTO userResponseDTO = new UserResponseDTO();
        userResponseDTO.setId(user.getId());
        userResponseDTO.setName(user.getName());
        userResponseDTO.setEmail(user.getEmail());
        userResponseDTO.setRole(user.getRole());
        userResponseDTO.setCreatedDate(user.getCreatedAt());
        return userResponseDTO;
    }

    // Convert RequestDTO → Entity
    private User toEntity(UserRequestDTO userRequestDTO) {
        User user = new User();
        user.setName(userRequestDTO.getName());
        user.setEmail(userRequestDTO.getEmail());
        user.setPassword(userRequestDTO.getPassword());
        return user;
    }

    public UserResponseDTO createUser(UserRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("Email already in use");
        }
        // uncomment if using mapper
        //User user = userMapper.toEntity(dto);
        User user = toEntity(dto);
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        User saved = userRepository.save(user);
        // uncomment if using mapper
//        return userMapper.toDTo(saved);

     return toResponseDTO(saved);
    }

    public UserResponseDTO updateUserRole(Long id, Role role) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(role);
        return toResponseDTO(userRepository.save(user));
        // uncomment if using mapper
     // return userMapper.toDTO(userRepository.save(user));
    }

    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toResponseDTO(user);

        // uncomment if using mapper
        //return userMapper.toDTO(user);
    }

    public UserResponseDTO updateUser(UserRequestDTO dto) {
        User saved = userRepository.save(toEntity(dto));
        return toResponseDTO(saved);

        // uncomment if using mapper
        //return userMapper.toDTO(user);;
    }

    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    public UserResponseDTO deleteUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userRepository.delete(user);
        return toResponseDTO(user);

        // uncomment if using mapper
        //return userMapper.toDTO(user);
    }
}

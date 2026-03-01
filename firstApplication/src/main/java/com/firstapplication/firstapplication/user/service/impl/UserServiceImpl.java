package com.firstapplication.firstapplication.user.service.impl;

import com.firstapplication.firstapplication.user.repository.RoleRepository;
import com.firstapplication.firstapplication.user.repository.UserRepository;
import com.firstapplication.firstapplication.user.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserServiceImpl(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }


    @Override
    public String getWelcomeMessage(String username) {
        return userRepository.findByUsername(username).map(user -> "Welcome" + user.getUsername() + "!")
                .orElse("Welcome Guest!");
    }
}

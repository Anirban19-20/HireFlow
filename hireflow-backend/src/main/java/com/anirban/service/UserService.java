package com.anirban.service;

import com.anirban.entity.User;

import java.util.List;

public interface UserService {

    User createUser(User user);

    User getUserById(Long id);

    User getUserByEmail(String email);

    List<User> getAllUsers();

    boolean existsByEmail(String email);
}
package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.entity.Group;

public interface GroupRepository extends JpaRepository<Group, Integer> {
}

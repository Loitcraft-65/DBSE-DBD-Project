package com.example.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.entity.Group;
import com.example.repository.GroupRepository;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "http://localhost:5173")
public class GroupController {

    private final GroupRepository groupRepository;

    public GroupController(GroupRepository groupRepository) {
        this.groupRepository = groupRepository;
    }

    @GetMapping
    public List<Group> getGroups() {
        return groupRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Group> getGroup(@PathVariable Integer id) {
        return groupRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createGroup(@RequestBody Group group) {
        if (group.getGroupName() == null || group.getGroupName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Group name is required."));
        }
        return ResponseEntity.ok(groupRepository.save(group));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateGroup(@PathVariable Integer id, @RequestBody Group incoming) {
        return groupRepository.findById(id).<ResponseEntity<?>>map(existing -> {
            if (incoming.getGroupName() != null) existing.setGroupName(incoming.getGroupName());
            if (incoming.getMonthlyBudget() != null) existing.setMonthlyBudget(incoming.getMonthlyBudget());
            return ResponseEntity.ok(groupRepository.save(existing));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Integer id) {
        if (!groupRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        groupRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

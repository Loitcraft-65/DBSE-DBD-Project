package com.example.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.entity.Expense;
import com.example.repository.ExpenseRepository;
import com.example.repository.GroupRepository;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "http://localhost:5173")
public class ExpenseController {

    private final ExpenseRepository expenseRepository;
    private final GroupRepository groupRepository;

    public ExpenseController(ExpenseRepository expenseRepository, GroupRepository groupRepository) {
        this.expenseRepository = expenseRepository;
        this.groupRepository = groupRepository;
    }

    @GetMapping
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    @GetMapping("/group/{groupId}")
    public List<Expense> getGroupExpenses(@PathVariable Integer groupId) {
        return expenseRepository.findByGroupIdOrderByExpenseDateDesc(groupId);
    }

    @PostMapping
    public ResponseEntity<?> addExpense(@RequestBody Expense expense) {
        if (expense.getGroupId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "groupId is required."));
        }
        if (expense.getPaidBy() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "paidBy is required."));
        }
        if (expense.getAmount() == null || expense.getAmount().signum() <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Amount must be greater than zero."));
        }
        if (!groupRepository.existsById(expense.getGroupId())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Group " + expense.getGroupId() + " does not exist."));
        }

        try {
            return ResponseEntity.ok(expenseRepository.save(expense));
        } catch (Exception ex) {
            Throwable root = ex;
            while (root.getCause() != null) {
                root = root.getCause();
            }
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Could not save expense: " + root.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Integer id) {
        if (!expenseRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        expenseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

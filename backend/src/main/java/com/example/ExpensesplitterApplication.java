package com.example;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.example.entity.UserAccount;
import com.example.repository.UserAccountRepository;

@SpringBootApplication
public class ExpensesplitterApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExpensesplitterApplication.class, args);
    }

    // Only seeds the demo login account. Groups are no longer seeded here —
    // create them from the app itself (they will get real, valid IDs).
    @Bean
    CommandLineRunner seed(UserAccountRepository userRepository) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {
                UserAccount user = new UserAccount();
                user.setName("Wallet Admin");
                user.setUsername("admin");
                user.setPassword("admin123");
                user.setDisplayName("Wallet Admin");
                userRepository.save(user);
            }
        };
    }
}

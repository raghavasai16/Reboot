package OnBoard_HR.AI.HR.repository;

import OnBoard_HR.AI.HR.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByEmail(String email);
    User findByEmail(String email);
} 
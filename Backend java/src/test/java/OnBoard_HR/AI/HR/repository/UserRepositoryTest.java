package OnBoard_HR.AI.HR.repository;

import OnBoard_HR.AI.HR.entity.User;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class UserRepositoryTest {
    @Test
    void testExistsByEmail() {
        UserRepository repo = mock(UserRepository.class);
        when(repo.existsByEmail("john@example.com")).thenReturn(true);
        assertTrue(repo.existsByEmail("john@example.com"));
    }

    @Test
    void testFindByEmail() {
        UserRepository repo = mock(UserRepository.class);
        User u = new User();
        when(repo.findByEmail("john@example.com")).thenReturn(u);
        assertEquals(u, repo.findByEmail("john@example.com"));
    }
} 
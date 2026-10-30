package com.fleetiq.repository;

import com.fleetiq.entity.AiChatMessage;
import com.fleetiq.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiChatMessageRepository extends JpaRepository<AiChatMessage, Long> {
    List<AiChatMessage> findTop50ByUserOrderByCreatedAtAsc(User user);
    List<AiChatMessage> findTop50ByOrderByCreatedAtAsc();
    void deleteByUser(User user);
}

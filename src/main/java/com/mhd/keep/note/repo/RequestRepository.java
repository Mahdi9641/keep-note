package com.mhd.keep.note.repo;

import com.mhd.keep.note.domain.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {
    List<Request> findByUserId(String userId);
    List<Request> findByProUserFalse();
    List<Request> findByUserIdAndProUserTrue(String userId);
}
